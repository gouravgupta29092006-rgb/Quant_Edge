'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';

interface WatchlistItem {
  id: string;
  symbol: string;
  notes?: string;
}

export default function WatchlistWidget() {
  const { isAuthenticated } = useAuthStore();
  const { quotes, fetchQuote } = useMarketStore();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [addSymbol, setAddSymbol] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWatchlist = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiGet<WatchlistItem[]>('/watchlist');
      setItems(data);
      // Fetch live prices for each
      data.forEach((item) => {
        if (!quotes[item.symbol]) fetchQuote(item.symbol).catch(() => {});
      });
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
    try {
      const { apiDelete } = await import('@/lib/api');
      await apiDelete(`/watchlist/${symbol}`);
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
    } catch { /* silent */ }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Watchlist</h3>
        <span className="text-xs text-[var(--text-muted)]">{items.length}/50</span>
      </div>

      {/* Add input */}
      <div className="flex gap-2 mb-4">
        <input
          id="watchlist-add-input"
          type="text"
          className="input flex-1 text-sm uppercase"
          placeholder="Add symbol…"
          value={addSymbol}
          onChange={(e) => setAddSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          id="watchlist-add-btn"
          onClick={handleAdd}
          disabled={loading || !addSymbol.trim()}
          className="btn-secondary px-3 text-xs"
        >
          +
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] text-center py-4">
          Your watchlist is empty. Add a symbol to start tracking.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const q = quotes[item.symbol];
            const pos = (q?.changePercent ?? 0) >= 0;
            return (
              <li key={item.symbol} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                    {item.symbol.slice(0, 2)}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{item.symbol}</span>
                </div>
                <div className="flex items-center gap-3">
                  {q ? (
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                        ₹{new Intl.NumberFormat('en-IN').format(q.price)}
                      </div>
                      <div className={`text-xs ${pos ? 'text-success' : 'text-danger'}`}>
                        {pos ? '+' : ''}{q.changePercent?.toFixed(2)}%
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-4 bg-[var(--bg-hover)] rounded animate-pulse" />
                  )}
                  <button
                    id={`watchlist-remove-${item.symbol}`}
                    onClick={() => handleRemove(item.symbol)}
                    className="text-[var(--text-muted)] hover:text-danger transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
