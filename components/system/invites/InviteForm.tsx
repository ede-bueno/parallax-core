import { useState } from 'react';
import { inviteCompanyUser } from '../../../services/usersService';
import { Role } from '../../../services/settingsService';

export default function InviteForm({
    roles,
    onInviteSent
}: {
    roles: Role[];
    onInviteSent: () => void
}) {
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
