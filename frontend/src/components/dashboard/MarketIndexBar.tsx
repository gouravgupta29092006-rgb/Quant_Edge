'use client';

import { useMarketStore } from '@/stores/marketStore';

export default function MarketIndexBar() {
  const { indices } = useMarketStore();

  const placeholders = [
    { symbol: 'NIFTY50', name: 'Nifty 50', price: 24821.0, changePercent: 0.32 },
    { symbol: 'SENSEX', name: 'Sensex', price: 81224.0, changePercent: 0.28 },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty', price: 52416.0, changePercent: -0.15 },
    { symbol: 'SPX', name: 'S&P 500', price: 5488.0, changePercent: 0.64 },
    { symbol: 'DJI', name: 'Dow Jones', price: 40589.0, changePercent: 0.41 },
    { symbol: 'NDX', name: 'Nasdaq 100', price: 19821.0, changePercent: 0.87 },
  ];

  const data = indices.length > 0 ? indices : placeholders;

  return (
    <div className="card px-4 py-3 overflow-hidden">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        {data.map((idx, i) => {
          const pos = (idx.changePercent ?? 0) >= 0;
          return (
            <div key={idx.symbol ?? i} className="flex items-center gap-3 flex-shrink-0">
              <div>
                <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">{idx.name ?? idx.symbol}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                  {typeof idx.price === 'number'
                    ? new Intl.NumberFormat('en-IN').format(idx.price)
                    : '—'}
                </div>
              </div>
              <div className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                pos ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
              }`}>
                {pos ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%
              </div>
              {i < data.length - 1 && (
                <div className="h-6 w-px bg-[var(--border)] flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
