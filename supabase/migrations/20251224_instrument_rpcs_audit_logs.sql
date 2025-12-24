-- Migration: Instrument RPCs with Audit Logging
-- Purpose: Add transactional audit logging to all critical write operations
-- Security: Logs roll back with failed operations, RLS enforced

-- ============================================
-- RPC: invite_company_user
-- ============================================

CREATE OR REPLACE FUNCTION invite_company_user(
  user_email TEXT,
  role_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_company_id UUID;
  invite_id UUID;
BEGIN
  -- Get active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  IF active_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company';
  END IF;

  -- Create invite (simplified - actual logic may vary)
  INSERT INTO company_invites (company_id, email, role, status)
  VALUES (active_company_id, user_email, role_key, 'pending')
  RETURNING id INTO invite_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, company_id, metadata)
  VALUES (
    'invite_user',
    auth.uid(),
    active_company_id,
    jsonb_build_object('email', user_email, 'role', role_key, 'invite_id', invite_id)
  );
END;
$$;

-- ============================================
-- RPC: cancel_company_invite
-- ============================================

CREATE OR REPLACE FUNCTION cancel_company_invite(
  invite_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_company_id UUID;
  invite_email TEXT;
  invite_role TEXT;
BEGIN
  -- Get active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  IF active_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company';
  END IF;

  -- Get invite details and validate ownership
  SELECT email, role INTO invite_email, invite_role
  FROM company_invites
  WHERE id = invite_id AND company_id = active_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or access denied';
  END IF;

  -- Cancel invite
  UPDATE company_invites
  SET status = 'cancelled'
  WHERE id = invite_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, company_id, metadata)
  VALUES (
    'cancel_invite',
    auth.uid(),
    active_company_id,
    jsonb_build_object('email', invite_email, 'role', invite_role, 'invite_id', invite_id)
  );
END;
$$;

-- ============================================
-- RPC: accept_company_invite
-- ============================================

CREATE OR REPLACE FUNCTION accept_company_invite(
  invite_token TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_company_id UUID;
  invite_role TEXT;
  invite_id UUID;
BEGIN
  -- Get invite details by token (simplified)
  SELECT id, company_id, role INTO invite_id, invite_company_id, invite_role
  FROM company_invites
  WHERE token = invite_token AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  -- Create company_user relationship
  INSERT INTO company_users (user_id, company_id, role)
  VALUES (auth.uid(), invite_company_id, invite_role)
  ON CONFLICT (user_id, company_id) DO NOTHING;

  -- Mark invite as accepted
  UPDATE company_invites
  SET status = 'accepted'
  WHERE id = invite_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'accept_invite',
    auth.uid(),
    auth.uid(),
    invite_company_id,
    jsonb_build_object('role', invite_role, 'invite_id', invite_id)
  );
END;
$$;

-- ============================================
-- RPC: add_company_user
-- ============================================

CREATE OR REPLACE FUNCTION add_company_user(
  user_email TEXT,
  role_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_company_id UUID;
  target_user_id UUID;
BEGIN
  -- Get active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  IF active_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company';
  END IF;

  -- Get user ID by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Add user to company
  INSERT INTO company_users (user_id, company_id, role)
  VALUES (target_user_id, active_company_id, role_key)
  ON CONFLICT (user_id, company_id) DO UPDATE SET role = role_key;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'add_user',
    auth.uid(),
    target_user_id,
    active_company_id,
    jsonb_build_object('email', user_email, 'role', role_key)
  );
END;
$$;

-- ============================================
-- RPC: update_company_user_role
-- ============================================

CREATE OR REPLACE FUNCTION update_company_user_role(
  user_id UUID,
  role_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_company_id UUID;
  previous_role TEXT;
  user_email TEXT;
BEGIN
  -- Get active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  IF active_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company';
  END IF;

  -- Get previous role and validate
  SELECT role INTO previous_role
  FROM company_users
  WHERE company_users.user_id = update_company_user_role.user_id
    AND company_users.company_id = active_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in company';
  END IF;

  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = update_company_user_role.user_id;

  -- Update role
  UPDATE company_users
  SET role = role_key
  WHERE company_users.user_id = update_company_user_role.user_id
    AND company_users.company_id = active_company_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'update_user_role',
    auth.uid(),
    update_company_user_role.user_id,
    active_company_id,
    jsonb_build_object('email', user_email, 'previous_role', previous_role, 'new_role', role_key)
  );
END;
$$;

-- ============================================
-- RPC: remove_company_user
-- ============================================

CREATE OR REPLACE FUNCTION remove_company_user(
  user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_company_id UUID;
  user_role TEXT;
  user_email TEXT;
BEGIN
  -- Get active company
  SELECT company_id INTO active_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  IF active_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company';
  END IF;

  -- Get user details and validate
  SELECT role INTO user_role
  FROM company_users
  WHERE company_users.user_id = remove_company_user.user_id
    AND company_users.company_id = active_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in company';
  END IF;

  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = remove_company_user.user_id;

  -- Remove user from company
  DELETE FROM company_users
  WHERE company_users.user_id = remove_company_user.user_id
    AND company_users.company_id = active_company_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'remove_user',
    auth.uid(),
    remove_company_user.user_id,
    active_company_id,
    jsonb_build_object('email', user_email, 'role', user_role)
  );
END;
$$;

-- ============================================
-- RPC: set_active_company
-- ============================================

CREATE OR REPLACE FUNCTION set_active_company(
  company_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  previous_company_id UUID;
  company_name TEXT;
BEGIN
  -- Validate user belongs to target company
  IF NOT EXISTS (
    SELECT 1 FROM company_users
    WHERE user_id = auth.uid() AND company_users.company_id = set_active_company.company_id
  ) THEN
    RAISE EXCEPTION 'User does not belong to this company';
  END IF;

  -- Get previous company
  SELECT user_active_company.company_id INTO previous_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();

  -- Get company name
  SELECT name INTO company_name
  FROM companies
  WHERE id = set_active_company.company_id;

  -- Update active company
  INSERT INTO user_active_company (user_id, company_id, updated_at)
  VALUES (auth.uid(), set_active_company.company_id, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET company_id = set_active_company.company_id, updated_at = NOW();

  -- Audit log (in NEW company context)
  INSERT INTO audit_logs (action_type, actor_user_id, company_id, metadata)
  VALUES (
    'switch_company',
    auth.uid(),
    set_active_company.company_id,
    jsonb_build_object(
      'company_name', company_name,
      'previous_company_id', previous_company_id,
      'new_company_id', set_active_company.company_id
    )
  );
END;
$$;

COMMENT ON FUNCTION invite_company_user IS 'Invite user to company with audit logging';
COMMENT ON FUNCTION cancel_company_invite IS 'Cancel pending invite with audit logging';
COMMENT ON FUNCTION accept_company_invite IS 'Accept company invite with audit logging';
COMMENT ON FUNCTION add_company_user IS 'Add user to company with audit logging';
COMMENT ON FUNCTION update_company_user_role IS 'Update user role with audit logging';
COMMENT ON FUNCTION remove_company_user IS 'Remove user from company with audit logging';
COMMENT ON FUNCTION set_active_company IS 'Switch active company with audit logging';
