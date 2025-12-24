'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../../../../context/UserContext';
import RequireRole from '@/components/guards/RequireRole';
import {
    fetchClientAnamnesisRecords,
    fetchAnamnesisAnswers,
    AnamnesisRecord,
    AnamnesisAnswer,
} from '../../../../../services/anamnesisService';

export default function ClientAnamnesiPage({ params }: { params: { id: string } }) {
    const { companyId, loading: contextLoading } = useUserContext();
    const [records, setRecords] = useState<AnamnesisRecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<AnamnesisRecord | null>(null);
    const [answers, setAnswers] = useState<AnamnesisAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAnswers, setLoadingAnswers] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clientId = params.id;

    useEffect(() => {
        async function loadRecords() {
            if (contextLoading || !companyId || !clientId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: recordsError } = await fetchClientAnamnesisRecords(
                    companyId,
                    clientId
                );

                if (recordsError) {
                    setError(recordsError);
                } else {
                    setRecords(data || []);
                }
            } catch (err) {
                console.error('Anamnesis load error:', err);
                setError('Erro ao carregar anamneses');
            } finally {
                setLoading(false);
            }
        }

        loadRecords();
    }, [companyId, clientId, contextLoading]);

    const handleSelectRecord = async (record: AnamnesisRecord) => {
        if (!companyId) return;

        setSelectedRecord(record);
        setLoadingAnswers(true);

        try {
            const { data, error: answersError } = await fetchAnamnesisAnswers(
                companyId,
                record.id
            );

            if (answersError) {
                console.error('Error loading answers:', answersError);
            } else {
                setAnswers(data || []);
            }
        } catch (err) {
            console.error('Answers load error:', err);
        } finally {
            setLoadingAnswers(false);
        }
    };

    const formatAnswer = (answer: AnamnesisAnswer): string => {
        if (answer.fieldType === 'boolean') {
            return answer.answer ? 'Sim' : 'Não';
        }
        return String(answer.answer || 'N/A');
    };

    return (
        <RequireRole allowedRoles={['admin', 'professional']}>
            <div style={{ padding: 'var(--space-5)' }}>
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Anamneses do Cliente
                    </h1>
                </div>

                {/* Loading */}
                {loading && (
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
                )}

                {/* Error */}
                {error && !loading && (
                    <p style={{ color: 'var(--status-error)' }}>Erro: {error}</p>
                )}

                {/* No company */}
                {!companyId && !contextLoading && (
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhuma empresa selecionada</p>
                )}

                {/* Content */}
                {!loading && !error && companyId && (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1fr 2fr' : '1fr', gap: 'var(--space-5)' }}>
                        {/* Records List */}
                        <div>
                            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                Registros
                            </h2>

                            {records.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {records.map(record => (
                                        <div
                                            key={record.id}
                                            onClick={() => handleSelectRecord(record)}
                                            style={{
                                                padding: 'var(--space-4)',
                                                backgroundColor: selectedRecord?.id === record.id ? 'var(--action-primary-subtle)' : 'var(--background-surface)',
                                                border: '1px solid var(--background-border)',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                                                {record.templateName}
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
                                                {record.professionalName}
                                            </p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
                                                {new Date(record.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: 'var(--background-surface)',
                                    padding: 'var(--space-5)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--background-border)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        Nenhuma anamnese registrada
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Answers View */}
                        {selectedRecord && (
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>
                                    {selectedRecord.templateName}
                                </h2>

                                {loadingAnswers ? (
                                    <p style={{ color: 'var(--text-secondary)' }}>Carregando respostas...</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                        {answers.map(answer => (
                                            <div
                                                key={answer.questionId}
                                                style={{
                                                    padding: 'var(--space-4)',
                                                    backgroundColor: 'var(--background-surface)',
                                                    border: '1px solid var(--background-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                }}
                                            >
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                                    {answer.questionText}
                                                </p>
                                                <p style={{ fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
                                                    {formatAnswer(answer)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </RequireRole>
    );
}
