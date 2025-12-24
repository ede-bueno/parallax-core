import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CompanyDetails {
    name: string;
    tradeName: string;
    document: string;
    email: string;
    phone: string;
}

export interface CompanyUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
}

export interface CompanyPlan {
    planName: string;
    maxUsers: number;
    maxBranches: number;
    expiresAt: string | null;
}

/**
 * Fetch company details
 * 
 * Contract:
 * - Reads ONLY from view_company_details
 * - Requires companyId
 */
export async function fetchCompanyDetails(companyId: string): Promise<{
    data: CompanyDetails | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_company_details')
            .select('*')
            .eq('id', companyId)
            .single();

        if (error) {
            console.error('Error fetching company details:', error);
            return { data: null, error: error.message };
        }

        return {
            data: {
                name: data.name || '',
                tradeName: data.trade_name || '',
                document: data.document || '',
                email: data.email || '',
                phone: data.phone || '',
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching company details:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch company users
 */
export async function fetchCompanyUsers(companyId: string): Promise<{
    data: CompanyUser[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_company_users')
            .select('*')
            .eq('company_id', companyId);

        if (error) {
            console.error('Error fetching company users:', error);
            return { data: null, error: error.message };
        }

        const normalized: CompanyUser[] = (data || []).map(item => ({
            id: item.user_id,
            fullName: item.full_name || '',
            email: item.email || '',
            role: item.role || '',
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching company users:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch available roles
 */
export async function fetchRoles(): Promise<{
    data: Role[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_roles')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching roles:', error);
            return { data: null, error: error.message };
        }

        const normalized: Role[] = (data || []).map(item => ({
            id: item.id,
            name: item.name || '',
            description: item.description || '',
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching roles:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch permissions
 */
export async function fetchPermissions(): Promise<{
    data: Permission[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_permissions')
            .select('*')
            .order('resource');

        if (error) {
            console.error('Error fetching permissions:', error);
            return { data: null, error: error.message };
        }

        const normalized: Permission[] = (data || []).map(item => ({
            id: item.id,
            name: item.name || '',
            description: item.description || '',
            resource: item.resource || '',
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching permissions:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch company plan
 */
export async function fetchCompanyPlan(companyId: string): Promise<{
    data: CompanyPlan | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_company_plan')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (error) {
            console.error('Error fetching company plan:', error);
            return { data: null, error: error.message };
        }

        return {
            data: {
                planName: data.plan_name || 'Free',
                maxUsers: data.max_users || 0,
                maxBranches: data.max_branches || 0,
                expiresAt: data.expires_at || null,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching company plan:', err);
        return { data: null, error: errorMessage };
    }
}
