'use client';

import '../styles/layout.css';

export default function Header() {
    return (
        <header className="layout-header">
            <div className="header-breadcrumb">
                <span>Início</span>
            </div>

            <div className="header-search">
                <input type="search" placeholder="Buscar..." />
            </div>

            <div className="header-user">
                <div className="user-avatar">U</div>
            </div>
        </header>
    );
}
