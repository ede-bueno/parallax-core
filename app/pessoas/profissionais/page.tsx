import RequireRole from '@/components/guards/RequireRole';

export default function ProfissionaisPage() {
    return (
        <RequireRole allowedRoles={['admin']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Profissionais
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Gestão de profissionais - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
