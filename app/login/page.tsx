'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useAuth();
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const success = await signIn(email, password);

        if (success) {
            router.push('/operacao/agenda');
        } else {
            setError('Email ou senha inválidos');
        }

        setLoading(false);
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--background-default)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: 'var(--space-6)',
                backgroundColor: 'var(--background-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
                <h1 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    marginBottom: 'var(--space-6)',
                    textAlign: 'center',
                    color: 'var(--text-primary)',
                }}>
                    Parallax
                </h1>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            marginBottom: 'var(--space-2)',
                            color: 'var(--text-primary)',
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 'var(--space-3)',
                                fontSize: 'var(--font-size-base)',
                                border: '1px solid var(--background-border)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--background-default)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)',
                            marginBottom: 'var(--space-2)',
                            color: 'var(--text-primary)',
                        }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: 'var(--space-3)',
                                fontSize: 'var(--font-size-base)',
                                border: '1px solid var(--background-border)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--background-default)',
                                color: 'var(--text-primary)',
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--space-3)',
                            marginBottom: 'var(--space-4)',
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            borderRadius: 'var(--radius-md)',
                            color: '#c33',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--space-3)',
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: '#fff',
                            backgroundColor: 'var(--color-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
