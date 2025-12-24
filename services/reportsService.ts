import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Period types
export type ReportPeriod = '7d' | '30d' | 'current_month';

// Helper to calculate date range
function getDateRange(period: ReportPeriod): { startDate: string; endDate: string } {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: string;

    switch (period) {
        case '7d':
            const date7d = new Date(now);
            date7d.setDate(date7d.getDate() - 7);
            startDate = date7d.toISOString().split('T')[0];
            break;
        case '30d':
            const date30d = new Date(now);
            date30d.setDate(date30d.getDate() - 30);
            startDate = date30d.toISOString().split('T')[0];
            break;
        case 'current_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            break;
    }

    return { startDate, endDate };
}

// Financial Summary Report
export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    netResult: number;
}

export async function fetchFinancialSummary(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: FinancialSummary | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);

        const { data, error } = await supabase!
            .from('view_financial_daily_summary')
            .select('total_income, total_expenses')
            .eq('company_id', companyId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) {
            console.error('Error fetching financial summary:', error);
            return { data: null, error: error.message };
        }

        // Aggregate results
        const totalIncome = (data || []).reduce((sum, row) => sum + (row.total_income || 0), 0);
        const totalExpenses = (data || []).reduce((sum, row) => sum + (row.total_expenses || 0), 0);
        const netResult = totalIncome - totalExpenses;

        return {
            data: { totalIncome, totalExpenses, netResult },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

// Appointments Overview Report
export interface AppointmentsOverview {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    upcomingAppointments: number;
}

export async function fetchAppointmentsOverview(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: AppointmentsOverview | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);
        const now = new Date().toISOString();

        const { data, error } = await supabase!
            .from('view_appointments')
            .select('scheduled_at, status')
            .eq('company_id', companyId)
            .gte('scheduled_at', startDate)
            .lte('scheduled_at', endDate);

        if (error) {
            console.error('Error fetching appointments:', error);
            return { data: null, error: error.message };
        }

        const totalAppointments = data?.length || 0;
        const completedAppointments = (data || []).filter(a => a.status === 'completed').length;
        const cancelledAppointments = (data || []).filter(a => a.status === 'cancelled').length;
        const upcomingAppointments = (data || []).filter(a => a.scheduled_at > now).length;

        return {
            data: {
                totalAppointments,
                completedAppointments,
                cancelledAppointments,
                upcomingAppointments,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

// Clients Growth Report
export interface ClientsGrowth {
    totalClients: number;
    newClients: number;
}

export async function fetchClientsGrowth(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: ClientsGrowth | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate } = getDateRange(period);

        // Total clients
        const { data: allClients, error: allError } = await supabase!
            .from('view_clients')
            .select('id')
            .eq('company_id', companyId);

        if (allError) {
            console.error('Error fetching total clients:', allError);
            return { data: null, error: allError.message };
        }

        // New clients in period
        const { data: newClientsData, error: newError } = await supabase!
            .from('view_clients')
            .select('id')
            .eq('company_id', companyId)
            .gte('created_at', startDate);

        if (newError) {
            console.error('Error fetching new clients:', newError);
            return { data: null, error: newError.message };
        }

        return {
            data: {
                totalClients: allClients?.length || 0,
                newClients: newClientsData?.length || 0,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

// Professionals Activity Report
export interface ProfessionalsActivity {
    totalProfessionals: number;
    activeProfessionals: number;
}

export async function fetchProfessionalsActivity(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: ProfessionalsActivity | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);

        // Total professionals
        const { data: allProfessionals, error: allError } = await supabase!
            .from('view_professionals')
            .select('id')
            .eq('company_id', companyId);

        if (allError) {
            console.error('Error fetching total professionals:', allError);
            return { data: null, error: allError.message };
        }

        // Active professionals (with appointments in period)
        const { data: appointments, error: appointmentsError } = await supabase!
            .from('view_appointments')
            .select('professional_id')
            .eq('company_id', companyId)
            .gte('scheduled_at', startDate)
            .lte('scheduled_at', endDate);

        if (appointmentsError) {
            console.error('Error fetching appointments for activity:', appointmentsError);
            return { data: null, error: appointmentsError.message };
        }

        const activeProfessionalIds = new Set((appointments || []).map(a => a.professional_id));

        return {
            data: {
                totalProfessionals: allProfessionals?.length || 0,
                activeProfessionals: activeProfessionalIds.size,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

// Administrative Activity Report
export interface AdminAction {
    id: string;
    actionType: string;
    actorName: string;
    createdAt: string;
}

export interface AdministrativeActivity {
    actionCounts: Record<string, number>;
    recentActions: AdminAction[];
}

export async function fetchAdministrativeActivity(
    companyId: string
): Promise<{
    data: AdministrativeActivity | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_audit_logs')
            .select('id, action_type, actor_name, created_at')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching audit activity:', error);
            return { data: null, error: error.message };
        }

        // Count by action type
        const actionCounts: Record<string, number> = {};
        (data || []).forEach(log => {
            actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1;
        });

        // Recent actions (last 10)
        const recentActions: AdminAction[] = (data || []).slice(0, 10).map(log => ({
            id: log.id,
            actionType: log.action_type,
            actorName: log.actor_name || 'Unknown',
            createdAt: log.created_at,
        }));

        return {
            data: { actionCounts, recentActions },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { data: null, error: errorMessage };
    }
}

// ============================================
// CSV Export Helpers
// ============================================

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], headers: string[]): string {
    if (data.length === 0) return headers.join(',');

    const rows = data.map(row =>
        headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in values
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger CSV download
 */
export function downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// Detailed Fetch Functions for CSV Export
// ============================================

export interface FinancialDetailRow {
    date: string;
    total_income: number;
    total_expenses: number;
    net_result: number;
}

export async function fetchFinancialDetail(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: FinancialDetailRow[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);

        const { data, error } = await supabase!
            .from('view_financial_daily_summary')
            .select('date, total_income, total_expenses')
            .eq('company_id', companyId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) {
            return { data: null, error: error.message };
        }

        const rows = (data || []).map(row => ({
            date: row.date,
            total_income: row.total_income || 0,
            total_expenses: row.total_expenses || 0,
            net_result: (row.total_income || 0) - (row.total_expenses || 0),
        }));

        return { data: rows, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

export interface AppointmentDetailRow {
    appointment_id: string;
    date: string;
    status: string;
    client_name: string;
    professional_name: string;
}

export async function fetchAppointmentsDetail(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: AppointmentDetailRow[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);

        const { data, error } = await supabase!
            .from('view_appointments')
            .select('id, scheduled_at, status, client_name, professional_name')
            .eq('company_id', companyId)
            .gte('scheduled_at', startDate)
            .lte('scheduled_at', endDate)
            .order('scheduled_at', { ascending: true });

        if (error) {
            return { data: null, error: error.message };
        }

        const rows = (data || []).map(row => ({
            appointment_id: row.id,
            date: row.scheduled_at,
            status: row.status || '',
            client_name: row.client_name || '',
            professional_name: row.professional_name || '',
        }));

        return { data: rows, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

export interface ClientDetailRow {
    client_id: string;
    full_name: string;
    created_at: string;
}

export async function fetchClientsDetail(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: ClientDetailRow[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate } = getDateRange(period);

        const { data, error } = await supabase!
            .from('view_clients')
            .select('id, full_name, created_at')
            .eq('company_id', companyId)
            .gte('created_at', startDate)
            .order('created_at', { ascending: true });

        if (error) {
            return { data: null, error: error.message };
        }

        const rows = (data || []).map(row => ({
            client_id: row.id,
            full_name: row.full_name || '',
            created_at: row.created_at,
        }));

        return { data: rows, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

export interface ProfessionalDetailRow {
    professional_id: string;
    full_name: string;
    total_appointments_in_period: number;
}

export async function fetchProfessionalsDetail(
    companyId: string,
    period: ReportPeriod
): Promise<{
    data: ProfessionalDetailRow[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { startDate, endDate } = getDateRange(period);

        // Fetch all professionals
        const { data: professionals, error: profError } = await supabase!
            .from('view_professionals')
            .select('id, full_name')
            .eq('company_id', companyId)
            .order('full_name', { ascending: true });

        if (profError) {
            return { data: null, error: profError.message };
        }

        // Fetch appointments in period
        const { data: appointments, error: appError } = await supabase!
            .from('view_appointments')
            .select('professional_id')
            .eq('company_id', companyId)
            .gte('scheduled_at', startDate)
            .lte('scheduled_at', endDate);

        if (appError) {
            return { data: null, error: appError.message };
        }

        // Count appointments per professional
        const appointmentCounts: Record<string, number> = {};
        (appointments || []).forEach(app => {
            appointmentCounts[app.professional_id] = (appointmentCounts[app.professional_id] || 0) + 1;
        });

        const rows = (professionals || []).map(prof => ({
            professional_id: prof.id,
            full_name: prof.full_name || '',
            total_appointments_in_period: appointmentCounts[prof.id] || 0,
        }));

        return { data: rows, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

export interface AuditDetailRow {
    action_type: string;
    actor_email: string;
    target_email: string;
    created_at: string;
    metadata: string;
}

export async function fetchAuditDetail(
    companyId: string
): Promise<{
    data: AuditDetailRow[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase!
            .from('view_audit_logs')
            .select('action_type, actor_email, target_email, created_at, metadata')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            return { data: null, error: error.message };
        }

        const rows = (data || []).map(row => ({
            action_type: row.action_type,
            actor_email: row.actor_email || '',
            target_email: row.target_email || '',
            created_at: row.created_at,
            metadata: row.metadata ? JSON.stringify(row.metadata) : '',
        }));

        return { data: rows, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
}

export { convertToCSV };

