'use client';

import { useState } from 'react';
import { useUserContext } from '../../context/UserContext';


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
        if (!isExpanded) {
            setIsExpanded(true);
            setExpandedGroup(groupTitle);
        } else {
            setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
        }
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
     */
    const isGroupVisible = (group: NavGroup): boolean => {
        if (group.roles && role && !group.roles.includes(role)) {
            return false;
        }
        const visibleItems = group.items.filter(isItemVisible);
        return visibleItems.length > 0;
    };

    const getVisibleItems = (group: NavGroup): NavItem[] => {
        return group.items.filter(isItemVisible);
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`md:hidden fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsExpanded(false)}
            />

            <aside
                className={`
                    relative z-30 flex flex-col h-screen
                    glass border-r border-white/20
                    transition-all duration-300 ease-in-out
                    ${isExpanded ? 'w-60' : 'w-20'}
                    ${!isExpanded ? 'items-center' : ''}
                `}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -right-3 top-6 bg-primary text-white p-1 rounded-full shadow-lg hover:bg-cyan-600 transition-colors z-50 md:flex hidden"
                >
                    <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▶
                    </span>
                </button>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20">
                    {navigationGroups
                        .filter(isGroupVisible)
                        .map((group) => {
                            const visibleItems = getVisibleItems(group);
                            const isGroupExpanded = expandedGroup === group.title;

                            return (
                                <div
                                    key={group.title}
                                    className={`mb-2 px-3 ${!isExpanded ? 'w-full px-2' : ''}`}
                                >
                                    {/* Group Header */}
                                    <div
                                        className={`
                                            flex items-center p-2 rounded-lg cursor-pointer
                                            transition-colors duration-200
                                            hover:bg-white/10 text-slate-700
                                            ${!isExpanded ? 'justify-center' : 'justify-between'}
                                        `}
                                        onClick={() => toggleGroup(group.title)}
                                        title={group.title}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{group.icon}</span>
                                            {isExpanded && (
                                                <span className="font-semibold text-sm uppercase tracking-wide opacity-80">
                                                    {group.title}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded && (
                                            <span className={`text-xs transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        )}
                                    </div>

                                    {/* Group Items */}
                                    <div className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${(isGroupExpanded || !isExpanded) ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
                                    `}>
                                        <div className="flex flex-col gap-1">
                                            {visibleItems.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className={`
                                                        flex items-center p-2 rounded-md cursor-pointer
                                                        text-slate-600 hover:text-primary hover:bg-cyan-50
                                                        transition-all duration-200
                                                        ${!isExpanded ? 'justify-center' : 'pl-9'}
                                                    `}
                                                    title={item.label}
                                                >
                                                    <span className={`${!isExpanded ? 'text-lg' : 'text-sm'}`}>{item.icon}</span>
                                                    {isExpanded && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </nav>
            </aside>
        </>
    );
}
