'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';

interface WatchlistItem {
  id: string;
  symbol: string;
  notes?: string;
}

interface Quote {
  symbol: string;
  price: number;
  changeAmount?: number;
  changePercent?: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  volume?: number;
  week52High?: number;
  week52Low?: number;
}

export default function WatchlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { quotes, fetchQuote } = useMarketStore();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [addSymbol, setAddSymbol] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');
  const [sortAsc, setSortAsc] = useState(true);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await apiGet<WatchlistItem[]>('/watchlist');
      setItems(data);
      // Fetch live prices for each symbol
      data.forEach((item) => {
        fetchQuote(item.symbol).catch(() => {});
      });
    } catch {
      setError('Failed to load watchlist.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchQuote]);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  // Auto-refresh quotes every 30 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      items.forEach((item) => fetchQuote(item.symbol).catch(() => {}));
    }, 30_000);
    return () => clearInterval(interval);
  }, [items, fetchQuote]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAdd = async () => {
    const sym = addSymbol.trim().toUpperCase();
    if (!sym) return;
    if (items.some((i) => i.symbol === sym)) {
      setError(`${sym} is already in your watchlist.`);
      return;
    }
    setAdding(true);
    setError('');
    try {
      await apiPost('/watchlist', { symbol: sym });
      setAddSymbol('');
      showSuccess(`${sym} added to watchlist`);
      await loadWatchlist();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add symbol.';
      setError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    setRemovingSymbol(symbol);
    try {
      await apiDelete(`/watchlist/${symbol}`);
      setItems((prev) => prev.filter((i) => i.symbol !== symbol));
      showSuccess(`${symbol} removed`);
    } catch {
      setError('Failed to remove symbol.');
    } finally {
      setRemovingSymbol(null);
    }
  };

  const handleSort = (col: 'symbol' | 'price' | 'change') => {
    if (sortBy === col) setSortAsc((a) => !a);
    else { setSortBy(col); setSortAsc(true); }
  };

  // Filter + sort
  const filtered = items
    .filter((i) => i.symbol.includes(search.toUpperCase()))
    .sort((a, b) => {
      const qa = quotes[a.symbol] as Quote | undefined;
      const qb = quotes[b.symbol] as Quote | undefined;
      let cmp = 0;
      if (sortBy === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      else if (sortBy === 'price') cmp = (qa?.price ?? 0) - (qb?.price ?? 0);
      else cmp = (qa?.changePercent ?? 0) - (qb?.changePercent ?? 0);
      return sortAsc ? cmp : -cmp;
    });

  const SortIcon = ({ col }: { col: string }) => (
    sortBy === col ? (
      <span className="ml-1 text-brand-400">{sortAsc ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-[var(--text-muted)] opacity-40">↕</span>
    )
  );

  const fmt = (n?: number) =>
    n == null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const fmtVol = (n?: number) => {
    if (n == null) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Watchlist</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {items.length} symbol{items.length !== 1 ? 's' : ''} tracked • Auto-refreshes every 30s
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block" />
          Live prices
        </div>
      </div>

      {/* Success / Error toast */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="ml-3 text-danger/60 hover:text-danger">✕</button>
        </div>
      )}

      {/* Add Symbol + Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Add symbol */}
        <div className="flex gap-2 flex-1">
          <input
            id="watchlist-add-input"
            type="text"
            className="input flex-1 uppercase font-mono tracking-wider"
            placeholder="Add symbol (e.g. AAPL, TSLA)"
            value={addSymbol}
            onChange={(e) => { setAddSymbol(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            maxLength={10}
            disabled={adding}
          />
          <button
            id="watchlist-add-btn"
            onClick={handleAdd}
            disabled={adding || !addSymbol.trim()}
            className="btn-primary px-5 whitespace-nowrap"
          >
            {adding ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding…
              </span>
            ) : '+ Add'}
          </button>
        </div>

        {/* Search/filter */}
        <div className="relative sm:w-52">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="watchlist-search-input"
            type="text"
            className="input pl-9 uppercase font-mono tracking-wider w-full"
            placeholder="Filter…"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">Loading watchlist…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            {items.length === 0 ? (
              <>
                <div className="text-4xl mb-3">📋</div>
                <p className="text-[var(--text-primary)] font-medium mb-1">Your watchlist is empty</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Add stock symbols above to start tracking live prices.
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-[var(--text-primary)] font-medium mb-1">No matches for &quot;{search}&quot;</p>
                <p className="text-sm text-[var(--text-muted)]">Try a different symbol.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  <th
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none"
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol <SortIcon col="symbol" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none"
                    onClick={() => handleSort('price')}
                  >
                    Price <SortIcon col="price" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium cursor-pointer hover:text-[var(--text-primary)] transition-colors select-none"
                    onClick={() => handleSort('change')}
                  >
                    Change <SortIcon col="change" />
                  </th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Open</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">High</th>
                  <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">Low</th>
                  <th className="px-4 py-3 text-right font-medium hidden xl:table-cell">Volume</th>
                  <th className="px-4 py-3 text-right font-medium hidden xl:table-cell">52W High</th>
                  <th className="px-4 py-3 text-right font-medium hidden xl:table-cell">52W Low</th>
                  <th className="px-4 py-3 text-center font-medium w-16">Remove</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const q = quotes[item.symbol] as Quote | undefined;
                  const pos = (q?.changePercent ?? 0) >= 0;
                  const isRemoving = removingSymbol === item.symbol;

                  return (
                    <tr
                      key={item.symbol}
                      className={`border-b border-[var(--border)] last:border-0 transition-colors
                        hover:bg-[var(--bg-hover)] ${isRemoving ? 'opacity-40' : ''}`}
                    >
                      {/* Symbol */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center
                            text-xs font-bold text-brand-400 shrink-0">
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)] font-mono tracking-wide">
                              {item.symbol}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-[var(--text-muted)] truncate max-w-[120px]">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        {q ? (
                          <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                            ${fmt(q.price)}
                          </span>
                        ) : (
                          <span className="w-20 h-4 bg-[var(--bg-hover)] rounded animate-pulse inline-block" />
                        )}
                      </td>

                      {/* Change */}
                      <td className="px-4 py-3 text-right">
                        {q ? (
                          <div className={`inline-flex flex-col items-end ${pos ? 'text-success' : 'text-danger'}`}>
                            <span className="font-medium tabular-nums">
                              {pos ? '+' : ''}{fmt(q.changeAmount)}
                            </span>
                            <span className="text-xs">
                              ({pos ? '+' : ''}{q.changePercent?.toFixed(2)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="w-16 h-4 bg-[var(--bg-hover)] rounded animate-pulse inline-block" />
                        )}
                      </td>

                      {/* Open */}
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)] hidden lg:table-cell">
                        {q ? `$${fmt(q.open)}` : <span className="w-14 h-3 bg-[var(--bg-hover)] rounded animate-pulse inline-block" />}
                      </td>

                      {/* High */}
                      <td className="px-4 py-3 text-right tabular-nums text-success hidden lg:table-cell">
                        {q ? `$${fmt(q.high)}` : <span className="w-14 h-3 bg-[var(--bg-hover)] rounded animate-pulse inline-block" />}
                      </td>

                      {/* Low */}
                      <td className="px-4 py-3 text-right tabular-nums text-danger hidden lg:table-cell">
                        {q ? `$${fmt(q.low)}` : <span className="w-14 h-3 bg-[var(--bg-hover)] rounded animate-pulse inline-block" />}
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-muted)] hidden xl:table-cell">
                        {q ? fmtVol(q.volume) : '—'}
                      </td>

                      {/* 52W High */}
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-muted)] hidden xl:table-cell">
                        {q?.week52High ? `$${fmt(q.week52High)}` : '—'}
                      </td>

                      {/* 52W Low */}
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--text-muted)] hidden xl:table-cell">
                        {q?.week52Low ? `$${fmt(q.week52Low)}` : '—'}
                      </td>

                      {/* Remove */}
                      <td className="px-4 py-3 text-center">
                        <button
                          id={`watchlist-remove-${item.symbol}`}
                          onClick={() => handleRemove(item.symbol)}
                          disabled={isRemoving}
                          title={`Remove ${item.symbol}`}
                          className="w-7 h-7 rounded-md flex items-center justify-center mx-auto
                            text-[var(--text-muted)] hover:text-danger hover:bg-danger/10
                            transition-all duration-150 disabled:opacity-40"
                        >
                          {isRemoving ? (
                            <span className="w-3.5 h-3.5 border border-danger/30 border-t-danger rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-hover)]
            flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Showing {filtered.length} of {items.length} symbols</span>
            <span>Prices in USD</span>
          </div>
        )}
      </div>

      {/* Stats summary row */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Total Symbols',
              value: items.length.toString(),
              icon: '📋',
            },
            {
              label: 'Gainers Today',
              value: items.filter((i) => (quotes[i.symbol] as Quote | undefined)?.changePercent ?? 0 >= 0).length.toString(),
              icon: '📈',
            },
            {
              label: 'Losers Today',
              value: items.filter((i) => ((quotes[i.symbol] as Quote | undefined)?.changePercent ?? 0) < 0).length.toString(),
              icon: '📉',
            },
            {
              label: 'Best Performer',
              value: items.length > 0
                ? [...items].sort((a, b) =>
                    ((quotes[b.symbol] as Quote | undefined)?.changePercent ?? 0) -
                    ((quotes[a.symbol] as Quote | undefined)?.changePercent ?? 0)
                  )[0]?.symbol ?? '—'
                : '—',
              icon: '🏆',
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                <div className="font-bold text-[var(--text-primary)] font-mono">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
