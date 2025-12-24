import RequireRole from '@/components/guards/RequireRole';

export default function SistemaPage() {
    return (
        <RequireRole allowedRoles={['admin']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Sistema
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Configurações do sistema - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
