'use client';

import { usePortfolioStore } from '@/stores/portfolioStore';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

interface StatItemProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}

function StatItem({ label, value, sub, positive }: StatItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[var(--text-muted)] mb-0.5">{label}</span>
      <span className="text-lg font-semibold text-[var(--text-primary)]">{value}</span>
      {sub && (
        <span className={`text-xs mt-0.5 font-medium ${
          positive === undefined ? 'text-[var(--text-secondary)]'
          : positive ? 'text-success' : 'text-danger'
        }`}>
          {sub}
        </span>
      )}
    </div>
  );
}

export default function PortfolioSummaryCard() {
  const { activePortfolio, portfolios, setActivePortfolioId, isLoading } = usePortfolioStore();

  if (isLoading && !activePortfolio) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-[var(--bg-hover)] rounded w-1/3 mb-4" />
        <div className="h-10 bg-[var(--bg-hover)] rounded w-1/2 mb-6" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--bg-hover)] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!activePortfolio) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--text-muted)] text-sm mb-4">No portfolio yet. Create one to get started.</p>
        <button id="create-portfolio-btn" className="btn-primary px-6">
          Create Portfolio
        </button>
      </div>
    );
  }

  const totalReturn = activePortfolio.totalReturn ?? 0;
  const totalReturnPct = activePortfolio.totalReturnPct ?? 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className="card p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Portfolio</span>
          {/* Portfolio selector */}
          {portfolios.length > 1 ? (
            <select
              id="portfolio-selector"
              className="block mt-0.5 bg-transparent text-lg font-semibold text-[var(--text-primary)] cursor-pointer border-none outline-none"
              value={activePortfolio.id}
              onChange={(e) => setActivePortfolioId(e.target.value)}
            >
              {portfolios.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          ) : (
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-0.5">{activePortfolio.name}</h2>
          )}
        </div>

        {/* Total value — hero number */}
        <div className="text-right">
          <div className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
            {formatCurrency(activePortfolio.totalValue ?? 0)}
          </div>
          <div className={`text-sm font-medium mt-0.5 flex items-center justify-end gap-1
            ${isPositive ? 'text-success' : 'text-danger'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d={isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
            </svg>
            {formatCurrency(Math.abs(totalReturn))} ({formatPct(totalReturnPct)})
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--border)]">
        <StatItem
          label="Holdings value"
          value={formatCurrency(activePortfolio.holdingsValue ?? 0)}
        />
        <StatItem
          label="Cash balance"
          value={formatCurrency(activePortfolio.cashBalance ?? 0)}
        />
        <StatItem
          label="Total return"
          value={formatCurrency(Math.abs(totalReturn))}
          sub={formatPct(totalReturnPct)}
          positive={isPositive}
        />
        <StatItem
          label="Initial capital"
          value={formatCurrency(activePortfolio.initialCapital ?? 0)}
        />
      </div>
    </div>
  );
}
