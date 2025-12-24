import RequireRole from '@/components/guards/RequireRole';

export default function ClientesPage() {
    return (
        <RequireRole allowedRoles={['admin', 'professional']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Clientes
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Gestão de clientes - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
