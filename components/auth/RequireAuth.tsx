'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface RequireAuthProps {
    children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
    const { user, activeCompany, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <p>Carregando...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!activeCompany) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <p>Nenhuma empresa ativa encontrada.</p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    Entre em contato com o administrador.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
