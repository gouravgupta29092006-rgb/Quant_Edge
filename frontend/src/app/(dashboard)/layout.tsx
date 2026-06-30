import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import StoreProvider from '@/components/providers/StoreProvider';
import WebSocketProvider from '@/components/providers/WebSocketProvider';

export const metadata: Metadata = {
  title: { template: '%s | QuantEdge', default: 'Dashboard | QuantEdge' },
  description: 'AI-powered virtual trading and portfolio analytics platform',
};

/**
 * Dashboard shell layout.
 * Wraps all /(dashboard)/* routes with:
 *  - Sidebar navigation
 *  - Top header
 *  - StoreProvider (initialises Zustand stores on mount)
 *  - WebSocketProvider (STOMP live price subscription)
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <WebSocketProvider>
        <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-screen-2xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </StoreProvider>
  );
}
