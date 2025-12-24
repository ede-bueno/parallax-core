import RequireRole from '@/components/guards/RequireRole';

export default function AtendimentosPage() {
    return (
        <RequireRole allowedRoles={['admin', 'professional']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Atendimentos
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Gestão de atendimentos - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
