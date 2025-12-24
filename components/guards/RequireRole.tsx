'use client';

import { ReactNode } from 'react';
import { useUserContext } from '../../context/UserContext';

interface RequireRoleProps {
    allowedRoles: string[];
    children: ReactNode;
}

/**
 * RequireRole - Lightweight role-based route guard
 * 
 * Behavior:
 * - While loading: render children (no blocking)
 * - If role is allowed: render children
 * - If role is not allowed: render fallback message
 * 
 * This is frontend-only enforcement (V1)
 * Backend enforcement must be handled separately via RLS
 */
export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
    const { role, loading } = useUserContext();

    // While loading, render children (no blocking)
    if (loading) {
        return <>{children}</>;
    }

    // Check if user role is allowed
    const isAllowed = role && allowedRoles.includes(role);

    if (!isAllowed) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 'var(--space-3)',
            }}>
                <h1 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--text-primary)',
                }}>
                    Acesso restrito
                </h1>
                <p style={{
                    fontSize: 'var(--font-size-md)',
                    color: 'var(--text-secondary)',
                }}>
                    Você não tem permissão para acessar esta área.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
