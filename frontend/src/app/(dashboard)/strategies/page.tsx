'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  createdAt: string;
}

interface Backtest {
  id: string;
  symbol: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalReturnPct?: number;
  winRate?: number;
  totalTrades?: number;
  startDate: string;
  endDate: string;
  initialCapital: number;
  createdAt: string;
}

const STRATEGY_TYPES = [
  { value: 'BUY_AND_HOLD', label: 'Buy & Hold', desc: 'Simple benchmark — buy and hold to end date' },
  { value: 'SMA_CROSSOVER', label: 'SMA Crossover', desc: 'Golden/Death cross using two moving averages' },
  { value: 'RSI',           label: 'RSI Strategy', desc: 'Mean reversion using RSI overbought/oversold levels' },
];

export default function StrategiesPage() {
  const { isAuthenticated } = useAuthStore();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [showBacktest, setShowBacktest] = useState(false);

  // Create form state
  const [form, setForm] = useState({ name: '', description: '', type: 'BUY_AND_HOLD', fastPeriod: '10', slowPeriod: '50', rsiPeriod: '14', oversold: '30', overbought: '70' });
  // Backtest form
  const [btForm, setBtForm] = useState({ symbol: 'AAPL', fromDate: '2024-01-01', toDate: new Date().toISOString().split('T')[0], initialCapital: '100000' });

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const data = await apiGet<Strategy[]>('/strategies');
      setStrategies(data ?? []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) loadStrategies(); }, [isAuthenticated]);

  const loadBacktests = async (strategyId: string) => {
    try {
      const data = await apiGet<Backtest[]>(`/strategies/${strategyId}/backtests`);
      setBacktests(data ?? []);
    } catch { }
  };

  const handleCreate = async () => {
    const config: Record<string, any> = { type: form.type };
    if (form.type === 'SMA_CROSSOVER') { config.fastPeriod = Number(form.fastPeriod); config.slowPeriod = Number(form.slowPeriod); }
    if (form.type === 'RSI') { config.period = Number(form.rsiPeriod); config.oversold = Number(form.oversold); config.overbought = Number(form.overbought); }

    await apiPost('/strategies', { name: form.name, description: form.description, config });
    setShowCreate(false);
    setForm({ name: '', description: '', type: 'BUY_AND_HOLD', fastPeriod: '10', slowPeriod: '50', rsiPeriod: '14', oversold: '30', overbought: '70' });
    loadStrategies();
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/strategies/${id}`);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
    if (selectedStrategy?.id === id) setSelectedStrategy(null);
  };

  const handleRunBacktest = async () => {
    if (!selectedStrategy) return;
    await apiPost(`/strategies/${selectedStrategy.id}/backtests`, {
      symbol: btForm.symbol.toUpperCase(),
      fromDate: btForm.fromDate,
      toDate: btForm.toDate,
      initialCapital: Number(btForm.initialCapital),
    });
    setShowBacktest(false);
    loadBacktests(selectedStrategy.id);
  };

  const selectStrategy = (s: Strategy) => {
    setSelectedStrategy(s);
    loadBacktests(s.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Strategies</h1>
        <button id="create-strategy-btn" onClick={() => setShowCreate(true)} className="btn-primary px-5">
          + New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Strategy list */}
        <div className="xl:col-span-1 space-y-3">
          {loading && [...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[var(--bg-card)] rounded-xl animate-pulse" />
          ))}
          {!loading && strategies.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">No strategies yet. Create your first strategy to start backtesting.</p>
            </div>
          )}
          {strategies.map((s) => (
            <div key={s.id}
              className={`card p-4 cursor-pointer transition-all duration-200 ${selectedStrategy?.id === s.id ? 'border-brand-500 shadow-glow' : 'hover:border-[var(--border-hover)]'}`}
              onClick={() => selectStrategy(s)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-sm text-[var(--text-primary)]">{s.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.config?.type?.replace('_', ' ')}</div>
                </div>
                <button id={`delete-strategy-${s.id}`} onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                  className="text-[var(--text-muted)] hover:text-danger p-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Strategy detail + backtests */}
        <div className="xl:col-span-2">
          {!selectedStrategy ? (
            <div className="card p-12 text-center text-[var(--text-muted)] text-sm">Select a strategy to view backtests</div>
          ) : (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedStrategy.name}</h2>
                    {selectedStrategy.description && <p className="text-sm text-[var(--text-secondary)] mt-1">{selectedStrategy.description}</p>}
                  </div>
                  <button id="run-backtest-btn" onClick={() => setShowBacktest(true)} className="btn-primary text-sm px-4">
                    ▶ Run Backtest
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedStrategy.config).map(([k, v]) => (
                    <div key={k} className="bg-[var(--bg-hover)] rounded-lg p-3">
                      <div className="text-xs text-[var(--text-muted)]">{k}</div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backtests */}
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Backtest Results</h3>
                </div>
                {backtests.length === 0 ? (
                  <div className="p-8 text-center text-[var(--text-muted)] text-sm">No backtests yet. Run one to see results.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--bg-hover)]">
                          {['Symbol', 'Period', 'Capital', 'Return', 'Win Rate', 'Trades', 'Status'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {backtests.map((bt) => (
                          <tr key={bt.id} className="hover:bg-[var(--bg-hover)]">
                            <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{bt.symbol}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{bt.startDate} → {bt.endDate}</td>
                            <td className="px-4 py-3 tabular-nums text-[var(--text-secondary)]">₹{Number(bt.initialCapital).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3">
                              {bt.totalReturnPct !== undefined ? (
                                <span className={`font-semibold ${bt.totalReturnPct >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {bt.totalReturnPct >= 0 ? '+' : ''}{bt.totalReturnPct.toFixed(2)}%
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">{bt.winRate !== undefined ? `${bt.winRate.toFixed(1)}%` : '—'}</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)]">{bt.totalTrades ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                bt.status === 'COMPLETED' ? 'bg-success/10 text-success'
                                : bt.status === 'FAILED' ? 'bg-danger/10 text-danger'
                                : 'bg-warning/10 text-warning'
                              }`}>{bt.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Strategy modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">New Strategy</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Strategy name</label>
                <input id="strategy-name-input" className="input" placeholder="My SMA Strategy" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {STRATEGY_TYPES.map((t) => (
                    <button key={t.value} id={`strategy-type-${t.value}`}
                      onClick={() => setForm((p) => ({ ...p, type: t.value }))}
                      className={`p-3 rounded-xl text-left text-xs transition-all border ${form.type === t.value ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500/40'}`}>
                      <div className="font-semibold mb-0.5">{t.label}</div>
                      <div className="text-[var(--text-muted)] leading-relaxed">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              {form.type === 'SMA_CROSSOVER' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">Fast period</label>
                    <input className="input" type="number" value={form.fastPeriod} onChange={(e) => setForm((p) => ({ ...p, fastPeriod: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">Slow period</label>
                    <input className="input" type="number" value={form.slowPeriod} onChange={(e) => setForm((p) => ({ ...p, slowPeriod: e.target.value }))} />
                  </div>
                </div>
              )}
              {form.type === 'RSI' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">RSI period</label>
                    <input className="input" type="number" value={form.rsiPeriod} onChange={(e) => setForm((p) => ({ ...p, rsiPeriod: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">Oversold</label>
                    <input className="input" type="number" value={form.oversold} onChange={(e) => setForm((p) => ({ ...p, oversold: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">Overbought</label>
                    <input className="input" type="number" value={form.overbought} onChange={(e) => setForm((p) => ({ ...p, overbought: e.target.value }))} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button id="strategy-cancel-btn" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button id="strategy-save-btn" onClick={handleCreate} disabled={!form.name.trim()} className="btn-primary flex-1">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Run Backtest modal */}
      {showBacktest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowBacktest(false)}>
          <div className="bg-[var(--bg-card)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5">Run Backtest</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Symbol</label>
                <input id="bt-symbol-input" className="input uppercase" value={btForm.symbol} onChange={(e) => setBtForm((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">From date</label>
                  <input id="bt-from-input" type="date" className="input" value={btForm.fromDate} onChange={(e) => setBtForm((p) => ({ ...p, fromDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">To date</label>
                  <input id="bt-to-input" type="date" className="input" value={btForm.toDate} onChange={(e) => setBtForm((p) => ({ ...p, toDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5">Initial capital (₹)</label>
                <input id="bt-capital-input" type="number" className="input" value={btForm.initialCapital} onChange={(e) => setBtForm((p) => ({ ...p, initialCapital: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBacktest(false)} className="btn-secondary flex-1">Cancel</button>
              <button id="bt-run-btn" onClick={handleRunBacktest} className="btn-primary flex-1">▶ Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
