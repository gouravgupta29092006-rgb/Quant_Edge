'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { apiGet } from '@/lib/api';
import { useMarketStore } from '@/stores/marketStore';
import QuickTradePanel from '@/components/dashboard/QuickTradePanel';

type ChartRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

interface OhlcvPoint { date: string; open: number; high: number; low: number; close: number; volume: number; }
interface CompanyInfo { symbol: string; name: string; sector?: string; exchange?: string; marketCap?: number; peRatio?: number; eps?: number; beta?: number; dividendYield?: number; week52High?: number; week52Low?: number; description?: string; }

const RANGES: ChartRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

function formatLargeNumber(n: number) {
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `₹${(n / 1e6).toFixed(2)}M`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--bg-hover)] rounded-xl p-3">
      <div className="text-xs text-[var(--text-muted)] mb-1">{label}</div>
      <div className="text-sm font-semibold text-[var(--text-primary)]">{value ?? '—'}</div>
    </div>
  );
}

export default function MarketPage() {
  const searchParams = useSearchParams();
  const [searchQ, setSearchQ] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [range, setRange] = useState<ChartRange>('1M');
  const [chartData, setChartData] = useState<OhlcvPoint[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { quotes, fetchQuote } = useMarketStore();

  // Load chart data
  useEffect(() => {
    if (!selectedSymbol) return;
    setChartLoading(true);
    Promise.allSettled([
      apiGet<OhlcvPoint[]>(`/market/chart/${selectedSymbol}?range=${range}`),
      apiGet<CompanyInfo>(`/market/company/${selectedSymbol}`),
      fetchQuote(selectedSymbol),
    ]).then(([chartResult, companyResult]) => {
      if (chartResult.status === 'fulfilled') setChartData(chartResult.value ?? []);
      if (companyResult.status === 'fulfilled') setCompanyInfo(companyResult.value as CompanyInfo);
    }).finally(() => setChartLoading(false));
  }, [selectedSymbol, range]);

  // Search
  useEffect(() => {
    if (searchQ.length < 1) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiGet<any[]>(`/market/search?q=${searchQ}&size=8`);
        setSearchResults(res ?? []);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ]);

  const quote = quotes[selectedSymbol];
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const chartColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Market</h1>
        {/* Search */}
        <div className="relative w-80">
          <input
            id="market-search-input"
            ref={searchRef}
            type="text"
            className="input pl-9 text-sm"
            placeholder="Search stocks, ETFs…"
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
              {searchResults.map((r) => (
                <button
                  key={r.symbol}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] text-left transition-colors"
                  onClick={() => { setSelectedSymbol(r.symbol); setSearchQ(r.symbol); setShowSearch(false); }}
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                    {r.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{r.symbol}</div>
                    <div className="text-xs text-[var(--text-muted)]">{r.name}</div>
                  </div>
                  {r.price && (
                    <div className="ml-auto text-right">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">₹{r.price.toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart area — 2 cols */}
        <div className="xl:col-span-2 space-y-4">
          {/* Price header */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-sm font-bold text-brand-400">
                    {selectedSymbol.slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{selectedSymbol}</h2>
                    <p className="text-sm text-[var(--text-muted)]">{companyInfo?.name ?? '—'} · {companyInfo?.exchange ?? ''}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                  {quote ? `₹${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                </div>
                {quote && (
                  <div className={`text-sm font-medium mt-0.5 ${isPositive ? 'text-success' : 'text-danger'}`}>
                    {isPositive ? '+' : ''}{quote.changeAmount?.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
                  </div>
                )}
              </div>
            </div>

            {/* Range selector */}
            <div className="flex gap-1 mb-4">
              {RANGES.map((r) => (
                <button
                  key={r}
                  id={`chart-range-${r}`}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    range === r ? 'bg-brand-500 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Price chart */}
            {chartLoading ? (
              <div className="h-56 flex items-center justify-center">
                <svg className="w-6 h-6 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : chartData.length < 2 ? (
              <div className="h-56 flex items-center justify-center text-[var(--text-muted)] text-sm">
                No chart data available for {selectedSymbol}
              </div>
            ) : (
              <div className="space-y-2">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} width={70} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                      labelStyle={{ color: 'var(--text-muted)', fontSize: '11px' }}
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      formatter={(v: any) => [`₹${(v as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Price']}
                    />
                    <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                {/* Volume chart */}
                <ResponsiveContainer width="100%" height={60}>
                  <BarChart data={chartData}>
                    <Bar dataKey="volume" fill={`${chartColor}40`} radius={[2, 2, 0, 0]} />
                    <XAxis hide />
                    <YAxis hide />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Company stats */}
          {companyInfo && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Company Overview</h3>
              {companyInfo.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed line-clamp-3">
                  {companyInfo.description}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="Market Cap" value={companyInfo.marketCap ? formatLargeNumber(companyInfo.marketCap) : '—'} />
                <StatBox label="P/E Ratio" value={companyInfo.peRatio?.toFixed(2) ?? '—'} />
                <StatBox label="EPS" value={companyInfo.eps ? `₹${companyInfo.eps.toFixed(2)}` : '—'} />
                <StatBox label="Beta" value={companyInfo.beta?.toFixed(2) ?? '—'} />
                <StatBox label="Div. Yield" value={companyInfo.dividendYield ? `${companyInfo.dividendYield.toFixed(2)}%` : '—'} />
                <StatBox label="52W High" value={companyInfo.week52High ? `₹${companyInfo.week52High.toLocaleString('en-IN')}` : '—'} />
                <StatBox label="52W Low" value={companyInfo.week52Low ? `₹${companyInfo.week52Low.toLocaleString('en-IN')}` : '—'} />
                <StatBox label="Sector" value={companyInfo.sector ?? '—'} />
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — Quick Trade */}
        <div>
          <QuickTradePanel />
        </div>
      </div>
    </div>
  );
}
