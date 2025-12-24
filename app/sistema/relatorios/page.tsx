'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import {
    ReportPeriod,
    FinancialSummary,
    AppointmentsOverview,
    ClientsGrowth,
    ProfessionalsActivity,
    AdministrativeActivity,
    fetchFinancialSummary,
    fetchAppointmentsOverview,
    fetchClientsGrowth,
    fetchProfessionalsActivity,
    fetchAdministrativeActivity,
    fetchFinancialDetail,
    fetchAppointmentsDetail,
    fetchClientsDetail,
    fetchProfessionalsDetail,
    fetchAuditDetail,
    convertToCSV,
    downloadCSV,
} from '../../../services/reportsService';

// Export Button Component
function ExportButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: 'var(--space-2)',
                backgroundColor: 'var(--action-primary)',
                color: 'var(--action-primary-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
            }}
        >
            Exportar CSV
        </button>
    );
}

export default function RelatoriosPage() {
    const { companyId, loading: contextLoading } = useUserContext();
    const [period, setPeriod] = useState<ReportPeriod>('30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Report data
    const [financial, setFinancial] = useState<FinancialSummary | null>(null);
    const [appointments, setAppointments] = useState<AppointmentsOverview | null>(null);
    const [clients, setClients] = useState<ClientsGrowth | null>(null);
    const [professionals, setProfessionals] = useState<ProfessionalsActivity | null>(null);
    const [adminActivity, setAdminActivity] = useState<AdministrativeActivity | null>(null);

    useEffect(() => {
        async function loadReports() {
            if (contextLoading || !companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [financialRes, appointmentsRes, clientsRes, professionalsRes, activityRes] =
                    await Promise.all([
                        fetchFinancialSummary(companyId, period),
                        fetchAppointmentsOverview(companyId, period),
                        fetchClientsGrowth(companyId, period),
                        fetchProfessionalsActivity(companyId, period),
                        fetchAdministrativeActivity(companyId),
                    ]);

                if (financialRes.error) setError(financialRes.error);
                else setFinancial(financialRes.data);

                if (!appointmentsRes.error) setAppointments(appointmentsRes.data);
                if (!clientsRes.error) setClients(clientsRes.data);
                if (!professionalsRes.error) setProfessionals(professionalsRes.data);
                if (!activityRes.error) setAdminActivity(activityRes.data);
            } catch (err) {
                console.error('Load error:', err);
                setError('Erro ao carregar relatórios');
            } finally {
                setLoading(false);
            }
        }

        loadReports();
    }, [companyId, contextLoading, period]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getPeriodLabel = (p: ReportPeriod) => {
        switch (p) {
            case '7d': return 'Últimos 7 dias';
            case '30d': return 'Últimos 30 dias';
            case 'current_month': return 'Mês atual';
        }
    };

    // CSV Export Handlers
    const handleExportFinancial = async () => {
        if (!companyId) return;
        const { data } = await fetchFinancialDetail(companyId, period);
        if (data) {
            const csv = convertToCSV(data, ['date', 'total_income', 'total_expenses', 'net_result']);
            const filename = `parallax_financial_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(filename, csv);
        }
    };

    const handleExportAppointments = async () => {
        if (!companyId) return;
        const { data } = await fetchAppointmentsDetail(companyId, period);
        if (data) {
            const csv = convertToCSV(data, ['appointment_id', 'date', 'status', 'client_name', 'professional_name']);
            const filename = `parallax_appointments_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(filename, csv);
        }
    };

    const handleExportClients = async () => {
        if (!companyId) return;
        const { data } = await fetchClientsDetail(companyId, period);
        if (data) {
            const csv = convertToCSV(data, ['client_id', 'full_name', 'created_at']);
            const filename = `parallax_clients_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(filename, csv);
        }
    };

    const handleExportProfessionals = async () => {
        if (!companyId) return;
        const { data } = await fetchProfessionalsDetail(companyId, period);
        if (data) {
            const csv = convertToCSV(data, ['professional_id', 'full_name', 'total_appointments_in_period']);
            const filename = `parallax_professionals_${period}_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(filename, csv);
        }
    };

    const handleExportAudit = async () => {
        if (!companyId) return;
        const { data } = await fetchAuditDetail(companyId);
        if (data) {
            const csv = convertToCSV(data, ['action_type', 'actor_email', 'target_email', 'created_at', 'metadata']);
            const filename = `parallax_audit_${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(filename, csv);
        }
    };

    return (
        <RequireRole allowedRoles={['admin']}>
            <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--space-2)',
                    }}>
                        Relatórios
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Visão gerencial e indicadores administrativos
                    </p>
                </div>

                {/* Period Selector */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <label style={{
                        display: 'block',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-2)',
                    }}>
                        Período
                    </label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                        style={{
                            padding: 'var(--space-2)',
                            backgroundColor: 'var(--background-surface)',
                            border: '1px solid var(--background-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-md)',
                        }}
                    >
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                        <option value="current_month">Mês atual</option>
                    </select>
                </div>

                {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando relatórios...</p>}
                {error && !loading && <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>}
                {!companyId && !contextLoading && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>}

                {!loading && !error && companyId && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>

                        {/* Financial Summary */}
                        {financial && (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <h2 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        margin: 0,
                                    }}>
                                        Resumo Financeiro
                                    </h2>
                                    <ExportButton onClick={handleExportFinancial} disabled={loading} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    {getPeriodLabel(period)}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Receitas</p>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-success)' }}>
                                            {formatCurrency(financial.totalIncome)}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Despesas</p>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-error)' }}>
                                            {formatCurrency(financial.totalExpenses)}
                                        </p>
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--background-border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Resultado</p>
                                        <p style={{
                                            fontSize: 'var(--font-size-xl)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            color: financial.netResult >= 0 ? 'var(--status-success)' : 'var(--status-error)',
                                        }}>
                                            {formatCurrency(financial.netResult)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appointments Overview */}
                        {appointments && (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <h2 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        margin: 0,
                                    }}>
                                        Agendamentos
                                    </h2>
                                    <ExportButton onClick={handleExportAppointments} disabled={loading} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    {getPeriodLabel(period)}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Total</p>
                                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                                            {appointments.totalAppointments}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Concluídos</p>
                                            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--status-success)' }}>
                                                {appointments.completedAppointments}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Cancelados</p>
                                            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--status-error)' }}>
                                                {appointments.cancelledAppointments}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Futuros</p>
                                        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
                                            {appointments.upcomingAppointments}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Clients Growth */}
                        {clients && (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <h2 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        margin: 0,
                                    }}>
                                        Clientes
                                    </h2>
                                    <ExportButton onClick={handleExportClients} disabled={loading} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    Crescimento
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Total</p>
                                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                                            {clients.totalClients}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Novos ({getPeriodLabel(period).toLowerCase()})</p>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-success)' }}>
                                            +{clients.newClients}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Professionals Activity */}
                        {professionals && (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <h2 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        margin: 0,
                                    }}>
                                        Profissionais
                                    </h2>
                                    <ExportButton onClick={handleExportProfessionals} disabled={loading} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    Atividade
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Total</p>
                                        <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                                            {professionals.totalProfessionals}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Ativos ({getPeriodLabel(period).toLowerCase()})</p>
                                        <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-success)' }}>
                                            {professionals.activeProfessionals}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Administrative Activity */}
                        {adminActivity && (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                                gridColumn: 'span 2',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <h2 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        margin: 0,
                                    }}>
                                        Atividade Administrativa
                                    </h2>
                                    <ExportButton onClick={handleExportAudit} disabled={loading} />
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                                    Ações recentes
                                </p>

                                {/* Action counts */}
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Por tipo:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                        {Object.entries(adminActivity.actionCounts).map(([type, count]) => (
                                            <span
                                                key={type}
                                                style={{
                                                    padding: 'var(--space-1) var(--space-2)',
                                                    backgroundColor: 'var(--background-default)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: 'var(--font-size-sm)',
                                                }}
                                            >
                                                {type}: <strong>{count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent actions list */}
                                <div>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Últimas 10 ações:</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        {adminActivity.recentActions.map(action => (
                                            <div
                                                key={action.id}
                                                style={{
                                                    padding: 'var(--space-2)',
                                                    backgroundColor: 'var(--background-default)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: 'var(--font-size-sm)',
                                                }}
                                            >
                                                <span>
                                                    <strong>{action.actionType}</strong> por {action.actorName}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(action.createdAt).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </RequireRole>
    );
}
