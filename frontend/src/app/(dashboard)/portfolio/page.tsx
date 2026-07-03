'use client';

import { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { apiGet } from '@/lib/api';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import EquityChart from '@/components/dashboard/EquityChart';
import QuickTradePanel from '@/components/dashboard/QuickTradePanel';

interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  executedAt: string;
  notes?: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PortfolioPage() {
  const { activePortfolio, activePortfolioId, portfolios, setActivePortfolioId, fetchPortfolios, isLoading } = usePortfolioStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions' | 'performance'>('holdings');

  useEffect(() => { fetchPortfolios(); }, []);

  useEffect(() => {
    if (!activePortfolioId) return;
    setTxLoading(true);
    apiGet<{ content: Transaction[]; last: boolean }>(`/portfolios/${activePortfolioId}/transactions?page=${page}&size=20`)
      .then((data) => {
        setTransactions((prev) => page === 0 ? data.content : [...prev, ...data.content]);
        setHasMore(!data.last);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [activePortfolioId, page]);

  if (isLoading && !activePortfolio) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-[var(--bg-card)] rounded-2xl" />
        <div className="h-64 bg-[var(--bg-card)] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Portfolio</h1>
        {portfolios.length > 1 && (
          <select
            id="portfolio-page-selector"
            className="input w-48 text-sm"
            value={activePortfolioId ?? ''}
            onChange={(e) => setActivePortfolioId(e.target.value)}
          >
            {portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {!activePortfolio ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[var(--text-muted)] mb-5">No portfolios yet. Create one to start paper trading.</p>
          <button id="portfolio-create-first-btn" className="btn-primary px-8">Create portfolio</button>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Value', value: formatCurrency(activePortfolio.totalValue ?? 0) },
              { label: 'Holdings', value: formatCurrency(activePortfolio.holdingsValue ?? 0) },
              { label: 'Cash', value: formatCurrency(activePortfolio.cashBalance ?? 0) },
              {
                label: 'Total Return',
                value: `${(activePortfolio.totalReturn ?? 0) >= 0 ? '+' : ''}${formatCurrency(activePortfolio.totalReturn ?? 0)}`,
                accent: (activePortfolio.totalReturn ?? 0) >= 0 ? 'text-success' : 'text-danger',
              },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <div className="text-xs text-[var(--text-muted)] mb-1">{s.label}</div>
                <div className={`text-lg font-bold ${s.accent ?? 'text-[var(--text-primary)]'}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="card overflow-hidden">
                <div className="flex border-b border-[var(--border)]">
                  {(['holdings', 'transactions', 'performance'] as const).map((tab) => (
                    <button
                      key={tab}
                      id={`portfolio-tab-${tab}`}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-brand-500 text-brand-400'
                          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-1">
                  {activeTab === 'holdings' && <HoldingsTable />}

                  {activeTab === 'performance' && <div className="p-5"><EquityChart /></div>}

                  {activeTab === 'transactions' && (
                    <div className="overflow-x-auto">
                      {transactions.length === 0 && !txLoading ? (
                        <div className="p-8 text-center text-[var(--text-muted)] text-sm">No transactions yet.</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--bg-hover)]">
                              {['Date', 'Symbol', 'Type', 'Shares', 'Price', 'Total'].map((h) => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                                <td className="px-5 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDate(tx.executedAt)}</td>
                                <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{tx.symbol}</td>
                                <td className="px-5 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tx.type === 'BUY' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="px-5 py-3 tabular-nums text-[var(--text-secondary)]">{Number(tx.shares).toFixed(2)}</td>
                                <td className="px-5 py-3 tabular-nums text-[var(--text-secondary)]">{formatCurrency(tx.pricePerShare)}</td>
                                <td className="px-5 py-3 tabular-nums font-medium text-[var(--text-primary)]">{formatCurrency(tx.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {hasMore && (
                        <div className="p-4 text-center">
                          <button id="tx-load-more-btn" onClick={() => setPage((p) => p + 1)} disabled={txLoading}
                            className="btn-secondary text-xs px-5">
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
            <div>
              <QuickTradePanel />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
