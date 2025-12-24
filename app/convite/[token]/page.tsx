'use client';

import { useEffect, useState } from 'react';
import { acceptInvite } from '../../../services/usersService';

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function handleAccept() {
            setLoading(true);

            const { success: accepted, error: acceptError } = await acceptInvite(params.token);

            if (accepted) {
                setSuccess(true);
            } else {
                setError(acceptError || 'Convite inválido ou expirado');
            }

            setLoading(false);
        }

        handleAccept();
    }, [params.token]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--space-5)',
            gap: 'var(--space-4)',
        }}>
            {loading && (
                <>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        Processando convite...
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Aguarde um momento
                    </p>
                </>
            )}

            {!loading && success && (
                <>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-success)' }}>
                        Convite aceito com sucesso!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Você agora faz parte da empresa.
                        <br />
                        Faça login para acessar o sistema.
                    </p>
                </>
            )}

            {!loading && error && (
                <>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--status-error)' }}>
                        Erro ao aceitar convite
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                        {error}
                    </p>
                </>
            )}
        </div>
    );
}
