'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchUserContext, UserContextData } from '../services/userContextService';

interface UserContextValue extends UserContextData {
    loading: boolean;
    error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserContextProviderProps {
    children: ReactNode;
}

/**
 * UserContextProvider
 * 
 * Loads user/company context from view_user_context on mount
 * Makes context available to entire app via useUserContext hook
 * 
 * Behavior:
 * - Loads once on mount
 * - Assumes first row as active context
 * - Handles loading/error states gracefully
 * - Never blocks layout render
 * - Never throws unhandled exceptions
 */
export function UserContextProvider({ children }: UserContextProviderProps) {
    const [contextValue, setContextValue] = useState<UserContextValue>({
        userId: null,
        fullName: null,
        email: null,
        companyId: null,
        companyName: null,
        branchId: null,
        role: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function loadUserContext() {
            try {
                const { data, error } = await fetchUserContext();

                setContextValue({
                    userId: data?.userId || null,
                    fullName: data?.fullName || null,
                    email: data?.email || null,
                    companyId: data?.companyId || null,
                    companyName: data?.companyName || null,
                    branchId: data?.branchId || null,
                    role: data?.role || null,
                    loading: false,
                    error: error,
                });
            } catch (err) {
                console.error('Failed to load user context:', err);
                setContextValue(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to load user context',
                }));
            }
        }

        loadUserContext();
    }, []);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access user context
 * 
 * Usage:
 * const { userId, companyId, loading, error } = useUserContext();
 * 
 * Always check loading before using data
 * Always handle error state appropriately
 */
export function useUserContext(): UserContextValue {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error('useUserContext must be used within UserContextProvider');
    }

    return context;
}
