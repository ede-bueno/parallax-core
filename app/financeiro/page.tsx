import RequireRole from '@/components/guards/RequireRole';

export default function FinanceiroPage() {
    return (
        <RequireRole allowedRoles={['admin']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Financeiro
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Módulo financeiro - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
