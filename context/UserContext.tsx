'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { fetchUserContext, UserContextData } from '../services/userContextService';
import { setActiveCompany } from '../services/companyService';

interface UserContextValue extends UserContextData {
    loading: boolean;
    error: string | null;
    switchCompany: (companyId: string) => Promise<void>;
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
 * - Supports company switching via switchCompany()
 */
export function UserContextProvider({ children }: UserContextProviderProps) {
    const [contextValue, setContextValue] = useState<Omit<UserContextValue, 'switchCompany'>>({
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

    const loadUserContext = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        loadUserContext();
    }, [loadUserContext]);

    /**
     * Switch active company
     * Calls RPC set_active_company and reloads context
     */
    const switchCompany = useCallback(async (companyId: string) => {
        try {
            setContextValue(prev => ({ ...prev, loading: true, error: null }));

            const { success, error } = await setActiveCompany(companyId);

            if (!success) {
                setContextValue(prev => ({
                    ...prev,
                    loading: false,
                    error: error || 'Failed to switch company',
                }));
                return;
            }

            // Reload context after successful switch
            await loadUserContext();
        } catch (err) {
            console.error('Failed to switch company:', err);
            setContextValue(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to switch company',
            }));
        }
    }, [loadUserContext]);

    const valueWithSwitch: UserContextValue = {
        ...contextValue,
        switchCompany,
    };

    return (
        <UserContext.Provider value={valueWithSwitch}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook to access user context
 * 
 * Usage:
 * const { userId, companyId, loading, error, switchCompany } = useUserContext();
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
