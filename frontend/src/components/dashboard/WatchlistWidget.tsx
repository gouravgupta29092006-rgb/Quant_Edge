'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';

interface WatchlistItem { id: string; symbol: string; notes?: string; }

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
    try {
      const { apiDelete } = await import('@/lib/api');
      await apiDelete(`/watchlist/${symbol}`);
      setItems(prev => prev.filter(i => i.symbol !== symbol));
    } catch { /* silent */ }
  };

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #161C2E' }}>
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}>
          Watchlist
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8' }}>
          {items.length}/50
        </span>
      </div>

      {/* Add input */}
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #161C2E' }}>
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
          <button
            id="watchlist-add-btn"
            onClick={handleAdd}
            disabled={loading || !addSymbol.trim()}
            className="btn-primary btn-sm !px-3.5 !rounded-xl flex-shrink-0">
            {loading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-2">
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-xs font-medium" style={{ color: '#4E5A7A' }}>Watchlist is empty</p>
            <p className="text-xs" style={{ color: '#2D3A5E' }}>Add a symbol to start tracking</p>
          </div>
        ) : (
          <ul>
            {items.map((item, idx) => {
              const q = quotes[item.symbol];
              const pos = (q?.changePercent ?? 0) >= 0;
              return (
                <li key={item.symbol}
                  className="flex items-center justify-between py-2.5 rounded-xl px-2 -mx-2 transition-all duration-150"
                  style={{ borderBottom: idx < items.length - 1 ? '1px solid rgba(22,28,46,0.5)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24,28,46,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.08)', color: '#818CF8', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.symbol.slice(0, 2)}
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#F0F4FF', fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.symbol}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {q ? (
                      <div className="text-right">
                        <div className="text-sm font-bold tabular-nums font-mono" style={{ color: '#F0F4FF' }}>
                          ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(q.price)}
                        </div>
                        <div className="text-xs font-bold" style={{ color: pos ? '#00D395' : '#FF4466' }}>
                          {pos ? '+' : ''}{q.changePercent?.toFixed(2)}%
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-right">
                        <div className="skeleton h-4 w-16 rounded" />
                        <div className="skeleton h-3 w-10 rounded ml-auto" />
                      </div>
                    )}
                    <button
                      id={`watchlist-remove-${item.symbol}`}
                      onClick={() => handleRemove(item.symbol)}
                      className="p-1 rounded-lg transition-all duration-150 flex-shrink-0"
                      style={{ color: '#2D3A5E' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#FF4466'; e.currentTarget.style.background = 'rgba(255,68,102,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#2D3A5E'; e.currentTarget.style.background = 'transparent'; }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
