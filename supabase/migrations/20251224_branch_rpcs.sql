-- ============================================
-- MIGRATION: Branch RPCs
-- ============================================
-- Purpose: Add branch management RPCs
-- ============================================

BEGIN;

-- ============================================
-- RPC: set_active_branch
-- ============================================

CREATE OR REPLACE FUNCTION set_active_branch(branch_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_branch_company_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get active company
    SELECT company_id INTO v_company_id
    FROM user_active_company
    WHERE user_id = v_user_id;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'No active company set';
    END IF;

    -- If branch_id is NULL, allow (means "all branches")
    IF branch_id IS NULL THEN
        UPDATE user_active_company
        SET branch_id = NULL
        WHERE user_id = v_user_id;
        RETURN;
    END IF;

    -- Validate branch belongs to active company
    SELECT company_id INTO v_branch_company_id
    FROM branches
    WHERE id = branch_id;

    IF v_branch_company_id IS NULL THEN
        RAISE EXCEPTION 'Branch not found';
    END IF;

    IF v_branch_company_id != v_company_id THEN
        RAISE EXCEPTION 'Branch does not belong to active company';
    END IF;

    -- Update active branch
    UPDATE user_active_company
    SET branch_id = branch_id
    WHERE user_id = v_user_id;

END;
$$;

COMMENT ON FUNCTION set_active_branch IS 'Set the active branch for the current user. NULL means "all branches".';

-- ============================================
-- RPC: Update set_active_company
-- ============================================
-- Reset branch_id when company changes

CREATE OR REPLACE FUNCTION set_active_company(p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_has_access BOOLEAN;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Check if user has access to this company
    SELECT EXISTS (
        SELECT 1
        FROM company_users cu
        WHERE cu.user_id = v_user_id
          AND cu.company_id = p_company_id
    ) INTO v_has_access;

    IF NOT v_has_access THEN
        RAISE EXCEPTION 'User does not have access to this company';
    END IF;

    -- Upsert active company and RESET branch_id
    INSERT INTO user_active_company (user_id, company_id, branch_id)
    VALUES (v_user_id, p_company_id, NULL)  -- Reset branch when changing company
    ON CONFLICT (user_id)
    DO UPDATE SET 
        company_id = p_company_id,
        branch_id = NULL;  -- Always reset branch on company change

END;
$$;

COMMENT ON FUNCTION set_active_company IS 'Set the active company for the current user. Resets branch to NULL.';

COMMIT;
