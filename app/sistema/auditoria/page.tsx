'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import { fetchAuditLogs, AuditLog } from '../../../services/auditService';

export default function AuditoriaPage() {
    const { companyId, loading: contextLoading } = useUserContext();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadLogs() {
            if (contextLoading || !companyId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await fetchAuditLogs(companyId);

                if (fetchError) {
                    setError(fetchError);
                } else {
                    setLogs(data || []);
                }
            } catch (err) {
                console.error('Load error:', err);
                setError('Erro ao carregar logs de auditoria');
            } finally {
                setLoading(false);
            }
        }

        loadLogs();
    }, [companyId, contextLoading]);

    return (
        <RequireRole allowedRoles={['admin']}>
            <div style={{ padding: 'var(--space-5)' }}>
                <h1 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--space-5)',
                }}>
                    Auditoria
                </h1>

                {loading && <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>}
                {error && !loading && <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>}
                {!companyId && !contextLoading && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>}

                {!loading && !error && companyId && (
                    <div>
                        {logs.length === 0 ? (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                padding: 'var(--space-5)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Nenhum log de auditoria encontrado</p>
                            </div>
                        ) : (
                            <div style={{
                                backgroundColor: 'var(--background-surface)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--background-border)',
                                overflow: 'hidden'
                            }}>
                                {logs.map((log, index) => (
                                    <div
                                        key={log.id}
                                        style={{
                                            padding: 'var(--space-4)',
                                            borderBottom: index < logs.length - 1 ? '1px solid var(--background-border)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{
                                                    fontSize: 'var(--font-size-md)',
                                                    fontWeight: 'var(--font-weight-medium)',
                                                    color: 'var(--text-primary)',
                                                    marginBottom: 'var(--space-1)',
                                                }}>
                                                    {log.actionType}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                    Ator: {log.actorName || log.actorEmail}
                                                </p>
                                                {log.targetUserId && (
                                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                                        Alvo: {log.targetName || log.targetEmail}
                                                    </p>
                                                )}
                                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                    <details style={{ marginTop: 'var(--space-2)' }}>
                                                        <summary style={{
                                                            fontSize: 'var(--font-size-sm)',
                                                            color: 'var(--text-muted)',
                                                            cursor: 'pointer'
                                                        }}>
                                                            Metadados
                                                        </summary>
                                                        <pre style={{
                                                            fontSize: 'var(--font-size-sm)',
                                                            color: 'var(--text-muted)',
                                                            marginTop: 'var(--space-2)',
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word',
                                                        }}>
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                            <p style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--text-muted)',
                                                marginLeft: 'var(--space-4)',
                                            }}>
                                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </RequireRole>
    );
}
