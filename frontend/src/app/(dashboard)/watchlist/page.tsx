'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';

interface WatchlistItem { id: string; symbol: string; notes?: string; }
interface Quote {
  symbol: string; price: number; changeAmount?: number; changePercent?: number;
  open?: number; high?: number; low?: number; prevClose?: number;
  volume?: number; week52High?: number; week52Low?: number;
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
      data.forEach(item => fetchQuote(item.symbol).catch(() => {}));
    } catch { setError('Failed to load watchlist.'); }
    finally { setLoading(false); }
  }, [isAuthenticated, fetchQuote]);

  useEffect(() => { loadWatchlist(); }, [loadWatchlist]);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      items.forEach(item => fetchQuote(item.symbol).catch(() => {}));
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
    if (items.some(i => i.symbol === sym)) { setError(`${sym} is already in your watchlist.`); return; }
    setAdding(true); setError('');
    try {
      await apiPost('/watchlist', { symbol: sym });
      setAddSymbol('');
      showSuccess(`${sym} added to watchlist`);
      await loadWatchlist();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add symbol.');
    } finally { setAdding(false); }
  };

  const handleRemove = async (symbol: string) => {
    setRemovingSymbol(symbol);
    try {
      await apiDelete(`/watchlist/${symbol}`);
      setItems(prev => prev.filter(i => i.symbol !== symbol));
      showSuccess(`${symbol} removed`);
    } catch { setError('Failed to remove symbol.'); }
    finally { setRemovingSymbol(null); }
  };

  const handleSort = (col: 'symbol' | 'price' | 'change') => {
    if (sortBy === col) setSortAsc(a => !a);
    else { setSortBy(col); setSortAsc(true); }
  };

  const filtered = items
    .filter(i => i.symbol.includes(search.toUpperCase()))
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
    sortBy === col
      ? <span className="ml-1 text-xs" style={{ color: '#818CF8' }}>{sortAsc ? '↑' : '↓'}</span>
      : <span className="ml-1 text-xs opacity-30" style={{ color: '#4E5A7A' }}>↕</span>
  );

  const fmt = (n?: number) =>
    n == null ? '—' : `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

  const fmtVol = (n?: number) => {
    if (n == null) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  };

  const gainers = items.filter(i => ((quotes[i.symbol] as Quote | undefined)?.changePercent ?? 0) >= 0).length;
  const losers  = items.length - gainers;
  const best    = items.length > 0
    ? [...items].sort((a, b) => ((quotes[b.symbol] as Quote | undefined)?.changePercent ?? 0) - ((quotes[a.symbol] as Quote | undefined)?.changePercent ?? 0))[0]?.symbol ?? '—'
    : '—';

  return (
    <div className="page-wrapper">
      {/* Toast banners */}
      {successMsg && (
        <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          style={{ background: 'rgba(0,211,149,0.08)', border: '1px solid rgba(0,211,149,0.2)', color: '#00D395' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {successMsg}
        </div>
      )}
      {error && (
        <div className="animate-fade-up-sm px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', color: '#FF4466' }}>
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="ml-3 opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Add + Search row */}
      <div className="card !p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-1">
          <input
            id="watchlist-add-input"
            type="text"
            className="input flex-1 uppercase font-mono tracking-wider"
            placeholder="Add symbol (e.g. AAPL, TSLA)"
            value={addSymbol}
            onChange={e => { setAddSymbol(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            maxLength={10}
            disabled={adding}
          />
          <button
            id="watchlist-add-btn"
            onClick={handleAdd}
            disabled={adding || !addSymbol.trim()}
            className="btn-primary px-5 whitespace-nowrap">
            {adding ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add
              </span>
            )}
          </button>
        </div>
        <div className="relative sm:w-52">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4E5A7A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="watchlist-search-input"
            type="text"
            className="input pl-10 uppercase font-mono tracking-wider w-full"
            placeholder="Filter…"
            value={search}
            onChange={e => setSearch(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* KPI strip */}
      {!loading && items.length > 0 && (
        <div className="kpi-strip">
          {[
            { label: 'Watching',      value: items.length.toString(),  icon: '📋', color: '#818CF8' },
            { label: 'Gainers',        value: gainers.toString(),        icon: '▲',  color: '#00D395' },
            { label: 'Losers',         value: losers.toString(),         icon: '▼',  color: '#FF4466' },
            { label: 'Best Performer', value: best,                      icon: '🏆', color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} className="kpi-card flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{stat.icon}</span>
              <div>
                <div className="metric-label">{stat.label}</div>
                <div className="metric-value text-lg" style={{ color: stat.color }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main table card */}
      <div className="card !p-0 overflow-hidden">
        {/* Live badge */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #161C2E' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
            {filtered.length} of {items.length} symbol{items.length !== 1 ? 's' : ''}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="text-xs font-semibold" style={{ color: '#00D395' }}>Auto-refresh 30s</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-t-indigo-500 rounded-full animate-spin mx-auto" style={{ borderColor: '#161C2E', borderTopColor: '#818CF8' }} />
            <p className="text-sm" style={{ color: '#4E5A7A' }}>Loading watchlist…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            {items.length === 0 ? (
              <>
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="font-medium text-sm" style={{ color: '#8896B3' }}>Your watchlist is empty</p>
                <p className="text-xs" style={{ color: '#4E5A7A' }}>Add stock symbols above to start tracking live prices.</p>
              </>
            ) : (
              <>
                <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="font-medium text-sm" style={{ color: '#8896B3' }}>No matches for "{search}"</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(24,28,46,0.4)', borderBottom: '1px solid #161C2E' }}>
                  {[
                    { key: 'symbol', label: 'Symbol', sortable: true, align: 'left' },
                    { key: 'price',  label: 'Price',  sortable: true, align: 'right' },
                    { key: 'change', label: 'Change', sortable: true, align: 'right' },
                    { key: 'open',   label: 'Open',   sortable: false, align: 'right', lg: true },
                    { key: 'high',   label: 'High',   sortable: false, align: 'right', lg: true },
                    { key: 'low',    label: 'Low',    sortable: false, align: 'right', lg: true },
                    { key: 'vol',    label: 'Volume', sortable: false, align: 'right', xl: true },
                    { key: '52h',    label: '52W Hi', sortable: false, align: 'right', xl: true },
                    { key: '52l',    label: '52W Lo', sortable: false, align: 'right', xl: true },
                    { key: 'rm',     label: '',       sortable: false, align: 'center' },
                  ].map(col => (
                    <th key={col.key}
                      className={`px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap${col.sortable ? ' cursor-pointer select-none' : ''}${col.lg ? ' hidden lg:table-cell' : ''}${col.xl ? ' hidden xl:table-cell' : ''}`}
                      style={{ textAlign: col.align as any, color: '#4E5A7A', letterSpacing: '0.07em' }}
                      onClick={col.sortable ? () => handleSort(col.key as any) : undefined}>
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const q     = quotes[item.symbol] as Quote | undefined;
                  const pos   = (q?.changePercent ?? 0) >= 0;
                  const isRm  = removingSymbol === item.symbol;
                  return (
                    <tr key={item.symbol} className="table-row" style={{ opacity: isRm ? 0.4 : 1 }}>
                      {/* Symbol */}
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.08)', color: '#818CF8', fontFamily: 'JetBrains Mono, monospace' }}>
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold font-mono" style={{ color: '#F0F4FF' }}>{item.symbol}</div>
                            {item.notes && <div className="text-xs truncate max-w-[100px]" style={{ color: '#4E5A7A' }}>{item.notes}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Price */}
                      <td className="table-cell text-right">
                        {q ? (
                          <span className="font-bold tabular-nums font-mono" style={{ color: '#F0F4FF' }}>{fmt(q.price)}</span>
                        ) : <span className="skeleton h-4 w-20 rounded inline-block" />}
                      </td>
                      {/* Change */}
                      <td className="table-cell text-right">
                        {q ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="font-bold tabular-nums font-mono" style={{ color: pos ? '#00D395' : '#FF4466' }}>
                              {pos ? '+' : ''}{fmt(q.changeAmount)}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: pos ? 'rgba(0,211,149,0.7)' : 'rgba(255,68,102,0.7)' }}>
                              ({pos ? '+' : ''}{q.changePercent?.toFixed(2)}%)
                            </span>
                          </div>
                        ) : <span className="skeleton h-4 w-16 rounded inline-block" />}
                      </td>
                      {/* Open */}
                      <td className="table-cell text-right tabular-nums font-mono hidden lg:table-cell" style={{ color: '#8896B3' }}>
                        {q ? fmt(q.open) : '—'}
                      </td>
                      {/* High */}
                      <td className="table-cell text-right tabular-nums font-mono hidden lg:table-cell" style={{ color: '#00D395' }}>
                        {q ? fmt(q.high) : '—'}
                      </td>
                      {/* Low */}
                      <td className="table-cell text-right tabular-nums font-mono hidden lg:table-cell" style={{ color: '#FF4466' }}>
                        {q ? fmt(q.low) : '—'}
                      </td>
                      {/* Volume */}
                      <td className="table-cell text-right tabular-nums hidden xl:table-cell" style={{ color: '#4E5A7A' }}>
                        {fmtVol(q?.volume)}
                      </td>
                      {/* 52W High */}
                      <td className="table-cell text-right tabular-nums font-mono hidden xl:table-cell" style={{ color: '#4E5A7A' }}>
                        {q?.week52High ? fmt(q.week52High) : '—'}
                      </td>
                      {/* 52W Low */}
                      <td className="table-cell text-right tabular-nums font-mono hidden xl:table-cell" style={{ color: '#4E5A7A' }}>
                        {q?.week52Low ? fmt(q.week52Low) : '—'}
                      </td>
                      {/* Remove */}
                      <td className="table-cell text-center">
                        <button
                          id={`watchlist-remove-${item.symbol}`}
                          onClick={() => handleRemove(item.symbol)}
                          disabled={isRm}
                          title={`Remove ${item.symbol}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all duration-150 disabled:opacity-40"
                          style={{ color: '#2D3A5E' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#FF4466'; e.currentTarget.style.background = 'rgba(255,68,102,0.08)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#2D3A5E'; e.currentTarget.style.background = 'transparent'; }}>
                          {isRm ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="px-5 py-3 flex items-center justify-between text-xs"
                style={{ borderTop: '1px solid #161C2E', background: 'rgba(24,28,46,0.3)' }}>
                <span style={{ color: '#4E5A7A' }}>Showing {filtered.length} of {items.length} symbols</span>
                <span style={{ color: '#4E5A7A' }}>Prices in USD</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
