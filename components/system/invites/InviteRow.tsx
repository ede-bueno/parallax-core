import { useState } from 'react';
import { cancelInvite, PendingInvite } from '../../../services/usersService';

export default function InviteRow({
    invite,
    onInviteCanceled
}: {
    invite: PendingInvite;
    onInviteCanceled: () => void
}) {
    const [canceling, setCanceling] = useState(false);

    const handleCancel = async () => {
        if (!confirm(`Cancelar convite para ${invite.email}?`)) return;

        setCanceling(true);
        const { success } = await cancelInvite(invite.id);
        setCanceling(false);

        if (success) onInviteCanceled();
    };

    return (
        <div style={{
            padding: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--background-border)'
        }}>
            <div style={{ flex: 1 }}>
                <p style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--text-primary)'
                }}>
                    {invite.email}
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {invite.role} • {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                </p>
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
