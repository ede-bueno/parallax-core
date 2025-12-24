import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DashboardKPIs {
    totalClients: number;
    activeProfessionals: number;
    appointmentsToday: number;
}

export interface UpcomingAppointment {
    id: string;
    clientName: string;
    professionalName: string;
    serviceName: string;
    startTime: string;
}

/**
 * Fetch dashboard KPIs for a specific company
 * 
 * Contract:
 * - Reads ONLY from views (never tables)
 * - Requires companyId (no global queries)
 * - Returns null data if Supabase not configured
 * - Never throws unhandled exceptions
 */
export async function fetchDashboardKPIs(companyId: string): Promise<{
    data: DashboardKPIs | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        // Fetch total clients
        const { count: clientCount, error: clientError } = await supabase!
            .from('view_clients')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        if (clientError) {
            console.error('Error fetching clients count:', clientError);
            return { data: null, error: 'Failed to fetch clients data' };
        }

        // Fetch active professionals
        const { count: professionalCount, error: professionalError } = await supabase!
            .from('view_professionals')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        if (professionalError) {
            console.error('Error fetching professionals count:', professionalError);
            return { data: null, error: 'Failed to fetch professionals data' };
        }

        // Fetch appointments for today
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAppointments, error: appointmentsError } = await supabase!
            .from('view_appointments')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .gte('start_time', `${today}T00:00:00`)
            .lt('start_time', `${today}T23:59:59`);

        if (appointmentsError) {
            console.error('Error fetching today appointments:', appointmentsError);
            return { data: null, error: 'Failed to fetch appointments data' };
        }

        return {
            data: {
                totalClients: clientCount ?? 0,
                activeProfessionals: professionalCount ?? 0,
                appointmentsToday: todayAppointments ?? 0,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching dashboard KPIs:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch upcoming appointments for a specific company
 * 
 * Contract:
 * - Reads ONLY from view_appointments
 * - Requires companyId
 * - Returns max 5 upcoming appointments
 * - Ordered by start_time ascending
 */
export async function fetchUpcomingAppointments(companyId: string): Promise<{
    data: UpcomingAppointment[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        const now = new Date().toISOString();

        const { data, error } = await supabase!
            .from('view_appointments')
            .select('id, client_name, professional_name, service_name, start_time')
            .eq('company_id', companyId)
            .gte('start_time', now)
            .order('start_time', { ascending: true })
            .limit(5);

        if (error) {
            console.error('Error fetching upcoming appointments:', error);
            return { data: null, error: 'Failed to fetch upcoming appointments' };
        }

        const normalized: UpcomingAppointment[] = (data || []).map(item => ({
            id: item.id,
            clientName: item.client_name || 'N/A',
            professionalName: item.professional_name || 'N/A',
            serviceName: item.service_name || 'N/A',
            startTime: item.start_time,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching upcoming appointments:', err);
        return { data: null, error: errorMessage };
    }
}
