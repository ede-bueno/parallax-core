'use client';

import { useState } from 'react';
import '../styles/layout.css';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

interface NavGroup {
  title: string;
  icon: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Visão Geral',
    icon: '📊',
    items: [{ label: 'Visão Geral', icon: '📊', path: '/' }],
  },
  {
    title: 'Operação',
    icon: '📅',
    items: [
      { label: 'Agenda', icon: '📅', path: '/agenda' },
      { label: 'Atendimentos', icon: '✅', path: '/atendimentos' },
      { label: 'Serviços', icon: '💼', path: '/servicos' },
    ],
  },
  {
    title: 'Pessoas',
    icon: '👥',
    items: [
      { label: 'Clientes', icon: '👤', path: '/clientes' },
      { label: 'Profissionais', icon: '👨‍⚕️', path: '/profissionais' },
    ],
  },
  {
    title: 'Financeiro',
    icon: '💰',
    items: [
      { label: 'Caixa', icon: '💵', path: '/caixa' },
      { label: 'Relatórios', icon: '📈', path: '/relatorios' },
    ],
  },
  {
    title: 'Sistema',
    icon: '⚙️',
    items: [
      { label: 'Configurações', icon: '⚙️', path: '/configuracoes' },
      { label: 'Usuários', icon: '👥', path: '/usuarios' },
      { label: 'Permissões', icon: '🔒', path: '/permissoes' },
    ],
  },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Visão Geral');

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroup(expandedGroup === groupTitle ? null : groupTitle);
  };

  return (
    <aside
      className={`layout-sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${!isExpanded ? 'sidebar-collapsed' : ''}`}
    >
      <nav className="sidebar-nav">
        {navigationGroups.map((group) => (
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
              {group.items.map((item) => (
                <div key={item.label} className="nav-item">
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
