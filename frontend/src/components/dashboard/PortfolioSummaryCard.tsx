'use client';

import { usePortfolioStore } from '@/stores/portfolioStore';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n: number) { return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`; }
function fmtChange(n: number) { return `${n >= 0 ? '+' : ''}${fmt(n)}`; }

interface KPIProps { label: string; value: string; sub?: string; positive?: boolean; accent?: boolean; }

function KPI({ label, value, sub, positive, accent }: KPIProps) {
  const subColor = positive === undefined
    ? (accent ? '#06B6D4' : '#8896B3')
    : positive ? '#00D395' : '#FF4466';
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4E5A7A', letterSpacing: '0.07em' }}>{label}</span>
      <span className="text-lg font-bold font-mono tabular-nums" style={{ color: '#F0F4FF' }}>{value}</span>
      {sub && <span className="text-xs font-semibold" style={{ color: subColor }}>{sub}</span>}
    </div>
  );
}

export default function PortfolioSummaryCard() {
  const { activePortfolio, portfolios, setActivePortfolioId, isLoading } = usePortfolioStore();

  if (isLoading && !activePortfolio) {
    return (
      <div className="card p-6 space-y-5">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-5 w-36 rounded" />
          </div>
          <div className="space-y-2 text-right">
            <div className="skeleton h-8 w-44 rounded" />
            <div className="skeleton h-4 w-24 rounded ml-auto" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: '#161C2E' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-2.5 w-16 rounded" />
              <div className="skeleton h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activePortfolio) {
    return (
      <div className="card p-10 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: '#8896B3' }}>No portfolio yet</p>
        <p className="text-xs" style={{ color: '#4E5A7A' }}>Create a portfolio to start paper trading</p>
        <button id="create-portfolio-btn" className="btn-primary px-6 mx-auto">
          Create Portfolio
        </button>
      </div>
    );
  }

  const totalReturn    = activePortfolio.totalReturn ?? 0;
  const totalReturnPct = activePortfolio.totalReturnPct ?? 0;
  const isPositive     = totalReturn >= 0;

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: isPositive
          ? 'linear-gradient(90deg, transparent, rgba(0,211,149,0.4), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,68,102,0.4), transparent)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4E5A7A', letterSpacing: '0.07em' }}>
            Portfolio
          </span>
          {portfolios.length > 1 ? (
            <select
              id="portfolio-selector"
              className="block mt-0.5 text-base font-bold cursor-pointer border-none outline-none bg-transparent"
              style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}
              value={activePortfolio.id}
              onChange={e => setActivePortfolioId(e.target.value)}>
              {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          ) : (
            <h2 className="text-base font-bold mt-0.5" style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}>
              {activePortfolio.name}
            </h2>
          )}
        </div>

        {/* Hero value */}
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F0F4FF' }}>
            {fmt(activePortfolio.totalValue ?? 0)}
          </div>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={isPositive ? '#00D395' : '#FF4466'} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d={isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
            </svg>
            <span className="text-sm font-bold" style={{ color: isPositive ? '#00D395' : '#FF4466' }}>
              {fmtChange(totalReturn)} ({fmtPct(totalReturnPct)})
            </span>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5"
        style={{ borderTop: '1px solid #161C2E' }}>
        <KPI label="Holdings" value={fmt(activePortfolio.holdingsValue ?? 0)} />
        <KPI label="Cash" value={fmt(activePortfolio.cashBalance ?? 0)} accent />
        <KPI
          label="Total Return"
          value={fmt(Math.abs(totalReturn))}
          sub={fmtPct(totalReturnPct)}
          positive={isPositive}
        />
        <KPI label="Initial Capital" value={fmt(activePortfolio.initialCapital ?? 0)} />
      </div>
    </div>
  );
}
