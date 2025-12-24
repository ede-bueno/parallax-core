-- ============================================================================
-- PARALLAX — ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- 
-- Purpose: Enforce multi-tenant data isolation by company_id
-- 
-- Assumptions:
-- - auth.uid() represents the logged-in user
-- - company_users maps users to companies
-- - user_active_company stores the active company per user
-- 
-- Strategy:
-- - Enable RLS on all base tables
-- - Allow SELECT only for rows matching user's active company
-- - INSERT/UPDATE/DELETE policies NOT included yet (to be added later)
-- - Views rely on underlying table policies (no RLS on views directly)
-- 
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY ON BASE TABLES
-- ============================================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: CREATE SELECT POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- COMPANIES: User can read only their active company
-- ----------------------------------------------------------------------------
CREATE POLICY select_active_company
ON companies
FOR SELECT
USING (
  id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- BRANCHES: User can read branches only from their active company
-- ----------------------------------------------------------------------------
CREATE POLICY select_by_active_company
ON branches
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- CLIENTS: User can read clients only from their active company
-- ----------------------------------------------------------------------------
CREATE POLICY select_by_active_company
ON clients
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- PROFESSIONALS: User can read professionals only from their active company
-- ----------------------------------------------------------------------------
CREATE POLICY select_by_active_company
ON professionals
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- ----------------------------------------------------------------------------
-- APPOINTMENTS: User can read appointments only from their active company
-- ----------------------------------------------------------------------------
CREATE POLICY select_by_active_company
ON appointments
FOR SELECT
USING (
  company_id = (
    SELECT company_id
    FROM user_active_company
    WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. Views (view_clients, view_professionals, view_appointments, etc.) 
--    automatically inherit these policies from base tables.
-- 
-- 2. When user switches company via RPC set_active_company(), the 
--    user_active_company table is updated, and all queries immediately 
--    reflect the new company context.
-- 
-- 3. INSERT/UPDATE/DELETE policies will be added in future migrations.
-- 
-- 4. Service role bypasses RLS, so use anon/authenticated keys in frontend.
-- 
-- ============================================================================
