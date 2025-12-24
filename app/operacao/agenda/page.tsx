import RequireRole from '@/components/guards/RequireRole';

export default function AgendaPage() {
    return (
        <RequireRole allowedRoles={['admin', 'professional', 'client']}>
            <div>
                <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                    Agenda
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Visualização de agenda - em desenvolvimento
                </p>
            </div>
        </RequireRole>
    );
}
