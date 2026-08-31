'use client';

import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore }    from '@/stores/marketStore';
import { motion, useReducedMotion } from 'framer-motion';
import { ChangeBadge } from '@/components/ui/Badge';
import { listContainerVariants, tableRowVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

const COLS = ['Symbol', 'Shares', 'Avg. Cost', 'Price', 'Mkt Value', 'P&L'];

export default function HoldingsTable() {
  const { activePortfolio, isLoading } = usePortfolioStore();
  const { quotes } = useMarketStore();
  const shouldReduce = useReducedMotion();

  const holdings = activePortfolio?.holdings ?? [];

  if (!holdings.length) {
    return (
      <motion.div
        className="card p-10 text-center space-y-3"
        initial={shouldReduce ? undefined : { opacity: 0, y: 10 }}
        animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto bg-brand/8 border border-brand/15">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-text-secondary">No holdings yet</p>
        <p className="text-xs text-text-muted">Use the Quick Trade panel to buy your first stock.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card overflow-hidden !p-0"
      initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Holdings</h3>
        <span className="badge-brand badge text-[11px]">
          {holdings.length} position{holdings.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {COLS.map(col => (
                <th key={col} className="table-header-cell first:pl-6 last:pr-6">{col}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            variants={listContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {holdings.map((h, idx) => {
              const quote      = quotes[h.symbol];
              const livePrice  = quote?.price ?? h.averageCost;
              const mktVal     = livePrice * h.shares;
              const cost       = h.averageCost * h.shares;
              const pnl        = mktVal - cost;
              const pnlPct     = cost > 0 ? (pnl / cost) * 100 : 0;
              const isPos      = pnl >= 0;

              return (
                <motion.tr
                  key={h.symbol}
                  variants={tableRowVariants}
                  className="table-row group cursor-default"
                >
                  <td className="table-cell pl-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, hsl(${(h.symbol.charCodeAt(0) * 37) % 360},60%,40%), hsl(${(h.symbol.charCodeAt(0) * 37 + 60) % 360},60%,30%))`,
                        }}>
                        {h.symbol.slice(0, 2)}
                      </div>
                      <span className="font-semibold text-text-primary">{h.symbol}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono tabular-nums text-text-secondary">{h.shares}</td>
                  <td className="table-cell font-mono tabular-nums text-text-secondary">{fmt(h.averageCost)}</td>
                  <td className="table-cell font-mono tabular-nums text-text-primary font-semibold">
                    {fmt(livePrice)}
                    {quote && <span className="ml-1 text-[10px] text-text-muted">(live)</span>}
                  </td>
                  <td className="table-cell font-mono tabular-nums text-text-primary font-semibold">{fmt(mktVal)}</td>
                  <td className="table-cell pr-6">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn('font-mono tabular-nums text-xs font-bold', isPos ? 'text-success' : 'text-danger')}>
                        {isPos ? '+' : ''}{fmt(pnl)}
                      </span>
                      <ChangeBadge value={pnlPct} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
