'use client';

import { usePortfolioStore, Holding } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function HoldingsTable() {
  const { activePortfolio, isLoading } = usePortfolioStore();
  const { quotes } = useMarketStore();

  const holdings = activePortfolio?.holdings ?? [];

  if (!holdings.length) {
    return (
      <div className="card p-6 text-center">
        <p className="text-[var(--text-muted)] text-sm">No holdings yet. Use the Quick Trade panel to buy your first stock.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-hover)]">
              {['Symbol', 'Shares', 'Avg. Cost', 'Current Price', 'Market Value', 'Gain / Loss'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {holdings.map((h: Holding) => {
              const liveQuote = quotes[h.symbol];
              const currentPrice = liveQuote?.price ?? h.currentPrice ?? h.averageCost;
              const currentValue = currentPrice * h.shares;
              const gainLoss = currentValue - h.totalCost;
              const gainLossPct = h.totalCost > 0 ? (gainLoss / h.totalCost) * 100 : 0;
              const pos = gainLoss >= 0;

              return (
                <tr key={h.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                        {h.symbol.slice(0, 2)}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{h.symbol}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">{Number(h.shares).toFixed(2)}</td>
                  <td className="px-5 py-3 text-[var(--text-secondary)] tabular-nums">{formatCurrency(h.averageCost)}</td>
                  <td className="px-5 py-3 text-[var(--text-primary)] tabular-nums font-medium">
                    {formatCurrency(currentPrice)}
                    {liveQuote && (
                      <span className={`ml-1.5 text-xs ${liveQuote.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                        ({liveQuote.changePercent >= 0 ? '+' : ''}{liveQuote.changePercent?.toFixed(2)}%)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-primary)] tabular-nums">{formatCurrency(currentValue)}</td>
                  <td className="px-5 py-3">
                    <div className={`flex flex-col ${pos ? 'text-success' : 'text-danger'}`}>
                      <span className="tabular-nums text-sm font-medium">
                        {pos ? '+' : ''}{formatCurrency(gainLoss)}
                      </span>
                      <span className="text-xs">
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
