'use client';

import { useState } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { listContainerVariants, tableRowVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

const fmtNum = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function TopMoversCard() {
  const { movers } = useMarketStore();
  const { gainers = [], losers = [] } = movers;
  const [tab, setTab]  = useState<'gainers' | 'losers'>('gainers');
  const shouldReduce   = useReducedMotion();
  const data           = tab === 'gainers' ? gainers : losers;
  const isGainers      = tab === 'gainers';

  return (
    <motion.div
      className="card !p-0 overflow-hidden"
      initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Top Movers</h3>
        <div className="flex gap-0.5 p-0.5 rounded-lg bg-bg-secondary">
          {(['gainers', 'losers'] as const).map(t => (
            <motion.button
              key={t}
              id={`movers-${t}-tab`}
              onClick={() => setTab(t)}
              className={cn(
                'relative px-3 py-1 text-xs font-semibold rounded-md transition-colors',
                tab === t
                  ? t === 'gainers' ? 'text-success' : 'text-danger'
                  : 'text-text-muted hover:text-text-secondary',
              )}
              whileTap={shouldReduce ? {} : { scale: 0.94 }}
            >
              {tab === t && (
                <motion.span
                  layoutId="movers-tab-pill"
                  className="absolute inset-0 rounded-md"
                  style={{
                    background: t === 'gainers' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${t === 'gainers' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{t === 'gainers' ? '▲ Gainers' : '▼ Losers'}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          {data.length === 0 ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-6 space-y-3"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton w-8 h-8 rounded-lg" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-2.5 w-20 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <div className="skeleton h-3 w-14 rounded" />
                    <div className="skeleton h-2.5 w-10 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.ul
              key={tab}
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-0"
            >
              {data.slice(0, 6).map((stock, i) => {
                const pos = (stock.changePercent ?? 0) >= 0;
                const barWidth = Math.min(Math.abs(stock.changePercent ?? 0) * 8, 100);
                return (
                  <motion.li
                    key={stock.symbol ?? i}
                    variants={tableRowVariants}
                    className="flex items-center justify-between py-2.5 rounded-xl px-2 -mx-2 hover:bg-bg-hover transition-colors duration-150 relative overflow-hidden"
                    style={{ borderBottom: i < 5 ? '1px solid rgba(30,41,59,0.6)' : 'none' }}
                    whileHover={shouldReduce ? {} : { x: 2 }}
                  >
                    {/* % bar background */}
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-l-xl opacity-[0.04] pointer-events-none transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        background: pos ? '#22C55E' : '#EF4444',
                      }}
                    />
                    <div className="flex items-center gap-2.5 relative">
                      <span className="w-4 text-[11px] font-bold text-text-disabled tabular-nums text-right">
                        {i + 1}
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                        style={{
                          background: pos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color:      pos ? '#22C55E' : '#EF4444',
                        }}
                      >
                        {(stock.symbol ?? '??').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-sm font-bold font-mono text-text-primary">{stock.symbol}</div>
                        <div className="text-xs text-text-muted truncate max-w-[88px]">{stock.name ?? '—'}</div>
                      </div>
                    </div>
                    <div className="text-right relative">
                      <div className="text-sm font-bold font-mono tabular-nums text-text-primary">
                        ${fmtNum(stock.price ?? 0)}
                      </div>
                      <div className={cn('text-xs font-bold', pos ? 'text-success' : 'text-danger')}>
                        {pos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
