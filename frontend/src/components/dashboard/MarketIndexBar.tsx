'use client';

import { useMarketStore } from '@/stores/marketStore';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PLACEHOLDERS = [
  { symbol: 'NIFTY50',   name: 'Nifty 50',   price: 24821.0, changePercent: 0.32 },
  { symbol: 'SENSEX',    name: 'Sensex',      price: 81224.0, changePercent: 0.28 },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty',  price: 52416.0, changePercent: -0.15 },
  { symbol: 'SPX',       name: 'S&P 500',     price: 5488.0,  changePercent: 0.64 },
  { symbol: 'DJI',       name: 'Dow Jones',   price: 40589.0, changePercent: 0.41 },
  { symbol: 'NDX',       name: 'Nasdaq 100',  price: 19821.0, changePercent: 0.87 },
  { symbol: 'FTSE',      name: 'FTSE 100',    price: 8312.0,  changePercent: -0.08 },
  { symbol: 'GOLD',      name: 'Gold',        price: 2385.0,  changePercent: 0.21 },
  { symbol: 'BTC',       name: 'Bitcoin',     price: 67240.0, changePercent: 1.45 },
];

const fmtNum = (n: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function MarketIndexBar() {
  const { indices }  = useMarketStore();
  const shouldReduce = useReducedMotion();
  const data = indices.length > 0 ? indices : PLACEHOLDERS;
  const doubled = [...data, ...data]; // seamless loop

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:  'linear-gradient(145deg, #0B0E16 0%, #0E1220 100%)',
        border:      '1px solid #1A2235',
        boxShadow:   '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.025)',
      }}
      initial={shouldReduce ? undefined : { opacity: 0, y: -8 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #0B0E16 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #0B0E16 0%, transparent 100%)' }} />

      {/* Live pill */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
        <span className="live-dot" />
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-success hidden sm:block">
          Live
        </span>
      </div>

      {/* Ticker track */}
      <div className="overflow-hidden py-3.5 pl-16 sm:pl-20">
        <div
          className={cn('flex items-center whitespace-nowrap', !shouldReduce && 'animate-ticker')}
          style={{ width: 'max-content', gap: 0 }}
        >
          {doubled.map((idx, i) => {
            const pos = (idx.changePercent ?? 0) >= 0;
            return (
              <div key={`${idx.symbol}-${i}`} className="inline-flex items-center gap-3 px-5 flex-shrink-0">
                {i !== 0 && <div className="w-px h-4 flex-shrink-0" style={{ background: '#1E293B' }} />}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-text-muted block">
                    {idx.name ?? idx.symbol}
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-text-primary">
                    {typeof idx.price === 'number' ? fmtNum(idx.price) : '—'}
                  </span>
                </div>
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0',
                  pos ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
                )}>
                  {pos ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
