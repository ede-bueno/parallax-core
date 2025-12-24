-- ============================================
-- MIGRATION: Branch Foundation
-- ============================================
-- Purpose: Add branch layer to operational entities
-- Scope: clients, professionals, appointments
-- Backward compatible: Creates default "Sede" branch
-- ============================================

BEGIN;

-- ============================================
-- PHASE 1: Create Default Branches
-- ============================================

-- For every company without a branch, create "Sede"
INSERT INTO branches (id, company_id, name, created_at)
SELECT 
    gen_random_uuid(),
    c.id,
    'Sede',
    NOW()
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM branches b WHERE b.company_id = c.id
);

-- ============================================
-- PHASE 2: Add branch_id columns (nullable)
-- ============================================

-- Add to clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- Add to professionals
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- Add to appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- ============================================
-- PHASE 3: Populate branch_id with default
-- ============================================

-- Update clients with company's first branch
UPDATE clients c
SET branch_id = (
    SELECT b.id 
    FROM branches b 
    WHERE b.company_id = c.company_id 
    ORDER BY b.created_at ASC 
    LIMIT 1
)
WHERE branch_id IS NULL;

-- Update professionals with company's first branch
UPDATE professionals p
SET branch_id = (
    SELECT b.id 
    FROM branches b 
    WHERE b.company_id = p.company_id 
    ORDER BY b.created_at ASC 
    LIMIT 1
)
WHERE branch_id IS NULL;

-- Update appointments with company's first branch
UPDATE appointments a
SET branch_id = (
    SELECT b.id 
    FROM branches b 
    JOIN professionals p ON p.company_id = b.company_id
    WHERE p.id = a.professional_id
    ORDER BY b.created_at ASC 
    LIMIT 1
)
WHERE branch_id IS NULL;

-- ============================================
-- PHASE 4: Add NOT NULL constraints
-- ============================================

-- Verify all rows have branch_id before adding constraint
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM clients WHERE branch_id IS NULL) > 0 THEN
        RAISE EXCEPTION 'Cannot add NOT NULL constraint: clients has NULL branch_id';
    END IF;
    
    IF (SELECT COUNT(*) FROM professionals WHERE branch_id IS NULL) > 0 THEN
        RAISE EXCEPTION 'Cannot add NOT NULL constraint: professionals has NULL branch_id';
    END IF;
    
    IF (SELECT COUNT(*) FROM appointments WHERE branch_id IS NULL) > 0 THEN
        RAISE EXCEPTION 'Cannot add NOT NULL constraint: appointments has NULL branch_id';
    END IF;
END $$;

-- Add NOT NULL constraints
ALTER TABLE clients ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE professionals ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN branch_id SET NOT NULL;

-- ============================================
-- PHASE 5: Add foreign key constraints
-- ============================================

ALTER TABLE clients
ADD CONSTRAINT fk_clients_branch 
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

ALTER TABLE professionals
ADD CONSTRAINT fk_professionals_branch 
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_branch 
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT;

-- ============================================
-- PHASE 6: Add composite indexes
-- ============================================

-- Clients: (company_id, branch_id)
CREATE INDEX IF NOT EXISTS idx_clients_company_branch 
ON clients(company_id, branch_id);

-- Professionals: (company_id, branch_id)
CREATE INDEX IF NOT EXISTS idx_professionals_company_branch 
ON professionals(company_id, branch_id);

-- Appointments: (company_id, branch_id)
CREATE INDEX IF NOT EXISTS idx_appointments_company_branch 
ON appointments(company_id, branch_id);

-- ============================================
-- PHASE 7: Extend user_active_company
-- ============================================

-- Add branch_id (nullable) to track active branch
ALTER TABLE user_active_company
ADD COLUMN IF NOT EXISTS branch_id UUID;

-- Foreign key to branches
ALTER TABLE user_active_company
ADD CONSTRAINT fk_user_active_company_branch
FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_user_active_company_branch 
ON user_active_company(user_id, company_id, branch_id);

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check default branches created
-- SELECT company_id, COUNT(*) as branch_count 
-- FROM branches 
-- GROUP BY company_id 
-- HAVING COUNT(*) = 0;

-- Check NULL branch_id (should be empty)
-- SELECT 'clients' as table_name, COUNT(*) FROM clients WHERE branch_id IS NULL
-- UNION ALL
-- SELECT 'professionals', COUNT(*) FROM professionals WHERE branch_id IS NULL
-- UNION ALL
-- SELECT 'appointments', COUNT(*) FROM appointments WHERE branch_id IS NULL;
