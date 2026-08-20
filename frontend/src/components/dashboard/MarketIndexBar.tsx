'use client';

import { useEffect, useRef } from 'react';
import { useMarketStore } from '@/stores/marketStore';

export default function MarketIndexBar() {
  const { indices } = useMarketStore();
  const tickerRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    { symbol: 'NIFTY50',   name: 'Nifty 50',    price: 24821.0,  changePercent: 0.32 },
    { symbol: 'SENSEX',    name: 'Sensex',       price: 81224.0,  changePercent: 0.28 },
    { symbol: 'BANKNIFTY', name: 'Bank Nifty',   price: 52416.0,  changePercent: -0.15 },
    { symbol: 'SPX',       name: 'S&P 500',      price: 5488.0,   changePercent: 0.64 },
    { symbol: 'DJI',       name: 'Dow Jones',    price: 40589.0,  changePercent: 0.41 },
    { symbol: 'NDX',       name: 'Nasdaq 100',   price: 19821.0,  changePercent: 0.87 },
    { symbol: 'FTSE',      name: 'FTSE 100',     price: 8312.0,   changePercent: -0.08 },
    { symbol: 'GOLD',      name: 'Gold',         price: 2385.0,   changePercent: 0.21 },
  ];

  const data = indices.length > 0 ? indices : placeholders;
  // Duplicate for seamless loop
  const doubled = [...data, ...data];

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(145deg, #0C0E15 0%, #111420 100%)',
        border: '1px solid #161C2E',
        boxShadow: '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}>
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #0C0E15, transparent)' }} />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #0C0E15, transparent)' }} />

      {/* Live indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5">
        <span className="live-dot" />
        <span className="text-xs font-semibold hidden sm:block" style={{ color: '#00D395', letterSpacing: '0.05em' }}>LIVE</span>
      </div>

      {/* Scrolling ticker */}
      <div className="overflow-hidden py-3 pl-14 sm:pl-20" ref={tickerRef}>
        <div className="flex items-center gap-0 animate-ticker whitespace-nowrap"
          style={{ width: 'max-content' }}>
          {doubled.map((idx, i) => {
            const pos = (idx.changePercent ?? 0) >= 0;
            return (
              <div key={`${idx.symbol}-${i}`}
                className="inline-flex items-center gap-3 px-5 flex-shrink-0">
                {/* Separator */}
                {i !== 0 && (
                  <div className="w-px h-5 flex-shrink-0 mr-2" style={{ background: '#1F2744' }} />
                )}
                <div>
                  <span className="text-xs font-semibold block" style={{ color: '#4E5A7A', letterSpacing: '0.04em' }}>
                    {idx.name ?? idx.symbol}
                  </span>
                  <span className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>
                    {typeof idx.price === 'number'
                      ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(idx.price)
                      : '—'}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                  style={{
                    background: pos ? 'rgba(0,211,149,0.1)' : 'rgba(255,68,102,0.1)',
                    color: pos ? '#00D395' : '#FF4466',
                  }}>
                  {pos ? '+' : ''}{(idx.changePercent ?? 0).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
