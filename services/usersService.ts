import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface PendingInvite {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

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

/**
 * Invite user to company
 * 
 * Contract:
 * - Calls RPC invite_company_user
 * - Server generates secure token
 * - Server sends email (or returns token for dev)
 */
export async function inviteCompanyUser(
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
            .rpc('invite_company_user', {
                user_email: userEmail,
                role_key: roleKey,
            });

        if (error) {
            console.error('Error inviting user:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error inviting user:', err);
        return { success: false, error: errorMessage };
    }
}

/**
 * Cancel pending invite
 * 
 * Contract:
 * - Calls RPC cancel_company_invite
 * - Server validates invite belongs to company
 */
export async function cancelInvite(
    inviteId: string
): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!
            .rpc('cancel_company_invite', {
                invite_id: inviteId,
            });

        if (error) {
            console.error('Error canceling invite:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error canceling invite:', err);
        return { success: false, error: errorMessage };
    }
}

/**
 * Accept company invite
 * 
 * Contract:
 * - Calls RPC accept_company_invite
 * - Server validates token
 * - Server creates company_user link
 * - Token is one-time use
 */
export async function acceptInvite(
    token: string
): Promise<{
    success: boolean;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    try {
        const { error } = await supabase!
            .rpc('accept_company_invite', {
                invite_token: token,
            });

        if (error) {
            console.error('Error accepting invite:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error accepting invite:', err);
        return { success: false, error: errorMessage };
    }
}

/**
 * Fetch pending invites for company
 * 
 * Contract:
 * - Reads from view_company_invites
 * - RLS enforces company isolation
 */
export async function fetchPendingInvites(
    companyId: string
): Promise<{
    data: PendingInvite[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_company_invites')
            .select('*')
            .eq('company_id', companyId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invites:', error);
            return { data: null, error: error.message };
        }

        const normalized: PendingInvite[] = (data || []).map(item => ({
            id: item.id,
            email: item.email || '',
            role: item.role || '',
            status: item.status || 'pending',
            createdAt: item.created_at,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching invites:', err);
        return { data: null, error: errorMessage };
    }
}
