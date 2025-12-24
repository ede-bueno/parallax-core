import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Add user to company
 * 
 * Contract:
 * - Calls RPC add_company_user
 * - Server validates email and role
 * - Server enforces company isolation
 */
export async function addCompanyUser(
    userEmail: string,
    roleKey: string
): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!
            .rpc('add_company_user', {
                user_email: userEmail,
                role_key: roleKey,
            });

        if (error) {
            console.error('Error adding company user:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error adding user:', err);
        return { success: false, error: errorMessage };
    }
}

/**
 * Update user role
 * 
 * Contract:
 * - Calls RPC update_company_user_role
 * - Server validates user belongs to active company
 * - Server enforces permissions
 */
export async function updateUserRole(
    userId: string,
    roleKey: string
): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!
            .rpc('update_company_user_role', {
                user_id: userId,
                role_key: roleKey,
            });

        if (error) {
            console.error('Error updating user role:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error updating role:', err);
        return { success: false, error: errorMessage };
    }
}

/**
 * Remove user from company
 * 
 * Contract:
 * - Calls RPC remove_company_user
 * - Server validates user belongs to active company
 * - Server enforces permissions
 */
export async function removeUser(
    userId: string
): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!
            .rpc('remove_company_user', {
                user_id: userId,
            });

        if (error) {
            console.error('Error removing user:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error removing user:', err);
        return { success: false, error: errorMessage };
    }
}
