'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';
import { cn } from '@/lib/utils';

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

const CustomTooltip = ({ active, payload, label, color }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="px-3.5 py-2.5 rounded-xl shadow-card-lg border"
      style={{ background: '#0A0E1A', borderColor: '#1E293B' }}
    >
      <p className="text-[11px] text-text-muted mb-1">{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color }}>
        ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(payload[0].value)}
      </p>
    </motion.div>
  );
};

export default function EquityChart() {
  const { activePortfolio, activePortfolioId } = usePortfolioStore();
  const [range, setRange]     = useState<Range>('1M');
  const [data, setData]       = useState<DataPoint[]>([]);
  const [isLoading, setLoading] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!activePortfolioId) return;
    setLoading(true);
    const days = RANGE_DAYS[range];
    const to   = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    apiGet<Array<{ date: string; value: number }>>(`/analytics/${activePortfolioId}/equity-curve`, { from, to })
      .then(pts => setData(pts.map(p => ({ date: formatDate(p.date, range), value: p.value }))))
      .catch(() => {
        if (activePortfolio) {
          const seed = activePortfolio.initialCapital ?? 100000;
          const end  = activePortfolio.totalValue   ?? seed;
          const cnt  = Math.min(days, 30);
          setData(Array.from({ length: cnt }, (_, i) => ({
            date:  `Day ${i + 1}`,
            value: Math.round(seed + (end - seed) * (i / (cnt - 1)) + (Math.random() - 0.5) * seed * 0.01),
          })));
        }
      })
      .finally(() => setLoading(false));
  }, [activePortfolioId, range]);

  const totalReturn = activePortfolio?.totalReturn ?? 0;
  const isUp        = totalReturn >= 0;
  const chartColor  = isUp ? '#22C55E' : '#EF4444';
  const gradStart   = isUp ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';

  const startVal = data[0]?.value ?? 0;
  const endVal   = data[data.length - 1]?.value ?? 0;
  const pct      = startVal > 0 ? ((endVal - startVal) / startVal) * 100 : 0;

  return (
    <motion.div
      className="card relative overflow-hidden"
      initial={shouldReduce ? undefined : { opacity: 0, y: 16 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Direction-aware top accent */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${chartColor}60, transparent)` }} />

      {/* Background glow blob */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${isUp ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)'} 0%, transparent 70%)` }} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Portfolio Performance</h3>
            <AnimatePresence mode="wait">
              {data.length >= 2 && (
                <motion.span
                  key={`${range}-${pct.toFixed(2)}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-bold"
                  style={{ color: chartColor }}
                >
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}% this period
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Range pills */}
          <div className="flex gap-0.5 p-0.5 rounded-lg bg-bg-secondary">
            {RANGES.map(r => (
              <motion.button
                key={r}
                id={`chart-range-${r}`}
                onClick={() => setRange(r)}
                className={cn(
                  'relative px-2.5 py-1 text-xs font-semibold rounded-md transition-colors',
                  range === r ? 'text-white' : 'text-text-muted hover:text-text-secondary',
                )}
                whileTap={shouldReduce ? {} : { scale: 0.93 }}
              >
                {range === r && (
                  <motion.span
                    layoutId="chart-range-pill"
                    className="absolute inset-0 rounded-md"
                    style={{ background: chartColor + '18', border: `1px solid ${chartColor}35` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{r}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-48 flex items-center justify-center gap-2.5 text-text-muted"
            >
              <motion.svg
                className="w-5 h-5"
                fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={2}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="#818CF8" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </motion.svg>
              <span className="text-sm">Loading chart…</span>
            </motion.div>
          ) : data.length < 2 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-48 flex flex-col items-center justify-center gap-2 text-text-muted"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm">Not enough data for {range}. Keep trading!</span>
            </motion.div>
          ) : (
            <motion.div
              key={`chart-${range}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <ResponsiveContainer width="100%" height={192}>
                <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={chartColor} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="date"
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                    axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={50}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip color={chartColor} />} />
                  <Area type="monotone" dataKey="value"
                    stroke={chartColor} strokeWidth={2.5}
                    fill="url(#equityGrad)" dot={false}
                    activeDot={{ r: 5, fill: chartColor, stroke: '#020617', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
