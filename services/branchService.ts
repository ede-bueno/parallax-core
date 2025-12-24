import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Branch {
    id: string;
    company_id: string;
    name: string;
    created_at: string;
    client_count?: number;
    professional_count?: number;
}

/**
 * Fetch branches for the active company
 */
export async function fetchMyBranches(companyId: string): Promise<{
    data: Branch[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_my_branches')
            .select('*')
            .eq('company_id', companyId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching branches:', error);
            return { data: null, error: error.message };
        }

        return { data: data || [], error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

/**
 * Set active branch (NULL means "all branches")
 */
export async function setActiveBranch(branchId: string | null): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!.rpc('set_active_branch', {
            branch_id: branchId,
        });

        if (error) {
            console.error('Error setting active branch:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}
