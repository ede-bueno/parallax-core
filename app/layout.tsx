import type { Metadata } from 'next';
import LayoutShell from '../components/layout/LayoutShell';
import { UserContextProvider } from '../context/UserContext';
import '../styles/tokens.css';
import '../styles/globals.css';

export const metadata: Metadata = {
    title: 'Parallax - Core System',
    description: 'Modular SaaS system for service-based businesses',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>
                <UserContextProvider>
                    <LayoutShell>{children}</LayoutShell>
                </UserContextProvider>
            </body>
        </html>
    );
}
