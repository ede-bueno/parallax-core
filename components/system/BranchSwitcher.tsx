'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { fetchMyBranches, Branch } from '../../services/branchService';

export default function BranchSwitcher() {
    const { companyId, branchId, role, loading: contextLoading, switchBranch } = useUserContext();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Only show for admin and professional
    const canSeeBranchSelector = role === 'admin' || role === 'professional';

    useEffect(() => {
        async function loadBranches() {
            if (!companyId || !canSeeBranchSelector) {
                setBranches([]);
                return;
            }

            setLoading(true);
            const { data } = await fetchMyBranches(companyId);
            setBranches(data || []);
            setLoading(false);
        }

        loadBranches();
    }, [companyId, canSeeBranchSelector]);

    const handleBranchSelect = async (selectedBranchId: string | null) => {
        setIsOpen(false);
        if (selectedBranchId === branchId) return; // Already selected
        await switchBranch(selectedBranchId);
    };

    // Don't render for clients
    if (!canSeeBranchSelector) {
        return null;
    }

    // Don't render if no company selected
    if (!companyId) {
        return null;
    }

    const activeBranch = branches.find(b => b.id === branchId);
    const displayText = branchId ? activeBranch?.name || 'Filial' : 'Todas as filiais';

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={contextLoading || loading || branches.length === 0}
                style={{
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--background-surface)',
                    border: '1px solid var(--background-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: branches.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: contextLoading || loading || branches.length === 0 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                }}
            >
                <span>{displayText}</span>
                <span style={{ fontSize: 'var(--font-size-xs)' }}>▼</span>
            </button>

            {isOpen && branches.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + var(--space-1))',
                        right: 0,
                        minWidth: '200px',
                        backgroundColor: 'var(--background-surface)',
                        border: '1px solid var(--background-border)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        zIndex: 1000,
                    }}
                >
                    {/* "All branches" option for admin */}
                    {role === 'admin' && (
                        <button
                            onClick={() => handleBranchSelect(null)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-2) var(--space-3)',
                                backgroundColor: branchId === null ? 'var(--background-hover)' : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--background-border)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: 'var(--font-size-sm)',
                            }}
                            onMouseEnter={(e) => {
                                if (branchId !== null) {
                                    e.currentTarget.style.backgroundColor = 'var(--background-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (branchId !== null) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            Todas as filiais
                        </button>
                    )}

                    {/* Branch list */}
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => handleBranchSelect(branch.id)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-2) var(--space-3)',
                                backgroundColor: branch.id === branchId ? 'var(--background-hover)' : 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: 'var(--font-size-sm)',
                            }}
                            onMouseEnter={(e) => {
                                if (branch.id !== branchId) {
                                    e.currentTarget.style.backgroundColor = 'var(--background-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (branch.id !== branchId) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <div>{branch.name}</div>
                            {branch.client_count !== undefined && branch.professional_count !== undefined && (
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                                    {branch.client_count} clientes • {branch.professional_count} profissionais
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
