'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/layout.css';

interface LayoutShellProps {
    children: ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
    return (
        <div className="layout-shell">
            <Sidebar />
            <div className="layout-main">
                <Header />
                <main className="layout-content">{children}</main>
            </div>
        </div>
    );
}
