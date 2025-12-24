-- ============================================
-- MIGRATION: Branch-Aware Views (CORRECTED)
-- ============================================
-- Purpose: Create NEW views that are branch-aware
-- Rule: Do NOT modify existing views
-- Compatible with CURRENT database schema
-- ============================================

BEGIN;

-- ============================================
-- view_clients_branch
-- ============================================

CREATE OR REPLACE VIEW view_clients_branch AS
SELECT
    c.id,
    c.company_id,
    c.branch_id,
    c.full_name,
    c.active,
    c.created_at
FROM clients c
WHERE c.company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
);

ALTER VIEW view_clients_branch SET (security_invoker = true);

COMMENT ON VIEW view_clients_branch
IS 'Clients filtered by company_id and branch_id (branch-aware)';

-- ============================================
-- view_professionals_branch
-- ============================================

CREATE OR REPLACE VIEW view_professionals_branch AS
SELECT
    p.id,
    p.company_id,
    p.branch_id,
    pr.full_name,
    pr.email,
    p.active,
    p.created_at
FROM professionals p
LEFT JOIN profiles pr ON pr.id = p.profile_id
WHERE p.company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
);

ALTER VIEW view_professionals_branch SET (security_invoker = true);

COMMENT ON VIEW view_professionals_branch
IS 'Professionals filtered by company_id and branch_id (branch-aware)';

-- ============================================
-- view_appointments_branch
-- ============================================

CREATE OR REPLACE VIEW view_appointments_branch AS
SELECT
    a.id,
    a.company_id,
    a.branch_id,
    a.client_id,
    a.professional_id,
    a.start_time,
    a.end_time,
    a.created_at,
    c.full_name AS client_name,
    pr.full_name AS professional_name,
    pr.email AS professional_email
FROM appointments a
LEFT JOIN clients c ON c.id = a.client_id
LEFT JOIN professionals p ON p.id = a.professional_id
LEFT JOIN profiles pr ON pr.id = p.profile_id
WHERE a.company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
);

ALTER VIEW view_appointments_branch SET (security_invoker = true);

COMMENT ON VIEW view_appointments_branch
IS 'Appointments filtered by company_id and branch_id (branch-aware)';

-- ============================================
-- view_daily_agenda_branch
-- ============================================

CREATE OR REPLACE VIEW view_daily_agenda_branch AS
SELECT
    a.id AS appointment_id,
    a.company_id,
    a.branch_id,
    a.professional_id,
    a.client_id,
    a.start_time,
    a.end_time,
    DATE(a.start_time) AS date,
    EXTRACT(HOUR FROM a.start_time) AS hour,
    EXTRACT(MINUTE FROM a.start_time) AS minute,
    c.full_name AS client_name,
    pr.full_name AS professional_name,
    pr.email AS professional_email
FROM appointments a
LEFT JOIN clients c ON c.id = a.client_id
LEFT JOIN professionals p ON p.id = a.professional_id
LEFT JOIN profiles pr ON pr.id = p.profile_id
WHERE a.company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
);

ALTER VIEW view_daily_agenda_branch SET (security_invoker = true);

COMMENT ON VIEW view_daily_agenda_branch
IS 'Daily agenda filtered by company_id and branch_id (branch-aware)';

-- ============================================
-- view_my_branches
-- ============================================

CREATE OR REPLACE VIEW view_my_branches AS
SELECT
    b.id,
    b.company_id,
    b.name,
    b.created_at,
    COUNT(DISTINCT c.id) AS client_count,
    COUNT(DISTINCT p.id) AS professional_count
FROM branches b
LEFT JOIN clients c ON c.branch_id = b.id
LEFT JOIN professionals p ON p.branch_id = b.id
WHERE b.company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
)
GROUP BY b.id, b.company_id, b.name, b.created_at
ORDER BY b.name ASC;

ALTER VIEW view_my_branches SET (security_invoker = true);

COMMENT ON VIEW view_my_branches
IS 'Branches of the active company with aggregated counts';

COMMIT;
