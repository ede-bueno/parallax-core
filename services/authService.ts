import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string | null;
}

export interface UserActiveCompany {
    user_id: string;
    company_id: string;
    branch_id: string | null;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<{
    user: AuthUser | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { user: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Login error:', error);
            return { user: null, error: error.message };
        }

        if (!data.user) {
            return { user: null, error: 'No user returned' };
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || null,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { user: null, error: errorMessage };
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!.auth.signOut();

        if (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{
    user: AuthUser | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { user: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            return { user: null, error: error.message };
        }

        if (!data.user) {
            return { user: null, error: null };
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email || '',
                full_name: data.user.user_metadata?.full_name || null,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { user: null, error: errorMessage };
    }
}

/**
 * Load user_active_company for authenticated user
 * This is the SOURCE OF TRUTH for company_id and branch_id
 */
export async function loadUserActiveCompany(): Promise<{
    data: UserActiveCompany | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('user_active_company')
            .select('user_id, company_id, branch_id')
            .single();

        if (error) {
            console.error('Load user_active_company error:', error);
            return { data: null, error: error.message };
        }

        if (!data) {
            return { data: null, error: 'No active company found for user' };
        }

        return { data, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}
