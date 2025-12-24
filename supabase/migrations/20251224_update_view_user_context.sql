-- ============================================
-- UPDATE: view_user_context
-- ============================================
-- Purpose: Expose branch_id to frontend
-- ============================================

BEGIN;

CREATE OR REPLACE VIEW view_user_context AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    uac.company_id,
    c.name as company_name,
    uac.branch_id,
    cu.role
FROM auth.users u
LEFT JOIN user_active_company uac ON uac.user_id = u.id
LEFT JOIN companies c ON c.id = uac.company_id
LEFT JOIN company_users cu ON cu.user_id = u.id AND cu.company_id = uac.company_id
WHERE u.id = auth.uid();

-- RLS
ALTER VIEW view_user_context SET (security_invoker = true);

COMMENT ON VIEW view_user_context IS 'User context including active company and branch';

COMMIT;
