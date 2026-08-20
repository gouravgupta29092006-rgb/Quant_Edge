'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Strategy {
  id: string; name: string; description?: string;
  config: Record<string, any>; createdAt: string;
}
interface Backtest {
  id: string; symbol: string; status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalReturnPct?: number; winRate?: number; totalTrades?: number;
  startDate: string; endDate: string; initialCapital: number; createdAt: string;
}

const STRATEGY_TYPES = [
  { value: 'BUY_AND_HOLD',  label: 'Buy & Hold',     desc: 'Simple benchmark — hold to end date' },
  { value: 'SMA_CROSSOVER', label: 'SMA Crossover',   desc: 'Golden/Death cross using MAs' },
  { value: 'RSI',           label: 'RSI Strategy',    desc: 'Mean reversion with RSI levels' },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    COMPLETED: { bg: 'rgba(0,211,149,0.1)', color: '#00D395', border: 'rgba(0,211,149,0.2)' },
    FAILED:    { bg: 'rgba(255,68,102,0.1)', color: '#FF4466', border: 'rgba(255,68,102,0.2)' },
    RUNNING:   { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)' },
    QUEUED:    { bg: 'rgba(99,102,241,0.1)', color: '#818CF8', border: 'rgba(99,102,241,0.2)' },
  };
  const s = styles[status] ?? styles.QUEUED;
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,6,10,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="card p-6 w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function StrategiesPage() {
  const { isAuthenticated } = useAuthStore();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [backtests, setBacktests] = useState<Backtest[]>([]);
  const [showBacktest, setShowBacktest] = useState(false);

  const [form, setForm] = useState({ name: '', description: '', type: 'BUY_AND_HOLD', fastPeriod: '10', slowPeriod: '50', rsiPeriod: '14', oversold: '30', overbought: '70' });
  const [btForm, setBtForm] = useState({ symbol: 'AAPL', fromDate: '2024-01-01', toDate: new Date().toISOString().split('T')[0], initialCapital: '100000' });

  const loadStrategies = async () => {
    setLoading(true);
    try { const data = await apiGet<Strategy[]>('/strategies'); setStrategies(data ?? []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) loadStrategies(); }, [isAuthenticated]);

  const loadBacktests = async (id: string) => {
    try { const data = await apiGet<Backtest[]>(`/strategies/${id}/backtests`); setBacktests(data ?? []); }
    catch {}
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
    setStrategies(prev => prev.filter(s => s.id !== id));
    if (selectedStrategy?.id === id) setSelectedStrategy(null);
  };

  const handleRunBacktest = async () => {
    if (!selectedStrategy) return;
    await apiPost(`/strategies/${selectedStrategy.id}/backtests`, {
      symbol: btForm.symbol.toUpperCase(),
      fromDate: btForm.fromDate, toDate: btForm.toDate,
      initialCapital: Number(btForm.initialCapital),
    });
    setShowBacktest(false);
    loadBacktests(selectedStrategy.id);
  };

  const selectStrategy = (s: Strategy) => { setSelectedStrategy(s); loadBacktests(s.id); };

  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setBt = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setBtForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page-wrapper">
      <div className="flex items-center justify-between">
        <div />
        <button id="create-strategy-btn" onClick={() => setShowCreate(true)} className="btn-primary px-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Strategy list */}
        <div className="space-y-3">
          {loading && [...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          {!loading && strategies.length === 0 && (
            <div className="card p-8 text-center space-y-2">
              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm" style={{ color: '#4E5A7A' }}>No strategies yet</p>
              <p className="text-xs" style={{ color: '#2D3A5E' }}>Create one to start backtesting</p>
            </div>
          )}
          {strategies.map(s => {
            const isSelected = selectedStrategy?.id === s.id;
            return (
              <div key={s.id}
                className="card cursor-pointer transition-all duration-200 !p-4"
                style={{ borderColor: isSelected ? 'rgba(99,102,241,0.4)' : undefined, boxShadow: isSelected ? '0 0 20px rgba(99,102,241,0.08)' : undefined }}
                onClick={() => selectStrategy(s)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(24,28,46,0.7)', border: '1px solid #1F2744' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={isSelected ? '#818CF8' : '#4E5A7A'} strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#F0F4FF' }}>{s.name}</div>
                      <div className="text-xs" style={{ color: '#4E5A7A' }}>{s.config?.type?.replace(/_/g, ' ')}</div>
                    </div>
                  </div>
                  <button id={`delete-strategy-${s.id}`}
                    onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                    className="p-1 rounded-lg transition-all duration-150"
                    style={{ color: '#2D3A5E' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FF4466'; e.currentTarget.style.background = 'rgba(255,68,102,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#2D3A5E'; e.currentTarget.style.background = 'transparent'; }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail + backtests */}
        <div className="xl:col-span-2 space-y-5">
          {!selectedStrategy ? (
            <div className="card p-12 text-center space-y-2">
              <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="#2D3A5E" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-sm" style={{ color: '#4E5A7A' }}>Select a strategy to view backtest results</p>
            </div>
          ) : (
            <>
              {/* Strategy config card */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>{selectedStrategy.name}</h2>
                    {selectedStrategy.description && <p className="text-sm" style={{ color: '#8896B3' }}>{selectedStrategy.description}</p>}
                  </div>
                  <button id="run-backtest-btn" onClick={() => setShowBacktest(true)} className="btn-primary text-sm px-4">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Run Backtest
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(selectedStrategy.config).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-xl" style={{ background: 'rgba(24,28,46,0.5)', border: '1px solid #161C2E' }}>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#4E5A7A', letterSpacing: '0.06em' }}>{k}</div>
                      <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backtests table */}
              <div className="card !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #161C2E' }}>
                  <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Backtest Results</h3>
                  <span className="badge-brand">{backtests.length} run{backtests.length !== 1 ? 's' : ''}</span>
                </div>
                {backtests.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm" style={{ color: '#4E5A7A' }}>No backtests yet. Click "Run Backtest" to start.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'rgba(24,28,46,0.4)', borderBottom: '1px solid #161C2E' }}>
                          {['Symbol', 'Period', 'Capital', 'Return', 'Win Rate', 'Trades', 'Status'].map(h => (
                            <th key={h} className="table-header-cell">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {backtests.map(bt => (
                          <tr key={bt.id} className="table-row">
                            <td className="table-cell font-bold font-mono">{bt.symbol}</td>
                            <td className="table-cell !text-xs" style={{ color: '#4E5A7A' }}>{bt.startDate} → {bt.endDate}</td>
                            <td className="table-cell tabular-nums font-mono" style={{ color: '#8896B3' }}>${Number(bt.initialCapital).toLocaleString('en-US')}</td>
                            <td className="table-cell">
                              {bt.totalReturnPct !== undefined ? (
                                <span className="font-bold font-mono" style={{ color: bt.totalReturnPct >= 0 ? '#00D395' : '#FF4466' }}>
                                  {bt.totalReturnPct >= 0 ? '+' : ''}{bt.totalReturnPct.toFixed(2)}%
                                </span>
                              ) : '—'}
                            </td>
                            <td className="table-cell tabular-nums font-mono" style={{ color: '#8896B3' }}>{bt.winRate !== undefined ? `${bt.winRate.toFixed(1)}%` : '—'}</td>
                            <td className="table-cell tabular-nums font-mono" style={{ color: '#8896B3' }}>{bt.totalTrades ?? '—'}</td>
                            <td className="table-cell"><StatusBadge status={bt.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>New Strategy</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>STRATEGY NAME</label>
              <input id="strategy-name-input" className="input" placeholder="My SMA Strategy" value={form.name} onChange={setF('name')} />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: '#4E5A7A' }}>TYPE</label>
              <div className="grid grid-cols-3 gap-2">
                {STRATEGY_TYPES.map(t => (
                  <button key={t.value} id={`strategy-type-${t.value}`}
                    onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    className="p-3 rounded-xl text-left text-xs transition-all duration-150"
                    style={{
                      background: form.type === t.value ? 'rgba(99,102,241,0.12)' : 'rgba(24,28,46,0.4)',
                      border: form.type === t.value ? '1px solid rgba(99,102,241,0.4)' : '1px solid #161C2E',
                      color: form.type === t.value ? '#818CF8' : '#8896B3',
                    }}>
                    <div className="font-bold mb-0.5" style={{ color: form.type === t.value ? '#818CF8' : '#F0F4FF' }}>{t.label}</div>
                    <div className="leading-relaxed" style={{ color: '#4E5A7A' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {form.type === 'SMA_CROSSOVER' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>FAST PERIOD</label><input className="input" type="number" value={form.fastPeriod} onChange={setF('fastPeriod')} /></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>SLOW PERIOD</label><input className="input" type="number" value={form.slowPeriod} onChange={setF('slowPeriod')} /></div>
              </div>
            )}
            {form.type === 'RSI' && (
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>RSI PERIOD</label><input className="input" type="number" value={form.rsiPeriod} onChange={setF('rsiPeriod')} /></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>OVERSOLD</label><input className="input" type="number" value={form.oversold} onChange={setF('oversold')} /></div>
                <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>OVERBOUGHT</label><input className="input" type="number" value={form.overbought} onChange={setF('overbought')} /></div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button id="strategy-cancel-btn" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="strategy-save-btn" onClick={handleCreate} disabled={!form.name.trim()} className="btn-primary flex-1">Create Strategy</button>
          </div>
        </Modal>
      )}

      {/* Backtest modal */}
      {showBacktest && (
        <Modal onClose={() => setShowBacktest(false)}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>Run Backtest</h2>
          <div className="space-y-4">
            <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>SYMBOL</label><input id="bt-symbol-input" className="input uppercase font-mono" value={btForm.symbol} onChange={setBt('symbol')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>FROM DATE</label><input id="bt-from-input" type="date" className="input" value={btForm.fromDate} onChange={setBt('fromDate')} /></div>
              <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>TO DATE</label><input id="bt-to-input" type="date" className="input" value={btForm.toDate} onChange={setBt('toDate')} /></div>
            </div>
            <div><label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#4E5A7A' }}>INITIAL CAPITAL ($)</label><input id="bt-capital-input" type="number" className="input font-mono" value={btForm.initialCapital} onChange={setBt('initialCapital')} /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowBacktest(false)} className="btn-secondary flex-1">Cancel</button>
            <button id="bt-run-btn" onClick={handleRunBacktest} className="btn-primary flex-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Run
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
