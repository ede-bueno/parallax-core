'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout, getCurrentUser, loadUserActiveCompany, AuthUser, UserActiveCompany } from '../services/authService';

interface AuthContextValue {
    user: AuthUser | null;
    activeCompany: UserActiveCompany | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [activeCompany, setActiveCompany] = useState<UserActiveCompany | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Load session on mount
    useEffect(() => {
        loadSession();
    }, []);

    async function loadSession() {
        try {
            setLoading(true);
            setError(null);

            const { user: currentUser, error: userError } = await getCurrentUser();

            if (userError || !currentUser) {
                setUser(null);
                setActiveCompany(null);
                setLoading(false);
                return;
            }

            setUser(currentUser);

            // Load user_active_company (REQUIRED)
            const { data: companyData, error: companyError } = await loadUserActiveCompany();

            if (companyError || !companyData) {
                setError('No active company found. Contact administrator.');
                setActiveCompany(null);
                setLoading(false);
                return;
            }

            setActiveCompany(companyData);
            setLoading(false);
        } catch (err) {
            console.error('Failed to load session:', err);
            setError('Failed to load session');
            setLoading(false);
        }
    }

    async function signIn(email: string, password: string): Promise<boolean> {
        try {
            setLoading(true);
            setError(null);

            const { user: authUser, error: loginError } = await login(email, password);

            if (loginError || !authUser) {
                setError(loginError || 'Login failed');
                setLoading(false);
                return false;
            }

            setUser(authUser);

            // CRITICAL: Load user_active_company after login
            const { data: companyData, error: companyError } = await loadUserActiveCompany();

            if (companyError || !companyData) {
                setError('No active company found for this user');
                setActiveCompany(null);
                setLoading(false);
                return false;
            }

            setActiveCompany(companyData);
            setLoading(false);
            return true;
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Sign in failed');
            setLoading(false);
            return false;
        }
    }

    async function signOut() {
        try {
            await logout();
            setUser(null);
            setActiveCompany(null);
            router.push('/login');
        } catch (err) {
            console.error('Sign out error:', err);
        }
    }

    const value: AuthContextValue = {
        user,
        activeCompany,
        loading,
        error,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
