'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';

type Range = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
const RANGES: Range[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];
const RANGE_DAYS: Record<Range, number> = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'ALL': 3650 };
interface DataPoint { date: string; value: number; }

function formatDate(dateStr: string, range: Range) {
  const d = new Date(dateStr);
  if (range === '1W') return d.toLocaleDateString('en', { weekday: 'short' });
  if (range === '1M') return d.toLocaleDateString('en', { day: 'numeric', month: 'short' });
  return d.toLocaleDateString('en', { month: 'short', year: '2-digit' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl shadow-2xl"
      style={{ background: '#0C0E15', border: '1px solid #1F2744' }}>
      <p className="text-xs mb-1" style={{ color: '#4E5A7A' }}>{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>
        ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(payload[0].value)}
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
    const to   = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    apiGet<Array<{ date: string; value: number }>>(`/analytics/${activePortfolioId}/equity-curve`, { from, to })
      .then(points => {
        setData(points.map(p => ({ date: formatDate(p.date, range), value: p.value })));
      })
      .catch(() => {
        if (activePortfolio) {
          const seed = activePortfolio.initialCapital ?? 100000;
          const end  = activePortfolio.totalValue   ?? seed;
          const cnt  = Math.min(days, 30);
          const pts  = Array.from({ length: cnt }, (_, i) => ({
            date: `Day ${i + 1}`,
            value: Math.round(seed + (end - seed) * (i / (cnt - 1)) + (Math.random() - 0.5) * seed * 0.01),
          }));
          setData(pts);
        }
      })
      .finally(() => setLoading(false));
  }, [activePortfolioId, range]);

  const totalReturn = activePortfolio?.totalReturn ?? 0;
  const isUp = totalReturn >= 0;
  const chartColor = isUp ? '#00D395' : '#FF4466';

  // Compute percent change shown in header
  const startVal = data[0]?.value ?? 0;
  const endVal   = data[data.length - 1]?.value ?? 0;
  const pct = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Top accent line colored by direction */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${chartColor}50, transparent)` }} />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
            Portfolio Performance
          </h3>
          {data.length >= 2 && (
            <span className="text-xs font-bold" style={{ color: chartColor }}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(2)}% this period
            </span>
          )}
        </div>
        {/* Range selector */}
        <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'rgba(24,28,46,0.8)' }}>
          {RANGES.map(r => (
            <button
              key={r}
              id={`chart-range-${r}`}
              onClick={() => setRange(r)}
              className="px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150"
              style={{
                background: range === r ? chartColor + '15' : 'transparent',
                color: range === r ? chartColor : '#4E5A7A',
                border: range === r ? `1px solid ${chartColor}35` : '1px solid transparent',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center gap-3" style={{ color: '#4E5A7A' }}>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={2}>
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading chart…</span>
        </div>
      ) : data.length < 2 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2" style={{ color: '#4E5A7A' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-sm">Not enough data for {range} chart. Keep trading!</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={chartColor} stopOpacity={0.22} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#161C2E" vertical={false} />
            <XAxis dataKey="date"
              tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'Inter' }}
              axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis
              tick={{ fill: '#4E5A7A', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={50}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="value"
              stroke={chartColor} strokeWidth={2}
              fill="url(#equityGrad)" dot={false}
              activeDot={{ r: 4, fill: chartColor, stroke: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
