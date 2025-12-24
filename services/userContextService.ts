import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserContextData {
    userId: string | null;
    fullName: string | null;
    email: string | null;
    companyId: string | null;
    companyName: string | null;
    branchId: string | null;
    role: string | null;
}

/**
 * Fetches user context from view_user_context
 * Returns the first row as active context
 * 
 * Contract:
 * - Reads ONLY from view_user_context
 * - No direct table access
 * - Returns null data if Supabase not configured
 * - Returns null data if view has no rows
 * - Never throws unhandled exceptions
 */
export async function fetchUserContext(): Promise<{
    data: UserContextData | null;
    error: string | null;
}> {
    // Graceful degradation if Supabase not configured
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        };
    }

    try {
        const { data, error } = await supabase!
            .from('view_user_context')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching user context:', error);
            return {
                data: null,
                error: error.message,
            };
        }

        if (!data) {
            return {
                data: null,
                error: 'No user context found',
            };
        }

        // Normalize data structure
        return {
            data: {
                userId: data.user_id || null,
                fullName: data.full_name || null,
                email: data.email || null,
                companyId: data.company_id || null,
                companyName: data.company_name || null,
                branchId: data.branch_id || null,
                role: data.role || null,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching user context:', err);
        return {
            data: null,
            error: errorMessage,
        };
    }
}
