'use client';

import { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';

interface Analytics {
  portfolioId: string; totalReturnPct: number; annualisedReturnPct: number;
  volatilityPct: number; sharpeRatio: number; sortinoRatio: number;
  maxDrawdownPct: number; maxDrawdownStart: string; maxDrawdownEnd: string;
  bestDayPct: number; worstDayPct: number; totalTrades: number;
  winRate: number; profitFactor: number; avgWinPct: number; avgLossPct: number;
}

type DateRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';
const RANGES: { label: string; value: DateRange; days: number }[] = [
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: 'All', value: 'ALL', days: 3650 },
];

function KPIMetric({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  const color = good === true ? '#00D395' : good === false ? '#FF4466' : '#F0F4FF';
  return (
    <div className="kpi-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: '#4E5A7A' }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { activePortfolioId, portfolios, setActivePortfolioId } = usePortfolioStore();
  const [range, setRange] = useState<DateRange>('1Y');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [equityCurve, setEquityCurve] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedRange = RANGES.find(r => r.value === range)!;

  useEffect(() => {
    if (!activePortfolioId) return;
    setLoading(true);
    const to   = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - selectedRange.days * 86400000).toISOString().split('T')[0];
    Promise.allSettled([
      apiGet<Analytics>(`/analytics/${activePortfolioId}?from=${from}&to=${to}`),
      apiGet<{ date: string; value: number }[]>(`/analytics/${activePortfolioId}/equity-curve?from=${from}&to=${to}`),
    ]).then(([a, e]) => {
      if (a.status === 'fulfilled') setAnalytics(a.value);
      if (e.status === 'fulfilled') setEquityCurve(e.value ?? []);
    }).finally(() => setLoading(false));
  }, [activePortfolioId, range]);

  const radarData = analytics ? [
    { metric: 'Return',   value: Math.min(Math.max(analytics.totalReturnPct + 50, 0), 100) },
    { metric: 'Sharpe',   value: Math.min(Math.max((analytics.sharpeRatio + 1) * 25, 0), 100) },
    { metric: 'Win Rate', value: analytics.winRate },
    { metric: 'Low Risk', value: Math.max(100 - analytics.volatilityPct * 5, 0) },
    { metric: 'Drawdown', value: Math.max(100 - analytics.maxDrawdownPct * 5, 0) },
    { metric: 'Sortino',  value: Math.min(Math.max((analytics.sortinoRatio + 1) * 25, 0), 100) },
  ] : [];

  const equityStart = equityCurve[0]?.value ?? 0;
  const equityEnd   = equityCurve[equityCurve.length - 1]?.value ?? 0;
  const equityUp    = equityEnd >= equityStart;

  return (
    <div className="page-wrapper">
      {/* Controls row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {portfolios.length > 1 && (
            <select id="analytics-portfolio-select" className="input !w-auto !py-2 text-sm"
              value={activePortfolioId ?? ''} onChange={e => setActivePortfolioId(e.target.value)}>
              {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(24,28,46,0.6)' }}>
          {RANGES.map(r => (
            <button key={r.value} id={`analytics-range-${r.value}`}
              onClick={() => setRange(r.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{
                background: range === r.value ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: range === r.value ? '#818CF8' : '#4E5A7A',
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="kpi-strip">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      )}

      {!loading && !analytics && (
        <div className="card p-12 text-center">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm" style={{ color: '#4E5A7A' }}>No analytics data for this period. Trade more to generate insights!</p>
        </div>
      )}

      {!loading && analytics && (
        <>
          {/* KPI grid */}
          <div className="kpi-strip">
            <KPIMetric label="Total Return" value={`${analytics.totalReturnPct >= 0 ? '+' : ''}${analytics.totalReturnPct.toFixed(2)}%`} good={analytics.totalReturnPct >= 0} />
            <KPIMetric label="Ann. Return" value={`${analytics.annualisedReturnPct.toFixed(2)}%`} good={analytics.annualisedReturnPct >= 0} />
            <KPIMetric label="Sharpe Ratio" value={analytics.sharpeRatio.toFixed(2)} sub="> 1 = good" good={analytics.sharpeRatio >= 1} />
            <KPIMetric label="Sortino Ratio" value={analytics.sortinoRatio.toFixed(2)} good={analytics.sortinoRatio >= 1} />
            <KPIMetric label="Max Drawdown" value={`${analytics.maxDrawdownPct.toFixed(2)}%`} sub={analytics.maxDrawdownStart ? `${analytics.maxDrawdownStart} → ${analytics.maxDrawdownEnd}` : undefined} good={false} />
            <KPIMetric label="Volatility" value={`${analytics.volatilityPct.toFixed(2)}%`} sub="Annualised" />
            <KPIMetric label="Win Rate" value={`${analytics.winRate.toFixed(1)}%`} sub={`${analytics.totalTrades} trades`} good={analytics.winRate >= 50} />
            <KPIMetric label="Best Day" value={`${analytics.bestDayPct >= 0 ? '+' : ''}${analytics.bestDayPct.toFixed(2)}%`} sub={`Worst: ${analytics.worstDayPct.toFixed(2)}%`} good={analytics.bestDayPct > 0} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Equity curve */}
            <div className="xl:col-span-2 card p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${equityUp ? '#00D39560' : '#FF446660'}, transparent)` }} />
              <h3 className="text-sm font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Equity Curve</h3>
              {equityCurve.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-sm" style={{ color: '#4E5A7A' }}>
                  Insufficient data for {range} range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={equityUp ? '#00D395' : '#FF4466'} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={equityUp ? '#00D395' : '#FF4466'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161C2E" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#4E5A7A', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={55} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: '#0C0E15', border: '1px solid #1F2744', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                      formatter={(v: any) => [`$${(v as number).toLocaleString('en-US')}`, 'Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke={equityUp ? '#00D395' : '#FF4466'} strokeWidth={2} fill="url(#eqGrad)" dot={false} activeDot={{ r: 4, fill: equityUp ? '#00D395' : '#FF4466' }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Radar */}
            <div className="card p-6">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Risk Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1F2744" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'Inter' }} />
                  <Radar name="Portfolio" dataKey="value" stroke="#818CF8" fill="#818CF8" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade stats */}
          <div className="card p-6">
            <h3 className="text-sm font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Trade Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total Trades',   value: analytics.totalTrades.toString() },
                { label: 'Win Rate',       value: `${analytics.winRate.toFixed(1)}%` },
                { label: 'Profit Factor',  value: analytics.profitFactor.toFixed(2) },
                { label: 'Avg. Win',       value: `+${analytics.avgWinPct.toFixed(2)}%`, color: '#00D395' },
                { label: 'Avg. Loss',      value: `${analytics.avgLossPct.toFixed(2)}%`, color: '#FF4466' },
              ].map(s => (
                <div key={s.label} className="p-4 text-center rounded-2xl"
                  style={{ background: 'rgba(24,28,46,0.5)', border: '1px solid #161C2E' }}>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4E5A7A', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div className="text-xl font-bold font-mono" style={{ color: s.color ?? '#F0F4FF' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
