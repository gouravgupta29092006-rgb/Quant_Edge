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

function formatLarge(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString('en-US')}`;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(24,28,46,0.5)', border: '1px solid #161C2E' }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4E5A7A', letterSpacing: '0.06em' }}>{label}</div>
      <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>{value ?? '—'}</div>
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
  const chartColor = isPositive ? '#00D395' : '#FF4466';

  return (
    <div className="page-wrapper">
      {/* Search bar row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            id="market-search-input"
            ref={searchRef}
            type="text"
            className="input pl-10 text-sm"
            placeholder="Search stocks, ETFs… (e.g. AAPL, TSLA)"
            value={searchQ}
            onChange={e => { setSearchQ(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4E5A7A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searching && (
            <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={2}>
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-2xl z-50 overflow-hidden animate-scale-in"
              style={{ background: '#0C0E15', border: '1px solid #1F2744', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
              {searchResults.map(r => (
                <button
                  key={r.symbol}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{ borderBottom: '1px solid #161C2E' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161C2E')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setSelectedSymbol(r.symbol); setSearchQ(r.symbol); setShowSearch(false); }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {r.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>{r.symbol}</div>
                    <div className="text-xs truncate" style={{ color: '#4E5A7A' }}>{r.name}</div>
                  </div>
                  {r.price && (
                    <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>
                      ${r.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs px-3 py-1.5 rounded-xl font-mono font-bold"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>
          {selectedSymbol}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart — 2 cols */}
        <div className="xl:col-span-2 space-y-5">
          {/* Price header card */}
          <div className="card p-6 relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${chartColor}60, transparent)` }} />

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
                  {selectedSymbol.slice(0, 3)}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>{selectedSymbol}</h2>
                  <p className="text-sm" style={{ color: '#4E5A7A' }}>
                    {companyInfo?.name ?? '—'}{companyInfo?.exchange ? ` · ${companyInfo.exchange}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F0F4FF' }}>
                  {quote ? `$${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </div>
                {quote && (
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={chartColor} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d={isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
                    </svg>
                    <span className="text-sm font-bold" style={{ color: chartColor }}>
                      {isPositive ? '+' : ''}{quote.changeAmount?.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Range selector */}
            <div className="flex gap-1 mb-5">
              {RANGES.map(r => (
                <button
                  key={r}
                  id={`chart-range-${r}`}
                  onClick={() => setRange(r)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={{
                    background: range === r ? chartColor + '18' : 'transparent',
                    color: range === r ? chartColor : '#4E5A7A',
                    border: range === r ? `1px solid ${chartColor}40` : '1px solid transparent',
                  }}>
                  {r}
                </button>
              ))}
            </div>

            {/* Chart */}
            {chartLoading ? (
              <div className="h-56 flex items-center justify-center gap-3" style={{ color: '#4E5A7A' }}>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={2}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Loading chart…</span>
              </div>
            ) : chartData.length < 2 ? (
              <div className="h-56 flex items-center justify-center text-sm" style={{ color: '#4E5A7A' }}>
                No chart data available for {selectedSymbol}
              </div>
            ) : (
              <div className="space-y-1">
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161C2E" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `$${v.toLocaleString('en-US')}`} width={65} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#0C0E15', border: '1px solid #1F2744', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                      labelStyle={{ color: '#8896B3', marginBottom: '4px' }}
                      itemStyle={{ color: '#F0F4FF', fontWeight: 700, fontFamily: 'JetBrains Mono' }}
                      formatter={(v: any) => [`$${(v as number).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Close']}
                    />
                    <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={50}>
                  <BarChart data={chartData}>
                    <Bar dataKey="volume" fill={`${chartColor}25`} radius={[2, 2, 0, 0]} />
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
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Company Overview</h3>
              {companyInfo.description && (
                <p className="text-sm leading-relaxed mb-5 line-clamp-3" style={{ color: '#8896B3' }}>
                  {companyInfo.description}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox label="Market Cap" value={companyInfo.marketCap ? formatLarge(companyInfo.marketCap) : '—'} />
                <StatBox label="P/E Ratio" value={companyInfo.peRatio?.toFixed(2) ?? '—'} />
                <StatBox label="EPS" value={companyInfo.eps ? `$${companyInfo.eps.toFixed(2)}` : '—'} />
                <StatBox label="Beta" value={companyInfo.beta?.toFixed(2) ?? '—'} />
                <StatBox label="Div. Yield" value={companyInfo.dividendYield ? `${companyInfo.dividendYield.toFixed(2)}%` : '—'} />
                <StatBox label="52W High" value={companyInfo.week52High ? `$${companyInfo.week52High.toLocaleString('en-US')}` : '—'} />
                <StatBox label="52W Low" value={companyInfo.week52Low ? `$${companyInfo.week52Low.toLocaleString('en-US')}` : '—'} />
                <StatBox label="Sector" value={companyInfo.sector ?? '—'} />
              </div>
            </div>
          )}
        </div>

        {/* Trade panel */}
        <div>
          <QuickTradePanel />
        </div>
      </div>
    </div>
  );
}
