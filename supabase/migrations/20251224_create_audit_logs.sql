-- Migration: Create Audit Logs System
-- Purpose: Track all critical administrative actions for traceability
-- Security: RLS enforced by company_id

-- ============================================
-- TABLE: audit_logs
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT restricted to active company
CREATE POLICY select_audit_logs_by_active_company
ON audit_logs
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- Note: No INSERT/UPDATE/DELETE policies for frontend
-- Logging happens ONLY in RPC functions (server-side)

-- ============================================
-- VIEW: view_audit_logs
-- ============================================

CREATE OR REPLACE VIEW view_audit_logs AS
SELECT
  al.id,
  al.action_type,
  al.actor_user_id,
  au.email AS actor_email,
  au.raw_user_meta_data->>'full_name' AS actor_name,
  al.target_user_id,
  tu.email AS target_email,
  tu.raw_user_meta_data->>'full_name' AS target_name,
  al.company_id,
  al.metadata,
  al.created_at
FROM audit_logs al
LEFT JOIN auth.users au ON al.actor_user_id = au.id
LEFT JOIN auth.users tu ON al.target_user_id = tu.id
ORDER BY al.created_at DESC;

-- ============================================
-- LOGGING PATTERN FOR RPCs
-- ============================================

-- All write RPCs that perform critical actions MUST log audit entries.
-- Pattern:
--
-- INSERT INTO audit_logs (action_type, actor_user_id, target_user_id, company_id, metadata)
-- VALUES (
--   'action_identifier',
--   auth.uid(),
--   target_user_id_if_applicable,
--   active_company_id,
--   jsonb_build_object('key', 'value', ...)
-- );
--
-- Example actions to log:
-- - 'invite_user' (invite_company_user)
-- - 'cancel_invite' (cancel_company_invite)
-- - 'accept_invite' (accept_company_invite)
-- - 'add_user' (add_company_user)
-- - 'update_user_role' (update_company_user_role)
-- - 'remove_user' (remove_company_user)
-- - 'switch_company' (set_active_company)
--
-- Metadata should include relevant context:
-- - email (for invites)
-- - role (for role changes)
-- - previous_role / new_role (for updates)
-- - company_id (for company switches)
--
-- Implementation of logging in existing RPCs is a follow-up task.
-- This migration establishes the foundation.

COMMENT ON TABLE audit_logs IS 'Immutable audit trail of critical administrative actions';
COMMENT ON VIEW view_audit_logs IS 'Read-only view of audit logs with user details, company-scoped via RLS';
