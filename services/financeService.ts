import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CashRegisterStatus {
    isOpen: boolean;
    currentBalance: number;
    openedAt: string | null;
}

export interface FinancialDailySummary {
    totalIncome: number;
    totalExpenses: number;
}

export interface CashMovement {
    id: string;
    date: string;
    type: 'entrada' | 'saída';
    amount: number;
    origin: string;
}

/**
 * Fetch cash register status for active company
 * 
 * Contract:
 * - Reads ONLY from view_cash_register_status
 * - Requires companyId
 * - Returns current status (open/closed, balance)
 */
export async function fetchCashRegisterStatus(companyId: string): Promise<{
    data: CashRegisterStatus | null;
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
            .from('view_cash_register_status')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (error) {
            console.error('Error fetching cash register status:', error);
            return { data: null, error: error.message };
        }

        if (!data) {
            return {
                data: { isOpen: false, currentBalance: 0, openedAt: null },
                error: null,
            };
        }

        return {
            data: {
                isOpen: data.is_open || false,
                currentBalance: data.current_balance || 0,
                openedAt: data.opened_at || null,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching cash register status:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch financial daily summary for active company
 * 
 * Contract:
 * - Reads ONLY from view_financial_daily_summary
 * - Requires companyId
 * - Returns today's income and expenses totals
 */
export async function fetchFinancialDailySummary(companyId: string): Promise<{
    data: FinancialDailySummary | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase!
            .from('view_financial_daily_summary')
            .select('*')
            .eq('company_id', companyId)
            .eq('date', today)
            .single();

        if (error) {
            console.error('Error fetching financial daily summary:', error);
            return { data: null, error: error.message };
        }

        if (!data) {
            return {
                data: { totalIncome: 0, totalExpenses: 0 },
                error: null,
            };
        }

        return {
            data: {
                totalIncome: data.total_income || 0,
                totalExpenses: data.total_expenses || 0,
            },
            error: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching financial daily summary:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch recent cash movements for active company
 * 
 * Contract:
 * - Reads ONLY from view_cash_movements
 * - Requires companyId
 * - Returns max 10 recent movements
 * - Ordered by date descending
 */
export async function fetchRecentCashMovements(companyId: string): Promise<{
    data: CashMovement[] | null;
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
            .from('view_cash_movements')
            .select('*')
            .eq('company_id', companyId)
            .order('date', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching cash movements:', error);
            return { data: null, error: error.message };
        }

        const normalized: CashMovement[] = (data || []).map(item => ({
            id: item.id,
            date: item.date,
            type: item.type === 'income' ? 'entrada' : 'saída',
            amount: item.amount || 0,
            origin: item.origin || 'N/A',
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching cash movements:', err);
        return { data: null, error: errorMessage };
    }
}
