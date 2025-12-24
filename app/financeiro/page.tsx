'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import {
    fetchCashRegisterStatus,
    fetchFinancialDailySummary,
    fetchRecentCashMovements,
    CashRegisterStatus,
    FinancialDailySummary,
    CashMovement,
} from '../../services/financeService';

export default function FinanceiroPage() {
    const { companyId, loading: contextLoading } = useUserContext();
    const [cashStatus, setCashStatus] = useState<CashRegisterStatus | null>(null);
    const [dailySummary, setDailySummary] = useState<FinancialDailySummary | null>(null);
    const [movements, setMovements] = useState<CashMovement[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadFinanceData() {
            if (contextLoading || !companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [statusResult, summaryResult, movementsResult] = await Promise.all([
                    fetchCashRegisterStatus(companyId),
                    fetchFinancialDailySummary(companyId),
                    fetchRecentCashMovements(companyId),
                ]);

                if (statusResult.error) {
                    setError(statusResult.error);
                } else {
                    setCashStatus(statusResult.data);
                }

                if (!summaryResult.error) {
                    setDailySummary(summaryResult.data);
                }

                if (!movementsResult.error) {
                    setMovements(movementsResult.data);
                }
            } catch (err) {
                console.error('Finance load error:', err);
                setError('Erro ao carregar dados financeiros');
            } finally {
                setLoading(false);
            }
        }

        loadFinanceData();
    }, [companyId, contextLoading]);

    return (
        <RequireRole allowedRoles={['admin']}>
            <div style={{ padding: 'var(--space-5)' }}>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Financeiro
                    </h1>
                </div>

                {/* Loading */}
                {loading && (
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
                )}

                {/* Error */}
                {error && !loading && (
                    <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>
                )}

                {/* No company */}
                {!companyId && !contextLoading && (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>
                )}

                {/* Content */}
                {!loading && !error && companyId && (
                    <>
                        {/* KPIs */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                            {/* Cash Status */}
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)'
                            }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    Status do Caixa
                                </p>
                                <p style={{
                                    fontSize: 'var(--font-size-xl)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: cashStatus?.isOpen ? 'var(--status-success)' : 'var(--text-muted)'
                                }}>
                                    {cashStatus?.isOpen ? 'Aberto' : 'Fechado'}
                                </p>
                            </div>

                            {/* Current Balance */}
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)'
                            }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    Saldo Atual
                                </p>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                                    R$ {(cashStatus?.currentBalance || 0).toFixed(2)}
                                </p>
                            </div>

                            {/* Total Income */}
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)'
                            }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    Entradas Hoje
                                </p>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-success)' }}>
                                    R$ {(dailySummary?.totalIncome || 0).toFixed(2)}
                                </p>
                            </div>

                            {/* Total Expenses */}
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)'
                            }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                    Saídas Hoje
                                </p>
                                <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-error)' }}>
                                    R$ {(dailySummary?.totalExpenses || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Recent Movements */}
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Últimos Movimentos
                            </h2>

                            {movements && movements.length > 0 ? (
                                <div style={{
                                    backgroundColor: 'var(--background-surface)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--background-border)',
                                    overflow: 'hidden'
                                }}>
                                    {movements.map((movement, index) => (
                                        <div
                                            key={movement.id}
                                            style={{
                                                padding: 'var(--space-4)',
                                                borderBottom: index < movements.length - 1 ? '1px solid var(--background-border)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                                                    {movement.origin}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                    {new Date(movement.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{
                                                    fontSize: 'var(--font-size-lg)',
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    color: movement.type === 'entrada' ? 'var(--status-success)' : 'var(--status-error)'
                                                }}>
                                                    {movement.type === 'entrada' ? '+' : '-'} R$ {movement.amount.toFixed(2)}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: 'var(--background-surface)',
                                    padding: 'var(--space-5)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--background-border)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Nenhum movimento registrado
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </RequireRole>
    );
}
