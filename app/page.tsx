'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import {
    fetchDashboardKPIs,
    fetchUpcomingAppointments,
    DashboardKPIs,
    UpcomingAppointment,
} from '../services/dashboardService';

export default function HomePage() {
    const { companyId, companyName, loading: contextLoading } = useUserContext();
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            // Wait for context to load
            if (contextLoading) {
                return;
            }

            // Handle missing companyId
            if (!companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch KPIs and upcoming appointments in parallel
                const [kpisResult, appointmentsResult] = await Promise.all([
                    fetchDashboardKPIs(companyId),
                    fetchUpcomingAppointments(companyId),
                ]);

                if (kpisResult.error) {
                    setError(kpisResult.error);
                } else {
                    setKpis(kpisResult.data);
                }

                if (!appointmentsResult.error) {
                    setUpcomingAppointments(appointmentsResult.data);
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
                setError('Erro ao carregar dashboard');
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [companyId, contextLoading]);

    // Loading state
    if (contextLoading || loading) {
        return (
            <div style={{ padding: 'var(--space-5)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
            </div>
        );
    }

    // No company context
    if (!companyId) {
        return (
            <div style={{ padding: 'var(--space-5)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>
                    Bem-vindo ao Parallax
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Nenhuma empresa selecionada.
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{ padding: 'var(--space-5)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>
                    Visão Geral
                </h1>
                <p style={{ color: 'var(--status-error)' }}>
                    Erro ao carregar dados: {error}
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--space-5)' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>
                    Visão Geral
                </h1>
                {companyName && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)' }}>
                        {companyName}
                    </p>
                )}
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div style={{
                    backgroundColor: 'var(--background-surface)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--background-border)'
                }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Total de Clientes
                    </p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {kpis?.totalClients ?? 0}
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--background-surface)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--background-border)'
                }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Profissionais Ativos
                    </p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {kpis?.activeProfessionals ?? 0}
                    </p>
                </div>

                <div style={{
                    backgroundColor: 'var(--background-surface)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--background-border)'
                }}>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Agendamentos Hoje
                    </p>
                    <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {kpis?.appointmentsToday ?? 0}
                    </p>
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                    Próximos Agendamentos
                </h2>

                {upcomingAppointments && upcomingAppointments.length > 0 ? (
                    <div style={{
                        backgroundColor: 'var(--background-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--background-border)',
                        overflow: 'hidden'
                    }}>
                        {upcomingAppointments.map((appointment, index) => (
                            <div
                                key={appointment.id}
                                style={{
                                    padding: 'var(--space-4)',
                                    borderBottom: index < upcomingAppointments.length - 1 ? '1px solid var(--background-border)' : 'none'
                                }}
                            >
                                <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                                    {appointment.clientName}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                    {appointment.serviceName} • {appointment.professionalName}
                                </p>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                    {new Date(appointment.startTime).toLocaleString('pt-BR', {
                                        dateStyle: 'short',
                                        timeStyle: 'short'
                                    })}
                                </p>
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
                            Nenhum agendamento próximo
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
