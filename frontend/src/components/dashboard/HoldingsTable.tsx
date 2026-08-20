'use client';

import { usePortfolioStore, Holding } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
}

export default function HoldingsTable() {
  const { activePortfolio, isLoading } = usePortfolioStore();
  const { quotes } = useMarketStore();

  const holdings = activePortfolio?.holdings ?? [];

  if (!holdings.length) {
    return (
      <div className="card p-8 text-center space-y-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: '#8896B3' }}>No holdings yet</p>
        <p className="text-xs" style={{ color: '#4E5A7A' }}>Use the Quick Trade panel to buy your first stock.</p>
      </div>
    );
  }

  const COLS = ['Symbol', 'Shares', 'Avg. Cost', 'Current Price', 'Market Value', 'Gain / Loss'];

  return (
    <div className="card overflow-hidden !p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #161C2E' }}>
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF', fontFamily: 'Outfit, sans-serif' }}>
          Holdings
        </h3>
        <span className="badge-brand text-xs">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(24,28,46,0.4)', borderBottom: '1px solid #161C2E' }}>
              {COLS.map(h => (
                <th key={h} className="table-header-cell whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h: Holding) => {
              const liveQuote   = quotes[h.symbol];
              const currentPrice = liveQuote?.price ?? h.currentPrice ?? h.averageCost;
              const currentValue = currentPrice * h.shares;
              const gainLoss     = currentValue - h.totalCost;
              const gainLossPct  = h.totalCost > 0 ? (gainLoss / h.totalCost) * 100 : 0;
              const pos          = gainLoss >= 0;

              return (
                <tr key={h.id} className="table-row">
                  {/* Symbol */}
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#818CF8', fontFamily: 'JetBrains Mono, monospace' }}>
                        {h.symbol.slice(0, 2)}
                      </div>
                      <span className="font-semibold" style={{ color: '#F0F4FF', fontFamily: 'JetBrains Mono, monospace' }}>
                        {h.symbol}
                      </span>
                    </div>
                  </td>

                  {/* Shares */}
                  <td className="table-cell">
                    <span className="font-mono tabular-nums" style={{ color: '#8896B3' }}>
                      {Number(h.shares).toFixed(2)}
                    </span>
                  </td>

                  {/* Avg cost */}
                  <td className="table-cell">
                    <span className="font-mono tabular-nums" style={{ color: '#8896B3' }}>
                      {fmt(h.averageCost)}
                    </span>
                  </td>

                  {/* Current price */}
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono tabular-nums font-semibold" style={{ color: '#F0F4FF' }}>
                        {fmt(currentPrice)}
                      </span>
                      {liveQuote && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: liveQuote.changePercent >= 0 ? 'rgba(0,211,149,0.1)' : 'rgba(255,68,102,0.1)',
                            color: liveQuote.changePercent >= 0 ? '#00D395' : '#FF4466',
                          }}>
                          {liveQuote.changePercent >= 0 ? '+' : ''}{liveQuote.changePercent?.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Market value */}
                  <td className="table-cell">
                    <span className="font-mono tabular-nums font-medium" style={{ color: '#F0F4FF' }}>
                      {fmt(currentValue)}
                    </span>
                  </td>

                  {/* Gain/loss */}
                  <td className="table-cell">
                    <div className="flex flex-col">
                      <span className="font-mono tabular-nums text-sm font-bold"
                        style={{ color: pos ? '#00D395' : '#FF4466' }}>
                        {pos ? '+' : ''}{fmt(gainLoss)}
                      </span>
                      <span className="text-xs font-semibold"
                        style={{ color: pos ? 'rgba(0,211,149,0.7)' : 'rgba(255,68,102,0.7)' }}>
                        {pos ? '+' : ''}{gainLossPct.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
