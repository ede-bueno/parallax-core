'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import {
    fetchCompanyDetails,
    fetchCompanyUsers,
    fetchRoles,
    fetchPermissions,
    fetchCompanyPlan,
    CompanyDetails,
    CompanyUser,
    Role,
    Permission,
    CompanyPlan,
} from '../../services/settingsService';

export default function SistemaPage() {
    const { companyId, loading: contextLoading } = useUserContext();
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [users, setUsers] = useState<CompanyUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [plan, setPlan] = useState<CompanyPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSettings() {
            if (contextLoading || !companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [detailsResult, usersResult, rolesResult, permissionsResult, planResult] =
                    await Promise.all([
                        fetchCompanyDetails(companyId),
                        fetchCompanyUsers(companyId),
                        fetchRoles(),
                        fetchPermissions(),
                        fetchCompanyPlan(companyId),
                    ]);

                if (detailsResult.error) setError(detailsResult.error);
                else setCompanyDetails(detailsResult.data);

                if (!usersResult.error) setUsers(usersResult.data || []);
                if (!rolesResult.error) setRoles(rolesResult.data || []);
                if (!permissionsResult.error) setPermissions(permissionsResult.data || []);
                if (!planResult.error) setPlan(planResult.data);
            } catch (err) {
                console.error('Settings load error:', err);
                setError('Erro ao carregar configurações');
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, [companyId, contextLoading]);

    return (
        <RequireRole allowedRoles={['admin']}>
            <div style={{ padding: 'var(--space-5)' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-5)' }}>
                    Configurações do Sistema
                </h1>

                {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>}
                {error && !loading && <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>}
                {!companyId && !contextLoading && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>}

                {!loading && !error && companyId && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {/* Company Details */}
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Dados da Empresa
                            </h2>
                            {companyDetails && (
                                <div style={{ backgroundColor: 'var(--background-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Razão Social</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{companyDetails.name}</p></div>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Nome Fantasia</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{companyDetails.tradeName}</p></div>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>CNPJ</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{companyDetails.document}</p></div>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Email</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{companyDetails.email}</p></div>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Telefone</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{companyDetails.phone}</p></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Users */}
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Usuários ({users.length})
                            </h2>
                            <div style={{ backgroundColor: 'var(--background-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', overflow: 'hidden' }}>
                                {users.map((user, index) => (
                                    <div key={user.id} style={{ padding: 'var(--space-4)', borderBottom: index < users.length - 1 ? '1px solid var(--background-border)' : 'none' }}>
                                        <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{user.fullName}</p>
                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{user.email} • {user.role}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Roles & Permissions */}
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Roles e Permissões
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-3)' }}>Roles</h3>
                                    {roles.map(role => (
                                        <div key={role.id} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--background-surface)', border: '1px solid var(--background-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}>
                                            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{role.name}</p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{role.description}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-3)' }}>Permissões</h3>
                                    {permissions.map(permission => (
                                        <div key={permission.id} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--background-surface)', border: '1px solid var(--background-border)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-2)' }}>
                                            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{permission.name}</p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{permission.resource}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Plan */}
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Plano Ativo
                            </h2>
                            {plan && (
                                <div style={{ backgroundColor: 'var(--background-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)' }}>
                                    <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>{plan.planName}</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Máx. Usuários</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{plan.maxUsers}</p></div>
                                        <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Máx. Filiais</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{plan.maxBranches}</p></div>
                                        {plan.expiresAt && (
                                            <div><p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Expira em</p><p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>{new Date(plan.expiresAt).toLocaleDateString('pt-BR')}</p></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </RequireRole>
    );
}
