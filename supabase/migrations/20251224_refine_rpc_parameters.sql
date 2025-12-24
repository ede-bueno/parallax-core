-- Migration: Refine RPC Parameters
-- Purpose: Standardize parameter naming for consistency and readability
-- Changes: Rename role_key → user_role for clarity

-- ============================================
-- RPC: invite_company_user (refined)
-- ============================================

CREATE OR REPLACE FUNCTION invite_company_user(
  user_email TEXT,
  user_role TEXT
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

  -- Create invite
  INSERT INTO company_invites (company_id, email, role, status)
  VALUES (active_company_id, user_email, user_role, 'pending')
  RETURNING id INTO invite_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, company_id, metadata)
  VALUES (
    'invite_user',
    auth.uid(),
    active_company_id,
    jsonb_build_object('email', user_email, 'role', user_role, 'invite_id', invite_id)
  );
END;
$$;

-- ============================================
-- RPC: add_company_user (refined)
-- ============================================

CREATE OR REPLACE FUNCTION add_company_user(
  user_email TEXT,
  user_role TEXT
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
  VALUES (target_user_id, active_company_id, user_role)
  ON CONFLICT (user_id, company_id) DO UPDATE SET role = user_role;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'add_user',
    auth.uid(),
    target_user_id,
    active_company_id,
    jsonb_build_object('email', user_email, 'role', user_role)
  );
END;
$$;

-- ============================================
-- RPC: update_company_user_role (refined)
-- ============================================

CREATE OR REPLACE FUNCTION update_company_user_role(
  target_user_id UUID,
  new_role TEXT
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
  WHERE user_id = target_user_id
    AND company_id = active_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found in company';
  END IF;

  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;

  -- Update role
  UPDATE company_users
  SET role = new_role
  WHERE user_id = target_user_id
    AND company_id = active_company_id;

  -- Audit log
  INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
  VALUES (
    'update_user_role',
    auth.uid(),
    target_user_id,
    active_company_id,
    jsonb_build_object('email', user_email, 'previous_role', previous_role, 'new_role', new_role)
  );
END;
$$;

COMMENT ON FUNCTION invite_company_user IS 'Invite user to company with audit logging (refined parameters)';
COMMENT ON FUNCTION add_company_user IS 'Add user to company with audit logging (refined parameters)';
COMMENT ON FUNCTION update_company_user_role IS 'Update user role with audit logging (refined parameters)';
