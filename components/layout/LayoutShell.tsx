'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';


interface LayoutShellProps {
    children: ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-5 relative z-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
