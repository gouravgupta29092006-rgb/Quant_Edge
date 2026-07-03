import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { template: '%s | QuantEdge', default: 'Sign In | QuantEdge' },
  description: 'Sign in or create a free QuantEdge paper trading account',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {children}
    </div>
  );
}
