'use client';

import { useState } from 'react';
import { useUserContext } from '../../context/UserContext';
import '../../styles/layout.css';

interface NavItem {
    label: string;
    icon: string;
    path: string;
    roles?: string[]; // Optional: if not set, visible to all
}

interface NavGroup {
    title: string;
    icon: string;
    items: NavItem[];
    roles?: string[]; // Optional: if not set, visible to all
}

const navigationGroups: NavGroup[] = [
    {
        title: 'Visão Geral',
        icon: '📊',
        items: [{ label: 'Visão Geral', icon: '📊', path: '/' }],
        // Visible to all roles
    },
    {
        title: 'Operação',
        icon: '📅',
        items: [
            { label: 'Agenda', icon: '📅', path: '/agenda' },
            { label: 'Atendimentos', icon: '✅', path: '/atendimentos', roles: ['admin', 'professional'] },
            { label: 'Serviços', icon: '💼', path: '/servicos', roles: ['admin'] },
        ],
    },
    {
        title: 'Pessoas',
        icon: '👥',
        items: [
            { label: 'Clientes', icon: '👤', path: '/clientes', roles: ['admin', 'professional'] },
            { label: 'Profissionais', icon: '👨‍⚕️', path: '/profissionais', roles: ['admin'] },
        ],
        roles: ['admin', 'professional'], // Group only visible to admin and professional
    },
    {
        title: 'Financeiro',
        icon: '💰',
        items: [
            { label: 'Caixa', icon: '💵', path: '/caixa', roles: ['admin'] },
            { label: 'Relatórios', icon: '📈', path: '/relatorios', roles: ['admin'] },
        ],
        roles: ['admin'], // Group only visible to admin
    },
    {
        title: 'Sistema',
        icon: '⚙️',
        items: [
            { label: 'Configurações', icon: '⚙️', path: '/configuracoes', roles: ['admin'] },
            { label: 'Usuários', icon: '👥', path: '/usuarios', roles: ['admin'] },
            { label: 'Permissões', icon: '🔒', path: '/permissoes', roles: ['admin'] },
        ],
        roles: ['admin'], // Group only visible to admin
    },
];

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState<string | null>('Visão Geral');
    const { role } = useUserContext();

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
    };

    /**
     * Check if item is visible to current user role
     */
    const isItemVisible = (item: NavItem): boolean => {
        if (!item.roles) return true; // No role restriction
        if (!role) return false; // No role loaded yet
        return item.roles.includes(role);
    };

    /**
     * Check if group is visible to current user role
     * Group is visible if:
     * 1. Group has no role restriction, OR
     * 2. User role matches group roles, AND
     * 3. At least one child item is visible
     */
    const isGroupVisible = (group: NavGroup): boolean => {
        // Check if group itself has role restriction
        if (group.roles && role && !group.roles.includes(role)) {
            return false;
        }

        // Check if at least one item is visible
        const visibleItems = group.items.filter(isItemVisible);
        return visibleItems.length > 0;
    };

    /**
     * Get filtered items for a group based on user role
     */
    const getVisibleItems = (group: NavGroup): NavItem[] => {
        return group.items.filter(isItemVisible);
    };

    return (
        <aside
            className={`layout-sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${!isExpanded ? 'sidebar-collapsed' : ''}`}
        >
            <nav className="sidebar-nav">
                {navigationGroups
                    .filter(isGroupVisible)
                    .map((group) => {
                        const visibleItems = getVisibleItems(group);

                        return (
                            <div
                                key={group.title}
                                className={`nav-group ${expandedGroup !== group.title ? 'collapsed' : ''}`}
                            >
                                <div
                                    className="nav-group-header"
                                    onClick={() => toggleGroup(group.title)}
                                >
                                    <span className="nav-group-icon">{group.icon}</span>
                                    <span className="nav-group-title">{group.title}</span>
                                    <span className="nav-group-chevron">▼</span>
                                </div>
                                <div className="nav-items">
                                    {visibleItems.map((item) => (
                                        <div key={item.label} className="nav-item">
                                            <span className="nav-item-icon">{item.icon}</span>
                                            <span className="nav-item-label">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
            </nav>
        </aside>
    );
}
