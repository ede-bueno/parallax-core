import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Company {
    id: string;
    name: string;
}

/**
 * Fetch list of companies the current user belongs to
 * 
 * Contract:
 * - Reads ONLY from view_my_companies
 * - Returns empty array if Supabase not configured
 * - Never throws unhandled exceptions
 */
export async function getMyCompanies(): Promise<{
    data: Company[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        const { data, error } = await supabase!
            .from('view_my_companies')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching my companies:', error);
            return { data: null, error: error.message };
        }

        const normalized: Company[] = (data || []).map(item => ({
            id: item.id,
            name: item.name,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching companies:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Set active company for current user
 * 
 * Contract:
 * - Calls RPC set_active_company
 * - Returns success/error status
 * - Never throws unhandled exceptions
 */
export async function setActiveCompany(companyId: string): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            success: false,
            error: 'Supabase not configured',
        };
    }

    try {
        const { error } = await supabase!
            .rpc('set_active_company', { company_id: companyId });

        if (error) {
            console.error('Error setting active company:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error setting active company:', err);
        return { success: false, error: errorMessage };
    }
}
