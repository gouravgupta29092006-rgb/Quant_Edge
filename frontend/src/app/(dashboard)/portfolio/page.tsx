'use client';

import { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import EquityChart from '@/components/dashboard/EquityChart';
import QuickTradePanel from '@/components/dashboard/QuickTradePanel';

interface Transaction {
  id: string; symbol: string; type: 'BUY' | 'SELL';
  shares: number; pricePerShare: number; totalAmount: number;
  executedAt: string; notes?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const TABS = ['holdings', 'transactions', 'performance'] as const;
type Tab = typeof TABS[number];

export default function PortfolioPage() {
  const { activePortfolio, activePortfolioId, portfolios, setActivePortfolioId, fetchPortfolios, isLoading } = usePortfolioStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('holdings');

  useEffect(() => { fetchPortfolios(); }, []);

  useEffect(() => {
    if (!activePortfolioId) return;
    setTxLoading(true);
    apiGet<{ content: Transaction[]; last: boolean }>(`/portfolios/${activePortfolioId}/transactions?page=${page}&size=20`)
      .then(data => {
        setTransactions(prev => page === 0 ? data.content : [...prev, ...data.content]);
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [activePortfolioId, page]);

  if (isLoading && !activePortfolio) {
    return (
      <div className="space-y-5">
        <div className="kpi-strip">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (!activePortfolio) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#818CF8" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>No portfolios yet</h3>
          <p className="text-sm" style={{ color: '#8896B3' }}>Create one to start paper trading with $100K virtual capital</p>
        </div>
        <button id="portfolio-create-first-btn" className="btn-primary px-8 mx-auto">Create portfolio</button>
      </div>
    );
  }

  const totalReturn = activePortfolio.totalReturn ?? 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className="page-wrapper">
      {/* Selector row */}
      {portfolios.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4E5A7A' }}>Portfolio</span>
          <select
            id="portfolio-page-selector"
            className="input !w-auto !py-2 text-sm"
            value={activePortfolioId ?? ''}
            onChange={e => setActivePortfolioId(e.target.value)}>
            {portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* KPI strip */}
      <div className="kpi-strip">
        {[
          { label: 'Total Value',   value: fmt(activePortfolio.totalValue ?? 0),    color: undefined },
          { label: 'Holdings',      value: fmt(activePortfolio.holdingsValue ?? 0),  color: '#06B6D4' },
          { label: 'Cash Balance',  value: fmt(activePortfolio.cashBalance ?? 0),    color: '#818CF8' },
          {
            label: 'Total Return',
            value: `${isPositive ? '+' : ''}${fmt(totalReturn)}`,
            color: isPositive ? '#00D395' : '#FF4466',
            sub: `${isPositive ? '+' : ''}${(activePortfolio.totalReturnPct ?? 0).toFixed(2)}%`,
          },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="metric-label">{k.label}</div>
            <div className="metric-value" style={k.color ? { color: k.color } : {}}>{k.value}</div>
            {k.sub && <div className="text-xs font-bold" style={{ color: k.color }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Tabbed card */}
          <div className="card !p-0 overflow-hidden">
            <div className="flex" style={{ borderBottom: '1px solid #161C2E' }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  id={`portfolio-tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-3.5 text-sm font-semibold capitalize transition-all duration-150 relative"
                  style={{
                    color: activeTab === tab ? '#818CF8' : '#4E5A7A',
                    borderBottom: activeTab === tab ? '2px solid #6366F1' : '2px solid transparent',
                    marginBottom: '-1px',
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            <div>
              {activeTab === 'holdings' && <HoldingsTable />}

              {activeTab === 'performance' && (
                <div className="p-6"><EquityChart /></div>
              )}

              {activeTab === 'transactions' && (
                <div className="overflow-x-auto">
                  {transactions.length === 0 && !txLoading ? (
                    <div className="p-10 text-center">
                      <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm" style={{ color: '#4E5A7A' }}>No transactions yet</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'rgba(24,28,46,0.4)', borderBottom: '1px solid #161C2E' }}>
                          {['Date', 'Symbol', 'Type', 'Shares', 'Price', 'Total'].map(h => (
                            <th key={h} className="table-header-cell">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => (
                          <tr key={tx.id} className="table-row">
                            <td className="table-cell !text-xs whitespace-nowrap" style={{ color: '#4E5A7A' }}>{fmtDate(tx.executedAt)}</td>
                            <td className="table-cell font-bold font-mono">{tx.symbol}</td>
                            <td className="table-cell">
                              <span className={tx.type === 'BUY' ? 'badge-success' : 'badge-danger'}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="table-cell tabular-nums font-mono" style={{ color: '#8896B3' }}>{Number(tx.shares).toFixed(2)}</td>
                            <td className="table-cell tabular-nums font-mono" style={{ color: '#8896B3' }}>{fmt(tx.pricePerShare)}</td>
                            <td className="table-cell tabular-nums font-bold font-mono">{fmt(tx.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {hasMore && (
                    <div className="p-4 text-center" style={{ borderTop: '1px solid #161C2E' }}>
                      <button id="tx-load-more-btn" onClick={() => setPage(p => p + 1)} disabled={txLoading}
                        className="btn-secondary btn-sm">
                        {txLoading ? 'Loading…' : 'Load more'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trade panel */}
        <div><QuickTradePanel /></div>
      </div>
    </div>
  );
}
