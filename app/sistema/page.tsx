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
import {
    addCompanyUser,
    updateUserRole,
    removeUser,
    inviteCompanyUser,
    cancelInvite,
    fetchPendingInvites,
    PendingInvite
} from '../../services/usersService';
import InviteForm from '@/components/system/invites/InviteForm';
import InviteRow from '@/components/system/invites/InviteRow';

// Helper component: Add User Form
function AddUserForm({ roles, onUserAdded }: { roles: Role[]; onUserAdded: () => void }) {
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !selectedRole) return;

        setLoading(true);
        setError(null);

        const { success, error: rpcError } = await addCompanyUser(email, selectedRole);

        if (success) {
            setEmail('');
            setSelectedRole('');
            onUserAdded();
        } else {
            setError(rpcError || 'Erro ao adicionar usuário');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <input
                type="email"
                placeholder="Email do usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                    flex: '1 1 200px',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--background-default)',
                    border: '1px solid var(--background-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                }}
                required
            />
            <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                    flex: '1 1 150px',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--background-default)',
                    border: '1px solid var(--background-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                }}
                required
            >
                <option value="">Selecione role</option>
                {roles.map(role => (
                    <option key={role.id} value={role.name}>{role.name}</option>
                ))}
            </select>
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: 'var(--action-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
            {error && <p style={{ width: '100%', color: 'var(--status-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
        </form>
    );
}

// Helper component: User Row
function UserRow({ user, roles, isLast, onUserUpdated }: { user: CompanyUser; roles: Role[]; isLast: boolean; onUserUpdated: () => void }) {
    const [updating, setUpdating] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleRoleChange = async (newRole: string) => {
        if (newRole === user.role) return;

        setUpdating(true);
        const { success } = await updateUserRole(user.id, newRole);
        setUpdating(false);

        if (success) onUserUpdated();
    };

    const handleRemove = async () => {
        if (!confirm(`Remover usuário ${user.fullName}?`)) return;

        setRemoving(true);
        const { success } = await removeUser(user.id);
        setRemoving(false);

        if (success) onUserUpdated();
    };

    return (
        <div style={{ padding: 'var(--space-4)', borderBottom: !isLast ? '1px solid var(--background-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{user.fullName}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{user.email}</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={updating}
                    style={{
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--background-default)',
                        border: '1px solid var(--background-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: updating ? 'not-allowed' : 'pointer',
                    }}
                >
                    {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleRemove}
                    disabled={removing}
                    style={{
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: 'var(--status-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: removing ? 'not-allowed' : 'pointer',
                        opacity: removing ? 0.6 : 1,
                    }}
                >
                    {removing ? '...' : 'Remover'}
                </button>
            </div>
        </div>
    );
    // Helper component: Invite Form  
    function InviteForm({ roles, onInviteSent }: { roles: Role[]; onInviteSent: () => void }) {
        const [email, setEmail] = useState('');
        const [selectedRole, setSelectedRole] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!email || !selectedRole) return;

            setLoading(true);
            setError(null);

            const { success, error: rpcError } = await inviteCompanyUser(email, selectedRole);

            if (success) {
                setEmail('');
                setSelectedRole('');
                onInviteSent();
            } else {
                setError(rpcError || 'Erro ao enviar convite');
            }

            setLoading(false);
        };

        return (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <input
                    type="email"
                    placeholder="Email do usuário"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        flex: '1 1 200px',
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--background-default)',
                        border: '1px solid var(--background-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                    }}
                    required
                />
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    style={{
                        flex: '1 1 150px',
                        padding: 'var(--space-2)',
                        backgroundColor: 'var(--background-default)',
                        border: '1px solid var(--background-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                    }}
                    required
                >
                    <option value="">Selecione role</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: 'var(--space-2) var(--space-4)',
                        backgroundColor: 'var(--action-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar Convite'}
                </button>
                {error && <p style={{ width: '100%', color: 'var(--status-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>}
            </form>
        );
    }

    //  Helper component: Invite Row
    function InviteRow({ invite, onInviteCanceled }: { invite: PendingInvite; onInviteCanceled: () => void }) {
        const [canceling, setCanceling] = useState(false);

        const handleCancel = async () => {
            if (!confirm(`Cancelar convite para ${invite.email}?`)) return;

            setCanceling(true);
            const { success } = await cancelInvite(invite.id);
            setCanceling(false);

            if (success) onInviteCanceled();
        };

        return (
            <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--background-border' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>{invite.email}</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{invite.role} • {new Date(invite.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <button
                    onClick={handleCancel}
                    disabled={canceling}
                    style={{
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: 'var(--status-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: canceling ? 'not-allowed' : 'pointer',
                        opacity: canceling ? 0.6 : 1,
                    }}
                >
                    {canceling ? '...' : 'Cancelar'}
                </button>
            </div>
        );
    }
}

export default function SistemaPage() {
    const { companyId, loading: contextLoading } = useUserContext();
    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [users, setUsers] = useState<CompanyUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [plan, setPlan] = useState<CompanyPlan | null>(null);
    const [invites, setInvites] = useState<PendingInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function loadSettings() {
        if (!companyId) return;

        try {
            setLoading(true);
            setError(null);

            const [detailsResult, usersResult, rolesResult, permissionsResult, planResult, invitesResult] =
                await Promise.all([
                    fetchCompanyDetails(companyId),
                    fetchCompanyUsers(companyId),
                    fetchRoles(),
                    fetchPermissions(),
                    fetchCompanyPlan(companyId),
                    fetchPendingInvites(companyId),
                ]);

            if (detailsResult.error) setError(detailsResult.error);
            else setCompanyDetails(detailsResult.data);

            if (!usersResult.error) setUsers(usersResult.data || []);
            if (!rolesResult.error) setRoles(rolesResult.data || []);
            if (!permissionsResult.error) setPermissions(permissionsResult.data || []);
            if (!planResult.error) setPlan(planResult.data);
            if (!invitesResult.error) setInvites(invitesResult.data || []);
        } catch (err) {
            console.error('Settings load error:', err);
            setError('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (contextLoading || !companyId) {
            setLoading(false);
            return;
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

                            {/* Add User Form */}
                            <div style={{ backgroundColor: 'var(--background-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-3)' }}>Adicionar Usuário</h3>
                                <AddUserForm roles={roles} onUserAdded={loadSettings} />
                            </div>

                            {/* Users List */}
                            <div style={{ backgroundColor: 'var(--background-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', overflow: 'hidden' }}>
                                {users.map((user, index) => (
                                    <UserRow key={user.id} user={user} roles={roles} isLast={index === users.length - 1} onUserUpdated={loadSettings} />
                                ))}
                            </div>
                        </section>

                        {/* Pending Invites */}
                        <section>
                            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Convites Pendentes ({invites.length})
                            </h2>

                            {/* Invite Form */}
                            <div style={{ backgroundColor: 'var(--background-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-3)' }}>Enviar Convite</h3>
                                <InviteForm roles={roles} onInviteSent={loadSettings} />
                            </div>

                            {/* Invites List */}
                            {invites.length > 0 ? (
                                <div style={{ backgroundColor: 'var(--background-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', overflow: 'hidden' }}>
                                    {invites.map(invite => (
                                        <InviteRow key={invite.id} invite={invite} onInviteCanceled={loadSettings} />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ backgroundColor: 'var(--background-surface)', padding: 'var(--space-5)', borderRadius: 'var(--radius-md)', border: '1px solid var(--background-border)', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum convite pendente</p>
                                </div>
                            )}
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

