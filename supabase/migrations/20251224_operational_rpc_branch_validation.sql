-- ============================================
-- MIGRATION: Operational RPC Branch Validation
-- ============================================
-- Purpose: Establish validation pattern for future operational RPCs
-- Applies to: appointments, clients, professionals writes
-- ============================================

BEGIN;

-- ============================================
-- VALIDATION PATTERN (TEMPLATE)
-- ============================================
-- This migration establishes the MANDATORY pattern for operational RPCs.
-- When creating RPCs that write to operational entities, follow this pattern:

/*
Example Pattern for create_appointment:

CREATE OR REPLACE FUNCTION create_appointment(
  p_client_id UUID,
  p_professional_id UUID,
  p_branch_id UUID,  -- REQUIRED parameter
  p_scheduled_at TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 60,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id UUID;
  v_branch_company_id UUID;
  v_appointment_id UUID;
BEGIN
  -- Get active company
  SELECT company_id INTO v_company_id
  FROM user_active_company
  WHERE user_id = auth.uid();
  
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'No active company set';
  END IF;
  
  -- ============================================
  -- MANDATORY VALIDATION 1: branch_id NOT NULL
  -- ============================================
  IF p_branch_id IS NULL THEN
    RAISE EXCEPTION 'branch_id is required for operational entities';
  END IF;
  
  -- ============================================
  -- MANDATORY VALIDATION 2: branch exists
  -- ============================================
  SELECT company_id INTO v_branch_company_id
  FROM branches
  WHERE id = p_branch_id;
  
  IF v_branch_company_id IS NULL THEN
    RAISE EXCEPTION 'Branch not found';
  END IF;
  
  -- ============================================
  -- MANDATORY VALIDATION 3: branch belongs to active company
  -- ============================================
  IF v_branch_company_id != v_company_id THEN
    RAISE EXCEPTION 'Branch does not belong to active company';
  END IF;
  
  -- Proceed with insert (validation passed)
  INSERT INTO appointments (
    id,
    company_id,
    branch_id,
    client_id,
    professional_id,
    scheduled_at,
    duration_minutes,
    notes,
    status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    v_company_id,
    p_branch_id,
    p_client_id,
    p_professional_id,
    p_scheduled_at,
    p_duration_minutes,
    p_notes,
    'scheduled',
    NOW()
  ) RETURNING id INTO v_appointment_id;
  
  RETURN v_appointment_id;
END;
$$;

COMMENT ON FUNCTION create_appointment IS 'Creates appointment with mandatory branch validation';
*/

-- ============================================
-- PATTERN APPLIES TO:
-- ============================================
-- - create_appointment (appointments table)
-- - update_appointment (appointments table)
-- - create_client (clients table)
-- - update_client (clients table)
-- - create_professional (professionals table)
-- - update_professional (professionals table)

-- ============================================
-- PATTERN DOES NOT APPLY TO:
-- ============================================
-- - Finance RPCs (company-scoped)
-- - Report RPCs (company-scoped)
-- - User/Invite RPCs (company-scoped)
-- - Audit RPCs (company-scoped)

COMMIT;

-- ============================================
-- VERIFICATION NOTES
-- ============================================
-- When implementing operational RPCs:
-- 1. Ensure branch_id is explicit parameter
-- 2. Validate NOT NULL before any write
-- 3. Validate branch ownership before write
-- 4. Only proceed after all validations pass
