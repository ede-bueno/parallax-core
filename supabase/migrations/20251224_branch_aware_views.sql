-- ============================================
-- MIGRATION: Branch-Aware Views
-- ============================================
-- Purpose: Create NEW views that filter by branch
-- Rule: Do NOT modify existing views
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
    c.email,
    c.phone,
    c.cpf,
    c.birth_date,
    c.address,
    c.city,
    c.state,
    c.zip_code,
    c.notes,
    c.created_at,
    c.updated_at
FROM clients c
WHERE c.company_id IN (
    SELECT company_id FROM user_active_company WHERE user_id = auth.uid()
);

-- RLS on view
ALTER VIEW view_clients_branch SET (security_invoker = true);

COMMENT ON VIEW view_clients_branch IS 'Clients filtered by company_id and branch_id - for branch-aware queries';

-- ============================================
-- view_professionals_branch
-- ============================================

CREATE OR REPLACE VIEW view_professionals_branch AS
SELECT 
    p.id,
    p.company_id,
    p.branch_id,
    p.full_name,
    p.email,
    p.phone,
    p.specialty,
    p.avatar_url,
    p.created_at,
    p.updated_at
FROM professionals p
WHERE p.company_id IN (
    SELECT company_id FROM user_active_company WHERE user_id = auth.uid()
);

-- RLS on view
ALTER VIEW view_professionals_branch SET (security_invoker = true);

COMMENT ON VIEW view_professionals_branch IS 'Professionals filtered by company_id and branch_id - for branch-aware queries';

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
    a.scheduled_at,
    a.duration_minutes,
    a.status,
    a.notes,
    a.created_at,
    a.updated_at,
    c.full_name as client_name,
    p.full_name as professional_name,
    p.specialty as professional_specialty
FROM appointments a
LEFT JOIN clients c ON c.id = a.client_id
LEFT JOIN professionals p ON p.id = a.professional_id
WHERE a.company_id IN (
    SELECT company_id FROM user_active_company WHERE user_id = auth.uid()
);

-- RLS on view
ALTER VIEW view_appointments_branch SET (security_invoker = true);

COMMENT ON VIEW view_appointments_branch IS 'Appointments filtered by company_id and branch_id - for branch-aware queries';

-- ============================================
-- view_daily_agenda_branch
-- ============================================

CREATE OR REPLACE VIEW view_daily_agenda_branch AS
SELECT
    a.id as appointment_id,
    a.company_id,
    a.branch_id,
    a.professional_id,
    a.client_id,
    a.scheduled_at,
    a.duration_minutes,
    a.status,
    a.notes,
    p.full_name as professional_name,
    p.specialty as professional_specialty,
    p.avatar_url as professional_avatar,
    c.full_name as client_name,
    c.phone as client_phone,
    DATE(a.scheduled_at) as date,
    EXTRACT(HOUR FROM a.scheduled_at) as hour,
    EXTRACT(MINUTE FROM a.scheduled_at) as minute
FROM appointments a
LEFT JOIN professionals p ON p.id = a.professional_id
LEFT JOIN clients c ON c.id = a.client_id
WHERE a.company_id IN (
    SELECT company_id FROM user_active_company WHERE user_id = auth.uid()
);

-- RLS on view
ALTER VIEW view_daily_agenda_branch SET (security_invoker = true);

COMMENT ON VIEW view_daily_agenda_branch IS 'Daily agenda filtered by company_id and branch_id - for branch-aware queries';

-- ============================================
-- view_my_branches
-- ============================================

CREATE OR REPLACE VIEW view_my_branches AS
SELECT 
    b.id,
    b.company_id,
    b.name,
    b.created_at,
    COUNT(DISTINCT c.id) as client_count,
    COUNT(DISTINCT p.id) as professional_count
FROM branches b
LEFT JOIN clients c ON c.branch_id = b.id
LEFT JOIN professionals p ON p.branch_id = b.id
WHERE b.company_id IN (
    SELECT company_id FROM user_active_company WHERE user_id = auth.uid()
)
GROUP BY b.id, b.company_id, b.name, b.created_at
ORDER BY b.name ASC;

-- RLS on view
ALTER VIEW view_my_branches SET (security_invoker = true);

COMMENT ON VIEW view_my_branches IS 'Branches of the active company with counts';

COMMIT;
