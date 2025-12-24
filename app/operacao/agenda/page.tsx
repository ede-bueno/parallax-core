'use client';

import { useState } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function AgendaPage() {
    return (
        <RequireAuth>
            <AgendaContent />
        </RequireAuth>
    );
}

function AgendaContent() {
    const { user, activeCompany } = useAuth();
    const [testResult, setTestResult] = useState<string>('');
    const [testing, setTesting] = useState(false);

    async function testRPC() {
        if (!activeCompany) {
            setTestResult('Erro: Nenhuma empresa ativa');
            return;
        }

        setTesting(true);
        setTestResult('Testando RPC create_appointment...');

        try {
            // Mock appointment data for testing
            const mockData = {
                company_id: activeCompany.company_id,
                branch_id: activeCompany.branch_id || activeCompany.company_id, // Fallback if no branch
                professional_id: 'test-prof-id',
                client_id: 'test-client-id',
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 3600000).toISOString(),
            };

            const { data, error } = await supabase!.rpc('create_appointment', mockData);

            if (error) {
                setTestResult(`Erro RPC: ${error.message}`);
            } else {
                setTestResult(`Sucesso! Appointment ID: ${data}`);
            }
        } catch (err) {
            setTestResult(`Erro: ${err instanceof Error ? err.message : 'Unknown'}`);
        } finally {
            setTesting(false);
        }
    }

    return (
        <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
                Agenda
            </h1>

            <div style={{
                padding: '16px',
                backgroundColor: 'var(--background-surface)',
                borderRadius: '8px',
                marginBottom: '24px',
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                    Informações da Sessão
                </h2>
                <p style={{ marginBottom: '8px' }}>
                    <strong>Usuário:</strong> {user?.email}
                </p>
                <p style={{ marginBottom: '8px' }}>
                    <strong>Company ID:</strong> {activeCompany?.company_id}
                </p>
                <p>
                    <strong>Branch ID:</strong> {activeCompany?.branch_id || 'Nenhuma'}
                </p>
            </div>

            <div style={{
                padding: '16px',
                backgroundColor: 'var(--background-surface)',
                borderRadius: '8px',
            }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
                    Teste de RPC
                </h2>
                <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Testar chamada RPC autenticada (create_appointment)
                </p>
                <button
                    onClick={testRPC}
                    disabled={testing}
                    style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#fff',
                        backgroundColor: 'var(--color-primary)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: testing ? 'not-allowed' : 'pointer',
                        opacity: testing ? 0.6 : 1,
                        marginBottom: '12px',
                    }}
                >
                    {testing ? 'Testando...' : 'Testar RPC'}
                </button>
                {testResult && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: testResult.includes('Erro') ? '#fee' : '#efe',
                        border: `1px solid ${testResult.includes('Erro') ? '#fcc' : '#cfc'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: testResult.includes('Erro') ? '#c33' : '#363',
                    }}>
                        {testResult}
                    </div>
                )}
            </div>
        </div>
    );
}
