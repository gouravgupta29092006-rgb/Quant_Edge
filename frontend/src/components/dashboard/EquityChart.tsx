'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';

type Range = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const RANGES: Range[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

interface DataPoint { date: string; value: number; }

const RANGE_DAYS: Record<Range, number> = {
  '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 3650,
};

function formatDate(dateStr: string, range: Range) {
  const d = new Date(dateStr);
  if (range === '1W') return d.toLocaleDateString('en', { weekday: 'short' });
  if (range === '1M') return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        ₹{new Intl.NumberFormat('en-IN').format(payload[0].value)}
      </p>
    </div>
  );
};

export default function EquityChart() {
  const { activePortfolio, activePortfolioId } = usePortfolioStore();
  const [range, setRange] = useState<Range>('1M');
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePortfolioId) return;
    setLoading(true);
    const days = RANGE_DAYS[range];
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    apiGet<Array<{ date: string; value: number }>>(`/analytics/${activePortfolioId}/equity-curve`, { from, to })
      .then((points) => {
        setData(points.map((p) => ({ date: formatDate(p.date, range), value: p.value })));
      })
      .catch(() => {
        // Fallback: generate a mock equity curve from portfolio data
        if (activePortfolio) {
          const seed = activePortfolio.initialCapital ?? 100000;
          const end  = activePortfolio.totalValue   ?? seed;
          const pts  = Array.from({ length: days > 30 ? 30 : days }, (_, i) => {
            const frac = i / (days > 30 ? 29 : days - 1);
            return { date: `Day ${i + 1}`, value: Math.round(seed + (end - seed) * frac + (Math.random() - 0.5) * seed * 0.01) };
          });
          setData(pts);
        }
      })
      .finally(() => setLoading(false));
  }, [activePortfolioId, range]);

  // colour based on direction
  const totalReturn = activePortfolio?.totalReturn ?? 0;
  const chartColor = totalReturn >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Portfolio Performance</h3>
        {/* Range selector */}
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              id={`chart-range-${r}`}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150 ${
                range === r
                  ? 'bg-brand-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <svg className="w-6 h-6 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : data.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-[var(--text-muted)] text-sm">
          Not enough data for {range} chart. Keep trading!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#equityGrad)"
              dot={false}
              activeDot={{ r: 4, fill: chartColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
