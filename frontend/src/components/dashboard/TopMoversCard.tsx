'use client';

import { useState } from 'react';
import { useMarketStore } from '@/stores/marketStore';

export default function TopMoversCard() {
  const { movers } = useMarketStore();

  const { gainers = [], losers = [] } = movers;
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers');
  const data = tab === 'gainers' ? gainers : losers;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Movers</h3>
        <div className="flex gap-1 p-1 bg-[var(--bg-hover)] rounded-lg">
          <button
            id="movers-gainers-tab"
            onClick={() => setTab('gainers')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              tab === 'gainers' ? 'bg-success text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            Gainers
          </button>
          <button
            id="movers-losers-tab"
            onClick={() => setTab('losers')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              tab === 'losers' ? 'bg-danger text-white' : 'text-[var(--text-muted)]'
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] text-center py-4">Loading market movers…</p>
      ) : (
        <ul className="space-y-2">
          {data.slice(0, 6).map((stock, i) => {
            const pos = (stock.changePercent ?? 0) >= 0;
            return (
              <li key={stock.symbol ?? i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-muted)] w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{stock.symbol}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate max-w-24">{stock.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                    ₹{new Intl.NumberFormat('en-IN').format(stock.price ?? 0)}
                  </div>
                  <div className={`text-xs font-medium ${pos ? 'text-success' : 'text-danger'}`}>
                    {pos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
