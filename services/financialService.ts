import { supabase } from '../lib/supabase';

export interface CashRegister {
    id: string;
    branch_id: string;
    status: 'open' | 'closed';
    balance: number;
    opening_balance: number;
    opened_at: string;
    closed_at?: string | null;
    opened_by: string;
}

export interface FinancialResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export const financialService = {
    /**
     * Abre o caixa para uma filial específica.
     * O usuário e a empresa são inferidos pelo contexto da sessão (RPCS).
     */
    async openCashRegister(branchId: string, openingBalance: number): Promise<FinancialResponse<CashRegister>> {
        if (!supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }

        const { data, error } = await supabase.rpc('open_cash_register', {
            p_branch_id: branchId,
            p_opening_balance: openingBalance,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data: data as CashRegister };
    },

    /**
     * Busca o status atual do caixa.
     */
    async getCashRegisterStatus(branchId: string): Promise<FinancialResponse<CashRegister>> {
        if (!supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }

        const { data, error } = await supabase.rpc('get_cash_register_status', {
            p_branch_id: branchId
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data: data as CashRegister };
    },

    /**
     * Finaliza uma comanda (Order).
     */
    async closeOrder(orderId: string, paymentMethod: string): Promise<FinancialResponse<any>> {
        if (!supabase) {
            return { success: false, error: 'Supabase client not initialized' };
        }

        const { data, error } = await supabase.rpc('close_order', {
            p_order_id: orderId,
            p_payment_method: paymentMethod
        });

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data };
    }
};
