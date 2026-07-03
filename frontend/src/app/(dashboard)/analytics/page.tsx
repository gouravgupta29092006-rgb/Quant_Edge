'use client';

import { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';

interface Analytics {
  portfolioId: string;
  totalReturnPct: number;
  annualisedReturnPct: number;
  volatilityPct: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPct: number;
  maxDrawdownStart: string;
  maxDrawdownEnd: string;
  bestDayPct: number;
  worstDayPct: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgWinPct: number;
  avgLossPct: number;
}

type DateRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

function MetricCard({ label, value, sub, good }: { label: string; value: string; sub?: string; good?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-bold ${good === true ? 'text-success' : good === false ? 'text-danger' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-[var(--text-muted)] mt-1">{sub}</div>}
    </div>
  );
}

const RANGES: { label: string; value: DateRange; days: number }[] = [
  { label: '1M', value: '1M', days: 30 },
  { label: '3M', value: '3M', days: 90 },
  { label: '6M', value: '6M', days: 180 },
  { label: '1Y', value: '1Y', days: 365 },
  { label: 'All', value: 'ALL', days: 3650 },
];

export default function AnalyticsPage() {
  const { activePortfolioId, portfolios, setActivePortfolioId } = usePortfolioStore();
  const [range, setRange] = useState<DateRange>('1Y');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [equityCurve, setEquityCurve] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedRange = RANGES.find((r) => r.value === range)!;

  useEffect(() => {
    if (!activePortfolioId) return;
    setLoading(true);
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - selectedRange.days * 86400000).toISOString().split('T')[0];

    Promise.allSettled([
      apiGet<Analytics>(`/analytics/${activePortfolioId}?from=${from}&to=${to}`),
      apiGet<{ date: string; value: number }[]>(`/analytics/${activePortfolioId}/equity-curve?from=${from}&to=${to}`),
    ]).then(([a, e]) => {
      if (a.status === 'fulfilled') setAnalytics(a.value);
      if (e.status === 'fulfilled') setEquityCurve(e.value ?? []);
    }).finally(() => setLoading(false));
  }, [activePortfolioId, range]);

  // Radar chart data
  const radarData = analytics ? [
    { metric: 'Return', value: Math.min(Math.max(analytics.totalReturnPct + 50, 0), 100) },
    { metric: 'Sharpe', value: Math.min(Math.max((analytics.sharpeRatio + 1) * 25, 0), 100) },
    { metric: 'Win Rate', value: analytics.winRate },
    { metric: 'Low Risk', value: Math.max(100 - analytics.volatilityPct * 5, 0) },
    { metric: 'Drawdown', value: Math.max(100 - analytics.maxDrawdownPct * 5, 0) },
    { metric: 'Sortino', value: Math.min(Math.max((analytics.sortinoRatio + 1) * 25, 0), 100) },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <div className="flex items-center gap-3">
          {portfolios.length > 1 && (
            <select id="analytics-portfolio-select" className="input text-sm w-40"
              value={activePortfolioId ?? ''} onChange={(e) => setActivePortfolioId(e.target.value)}>
              {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {/* Range selector */}
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button key={r.value} id={`analytics-range-${r.value}`}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  range === r.value ? 'bg-brand-500 text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg-card)] rounded-2xl" />)}
        </div>
      )}

      {!loading && !analytics && (
        <div className="card p-12 text-center">
          <p className="text-[var(--text-muted)] text-sm">No analytics data for this period. Trade more to generate insights!</p>
        </div>
      )}

      {!loading && analytics && (
        <>
          {/* Key metrics — 2 rows × 4 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard label="Total Return" value={`${analytics.totalReturnPct >= 0 ? '+' : ''}${analytics.totalReturnPct.toFixed(2)}%`}
              good={analytics.totalReturnPct >= 0} />
            <MetricCard label="Annualised Return" value={`${analytics.annualisedReturnPct.toFixed(2)}%`}
              good={analytics.annualisedReturnPct >= 0} />
            <MetricCard label="Sharpe Ratio" value={analytics.sharpeRatio.toFixed(2)}
              sub="Risk-adjusted return (>1 = good)" good={analytics.sharpeRatio >= 1} />
            <MetricCard label="Sortino Ratio" value={analytics.sortinoRatio.toFixed(2)}
              sub="Downside risk adjusted" good={analytics.sortinoRatio >= 1} />
            <MetricCard label="Max Drawdown" value={`${analytics.maxDrawdownPct.toFixed(2)}%`}
              sub={analytics.maxDrawdownStart ? `${analytics.maxDrawdownStart} → ${analytics.maxDrawdownEnd}` : undefined}
              good={false} />
            <MetricCard label="Volatility" value={`${analytics.volatilityPct.toFixed(2)}%`} sub="Annualised" />
            <MetricCard label="Win Rate" value={`${analytics.winRate.toFixed(1)}%`}
              good={analytics.winRate >= 50} sub={`${analytics.totalTrades} total trades`} />
            <MetricCard label="Best / Worst Day" value={`${analytics.bestDayPct >= 0 ? '+' : ''}${analytics.bestDayPct.toFixed(2)}%`}
              sub={`Worst: ${analytics.worstDayPct.toFixed(2)}%`} good={analytics.bestDayPct > 0} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Equity curve */}
            <div className="xl:col-span-2 card p-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Equity Curve</h3>
              {equityCurve.length < 2 ? (
                <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
                  Insufficient data for {range} range
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={55} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                      formatter={(v: any) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Value']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false}
                      activeDot={{ r: 4, fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Performance radar */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Risk Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Radar name="Portfolio" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade stats */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Trade Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Total Trades', value: analytics.totalTrades.toString() },
                { label: 'Win Rate', value: `${analytics.winRate.toFixed(1)}%` },
                { label: 'Profit Factor', value: analytics.profitFactor.toFixed(2) },
                { label: 'Avg. Win', value: `+${analytics.avgWinPct.toFixed(2)}%` },
                { label: 'Avg. Loss', value: `${analytics.avgLossPct.toFixed(2)}%` },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--bg-hover)] rounded-xl p-4 text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">{s.label}</div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
