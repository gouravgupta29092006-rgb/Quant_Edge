'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { apiGet } from '@/lib/api';
import { useAuthStore }   from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import { listContainerVariants, tableRowVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface WatchlistItem { id: string; symbol: string; notes?: string; }

const fmtNum = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function WatchlistWidget() {
  const { isAuthenticated } = useAuthStore();
  const { quotes, fetchQuote } = useMarketStore();
  const [items, setItems]   = useState<WatchlistItem[]>([]);
  const [addSymbol, setAddSymbol] = useState('');
  const [loading, setLoading]     = useState(false);
  const shouldReduce = useReducedMotion();

  const loadWatchlist = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiGet<WatchlistItem[]>('/watchlist');
      setItems(data);
      data.forEach(item => { if (!quotes[item.symbol]) fetchQuote(item.symbol).catch(() => {}); });
    } catch { /* silent */ }
  };

  useEffect(() => { loadWatchlist(); }, [isAuthenticated]);

  const handleAdd = async () => {
    if (!addSymbol.trim()) return;
    setLoading(true);
    try {
      const { apiPost } = await import('@/lib/api');
      await apiPost('/watchlist', { symbol: addSymbol.toUpperCase() });
      setAddSymbol('');
      await loadWatchlist();
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleRemove = async (symbol: string) => {
    setItems(prev => prev.filter(i => i.symbol !== symbol)); // optimistic
    try {
      const { apiDelete } = await import('@/lib/api');
      await apiDelete(`/watchlist/${symbol}`);
    } catch { await loadWatchlist(); } // revert on error
  };

  return (
    <motion.div
      className="card !p-0 overflow-hidden"
      initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Watchlist</h3>
        <span className="badge badge-brand text-[11px]">{items.length}/50</span>
      </div>

      {/* Add input */}
      <div className="px-5 py-3.5 border-b border-border">
        <div className="flex gap-2">
          <input
            id="watchlist-add-input"
            type="text"
            className="input flex-1 !py-2 !text-sm font-mono uppercase"
            placeholder="Add ticker symbol…"
            value={addSymbol}
            onChange={e => setAddSymbol(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <motion.button
            id="watchlist-add-btn"
            onClick={handleAdd}
            disabled={loading || !addSymbol.trim()}
            className="btn-primary btn-sm !px-3.5 !rounded-xl flex-shrink-0"
            whileTap={shouldReduce ? {} : { scale: 0.92 }}
            whileHover={shouldReduce ? {} : { scale: 1.06 }}
          >
            {loading ? (
              <motion.span
                className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white block"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-2">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-8 text-center space-y-1.5"
            >
              <svg className="w-8 h-8 mx-auto mb-2 text-text-disabled" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p className="text-xs font-medium text-text-muted">Watchlist is empty</p>
              <p className="text-xs text-text-disabled">Add a symbol to start tracking</p>
            </motion.div>
          ) : (
            <motion.ul
              key="list"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {items.map((item, idx) => {
                const q   = quotes[item.symbol];
                const pos = (q?.changePercent ?? 0) >= 0;
                return (
                  <motion.li
                    key={item.symbol}
                    variants={tableRowVariants}
                    layout
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between py-2.5 rounded-xl px-2 -mx-2 hover:bg-bg-hover transition-colors duration-150"
                    style={{ borderBottom: idx < items.length - 1 ? '1px solid rgba(30,41,59,0.5)' : 'none' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 bg-brand/8 text-brand-400">
                        {item.symbol.slice(0, 2)}
                      </div>
                      <span className="text-sm font-bold font-mono text-text-primary">{item.symbol}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {q ? (
                        <div className="text-right">
                          <div className="text-sm font-bold tabular-nums font-mono text-text-primary">
                            ${fmtNum(q.price)}
                          </div>
                          <div className={cn('text-xs font-bold', pos ? 'text-success' : 'text-danger')}>
                            {pos ? '+' : ''}{q.changePercent?.toFixed(2)}%
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-right">
                          <div className="skeleton h-4 w-16 rounded" />
                          <div className="skeleton h-3 w-10 rounded ml-auto" />
                        </div>
                      )}
                      <motion.button
                        id={`watchlist-remove-${item.symbol}`}
                        onClick={() => handleRemove(item.symbol)}
                        className="p-1.5 rounded-lg text-text-disabled hover:text-danger hover:bg-danger/8 transition-colors duration-150 flex-shrink-0"
                        whileHover={shouldReduce ? {} : { scale: 1.15 }}
                        whileTap={shouldReduce ? {} : { scale: 0.85 }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
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
