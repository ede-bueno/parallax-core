'use client';

import { useEffect, useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import { getMyCompanies, Company } from '../../services/companyService';
import '../../styles/layout.css';

export default function Header() {
    const { companyId, companyName, switchCompany, loading: contextLoading } = useUserContext();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    useEffect(() => {
        async function loadCompanies() {
            if (contextLoading) return;

            try {
                const { data, error } = await getMyCompanies();

                if (!error && data) {
                    setCompanies(data);
                }
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setLoadingCompanies(false);
            }
        }

        loadCompanies();
    }, [contextLoading]);

    const handleCompanyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompanyId = event.target.value;
        if (newCompanyId && newCompanyId !== companyId) {
            await switchCompany(newCompanyId);
        }
    };

    // Hide selector if only one company or no companies
    const showSelector = companies.length > 1;

    return (
        <header className="layout-header">
            <div className="header-breadcrumb">
                <span>Início</span>
            </div>

            <div className="header-search">
                <input type="search" placeholder="Buscar..." />
            </div>

            {showSelector && !loadingCompanies && (
                <div style={{ marginRight: 'var(--space-4)' }}>
                    <select
                        value={companyId || ''}
                        onChange={handleCompanyChange}
                        style={{
                            padding: 'var(--space-2) var(--space-3)',
                            backgroundColor: 'var(--background-default)',
                            border: '1px solid var(--background-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                        }}
                    >
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="header-user">
                <div className="user-avatar">U</div>
            </div>
        </header>
    );
}
