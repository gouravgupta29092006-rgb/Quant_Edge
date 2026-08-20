'use client';

import { useState } from 'react';
import { useMarketStore } from '@/stores/marketStore';

export default function TopMoversCard() {
  const { movers } = useMarketStore();

  const { gainers = [], losers = [] } = movers;
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers');
  const data = tab === 'gainers' ? gainers : losers;

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #161C2E' }}>
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}>
          Top Movers
        </h3>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ background: 'rgba(24,28,46,0.8)' }}>
          {(['gainers', 'losers'] as const).map(t => (
            <button
              key={t}
              id={`movers-${t}-tab`}
              onClick={() => setTab(t)}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150"
              style={{
                background: tab === t
                  ? (t === 'gainers' ? 'rgba(0,211,149,0.15)' : 'rgba(255,68,102,0.15)')
                  : 'transparent',
                color: tab === t
                  ? (t === 'gainers' ? '#00D395' : '#FF4466')
                  : '#4E5A7A',
              }}>
              {t === 'gainers' ? '▲ Gainers' : '▼ Losers'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 py-3">
        {data.length === 0 ? (
          <div className="py-8 text-center">
            <div className="skeleton h-4 w-24 rounded mx-auto mb-2" />
            <div className="skeleton h-3 w-16 rounded mx-auto" />
          </div>
        ) : (
          <ul className="space-y-0">
            {data.slice(0, 6).map((stock, i) => {
              const pos = (stock.changePercent ?? 0) >= 0;
              return (
                <li key={stock.symbol ?? i}
                  className="flex items-center justify-between py-2.5 transition-all duration-150 rounded-xl px-2 -mx-2"
                  style={{ borderBottom: i < 5 ? '1px solid rgba(22,28,46,0.6)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24,28,46,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-xs font-bold tabular-nums text-right flex-shrink-0"
                      style={{ color: '#2D3A5E' }}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: pos ? 'rgba(0,211,149,0.08)' : 'rgba(255,68,102,0.08)',
                        color: pos ? '#00D395' : '#FF4466',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                      {(stock.symbol ?? '??').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#F0F4FF', fontFamily: 'JetBrains Mono, monospace' }}>
                        {stock.symbol}
                      </div>
                      <div className="text-xs truncate max-w-[88px]" style={{ color: '#4E5A7A' }}>
                        {stock.name ?? '—'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums font-mono" style={{ color: '#F0F4FF' }}>
                      ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stock.price ?? 0)}
                    </div>
                    <div className="text-xs font-bold" style={{ color: pos ? '#00D395' : '#FF4466' }}>
                      {pos ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
