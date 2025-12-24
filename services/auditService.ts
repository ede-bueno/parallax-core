import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuditLog {
    id: string;
    actionType: string;
    actorUserId: string;
    actorEmail: string;
    actorName: string;
    targetUserId: string | null;
    targetEmail: string | null;
    targetName: string | null;
    companyId: string;
    metadata: Record<string, any> | null;
    createdAt: string;
}

/**
 * Fetch audit logs for company
 * 
 * Contract:
 * - Reads from view_audit_logs
 * - RLS enforces company isolation
 * - Read-only (no writes allowed from frontend)
 */
export async function fetchAuditLogs(
    companyId: string
): Promise<{
    data: AuditLog[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_audit_logs')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching audit logs:', error);
            return { data: null, error: error.message };
        }

        const normalized: AuditLog[] = (data || []).map(item => ({
            id: item.id,
            actionType: item.action_type,
            actorUserId: item.actor_user_id,
            actorEmail: item.actor_email || '',
            actorName: item.actor_name || '',
            targetUserId: item.target_user_id,
            targetEmail: item.target_email,
            targetName: item.target_name,
            companyId: item.company_id,
            metadata: item.metadata,
            createdAt: item.created_at,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching audit logs:', err);
        return { data: null, error: errorMessage };
    }
}
