'use client';

import { usePortfolioStore } from '@/stores/portfolioStore';
import { motion, useReducedMotion } from 'framer-motion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { listContainerVariants, listItemVariants } from '@/lib/motion';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function KpiSkeleton() {
  return (
    <div className="card p-6 space-y-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="skeleton h-2.5 w-20 rounded" />
          <div className="skeleton h-5 w-32 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="skeleton h-9 w-44 rounded" />
          <div className="skeleton h-4 w-24 rounded ml-auto" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="skeleton h-2.5 w-14 rounded" />
            <div className="skeleton h-5 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioSummaryCard() {
  const { activePortfolio, portfolios, setActivePortfolioId, isLoading } = usePortfolioStore();
  const shouldReduce = useReducedMotion();

  if (isLoading && !activePortfolio) return <KpiSkeleton />;

  if (!activePortfolio) {
    return (
      <motion.div
        className="card p-10 text-center space-y-4"
        initial={shouldReduce ? undefined : { opacity: 0, y: 12 }}
        animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-brand/10 border border-brand/20"
          animate={shouldReduce ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-text-secondary">No portfolio yet</p>
          <p className="text-xs text-text-muted mt-1">Create a portfolio to start paper trading</p>
        </div>
        <button id="create-portfolio-btn" className="btn-primary px-6 mx-auto">
          Create Portfolio
        </button>
      </motion.div>
    );
  }

  const totalReturn    = activePortfolio.totalReturn    ?? 0;
  const totalReturnPct = activePortfolio.totalReturnPct ?? 0;
  const isPositive     = totalReturn >= 0;
  const accentColor    = isPositive ? '#22C55E' : '#EF4444';

  const kpis = [
    { label: 'Holdings',       value: activePortfolio.holdingsValue    ?? 0, color: 'text-text-primary' },
    { label: 'Cash',           value: activePortfolio.cashBalance       ?? 0, color: 'text-accent' },
    { label: 'Total Return',   value: Math.abs(totalReturn),                  color: isPositive ? 'text-success' : 'text-danger' },
    { label: 'Initial Capital', value: activePortfolio.initialCapital   ?? 0, color: 'text-text-muted' },
  ];

  return (
    <motion.div
      className="card relative overflow-hidden"
      initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="metric-label">Portfolio</span>
            {portfolios.length > 1 ? (
              <select
                id="portfolio-selector"
                className="block mt-1 text-base font-bold cursor-pointer border-none outline-none bg-transparent text-text-primary font-display"
                value={activePortfolio.id}
                onChange={e => setActivePortfolioId(e.target.value)}
              >
                {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <h2 className="text-base font-bold mt-0.5 text-text-primary font-display">
                {activePortfolio.name}
              </h2>
            )}
          </div>

          {/* Hero value with spring animation */}
          <div className="text-right">
            <div className="text-3xl font-bold font-mono tabular-nums text-text-primary">
              <AnimatedNumber
                value={activePortfolio.totalValue ?? 0}
                format={n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)}
              />
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <motion.svg
                className="w-3.5 h-3.5"
                fill="none" viewBox="0 0 24 24"
                stroke={accentColor} strokeWidth={2.5}
                animate={shouldReduce ? {} : { y: isPositive ? [-1, 1, -1] : [1, -1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d={isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </motion.svg>
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                {totalReturn >= 0 ? '+' : ''}{fmt(totalReturn)} ({totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI row with stagger */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5 border-t border-border"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {kpis.map(({ label, value, color }) => (
            <motion.div key={label} variants={listItemVariants} className="flex flex-col gap-1">
              <span className="metric-label">{label}</span>
              <span className={`text-lg font-bold font-mono tabular-nums ${color}`}>
                <AnimatedNumber
                  value={value}
                  format={n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)}
                />
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
