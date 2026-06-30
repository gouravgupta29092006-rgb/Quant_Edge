'use client';

import { useState } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';

export default function QuickTradePanel() {
  const { activePortfolioId, activePortfolio, executeTrade, isTrading, error, clearError } = usePortfolioStore();
  const { fetchQuote, quotes } = useMarketStore();

  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState('');
  const [quote, setQuote] = useState<{ price: number; name?: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [success, setSuccess] = useState('');

  const lookupSymbol = async () => {
    if (!symbol.trim()) return;
    setLookingUp(true);
    setQuote(null);
    try {
      const q = await fetchQuote(symbol.toUpperCase());
      setQuote({ price: q.price, name: q.name });
    } catch {
      setQuote(null);
    } finally {
      setLookingUp(false);
    }
  };

  const handleTrade = async () => {
    if (!activePortfolioId || !symbol || !shares || Number(shares) <= 0) return;
    clearError();
    setSuccess('');
    try {
      await executeTrade(activePortfolioId, {
        symbol: symbol.toUpperCase(),
        type: tradeType,
        shares: Number(shares),
      });
      setSuccess(`${tradeType} order for ${shares} shares of ${symbol.toUpperCase()} executed!`);
      setSymbol('');
      setShares('');
      setQuote(null);
    } catch { /* error shown via store */ }
  };

  const estimatedTotal = quote && shares ? (quote.price * Number(shares)).toFixed(2) : null;
  const cashAvailable = activePortfolio?.cashBalance ?? 0;
  const insufficientCash = tradeType === 'BUY' && estimatedTotal !== null && Number(estimatedTotal) > cashAvailable;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Quick Trade</h3>

      {/* Buy / Sell toggle */}
      <div className="flex rounded-xl overflow-hidden border border-[var(--border)] mb-4 p-1 gap-1">
        <button
          id="trade-buy-btn"
          onClick={() => setTradeType('BUY')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            tradeType === 'BUY' ? 'bg-success text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          BUY
        </button>
        <button
          id="trade-sell-btn"
          onClick={() => setTradeType('SELL')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            tradeType === 'SELL' ? 'bg-danger text-white shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          SELL
        </button>
      </div>

      {/* Symbol lookup */}
      <div className="mb-3">
        <label className="block text-xs text-[var(--text-muted)] mb-1.5">Symbol</label>
        <div className="flex gap-2">
          <input
            id="trade-symbol-input"
            type="text"
            className="input flex-1 uppercase"
            placeholder="AAPL, MSFT…"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && lookupSymbol()}
          />
          <button
            id="trade-lookup-btn"
            onClick={lookupSymbol}
            disabled={lookingUp || !symbol.trim()}
            className="btn-secondary px-3"
          >
            {lookingUp
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            }
          </button>
        </div>
        {quote && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">{quote.name ?? symbol}</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">
              ₹{new Intl.NumberFormat('en-IN').format(quote.price)}
            </span>
          </div>
        )}
      </div>

      {/* Shares */}
      <div className="mb-4">
        <label className="block text-xs text-[var(--text-muted)] mb-1.5">Shares</label>
        <input
          id="trade-shares-input"
          type="number"
          min="0.0001"
          step="1"
          className="input"
          placeholder="Number of shares"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
        />
      </div>

      {/* Estimated total */}
      {estimatedTotal && (
        <div className={`flex items-center justify-between text-xs mb-3 px-3 py-2 rounded-lg ${
          insufficientCash ? 'bg-danger/10 text-danger' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
        }`}>
          <span>Estimated total</span>
          <span className="font-semibold">₹{new Intl.NumberFormat('en-IN').format(Number(estimatedTotal))}</span>
        </div>
      )}

      {/* Cash available */}
      <div className="flex justify-between text-xs text-[var(--text-muted)] mb-4">
        <span>Cash available</span>
        <span>₹{new Intl.NumberFormat('en-IN').format(cashAvailable)}</span>
      </div>

      {/* Feedback */}
      {error && <div className="text-xs text-danger mb-3 bg-danger/10 rounded-lg p-2">{error}</div>}
      {success && <div className="text-xs text-success mb-3 bg-success/10 rounded-lg p-2">{success}</div>}

      {/* Execute button */}
      <button
        id="trade-execute-btn"
        onClick={handleTrade}
        disabled={isTrading || !symbol || !shares || !activePortfolioId || insufficientCash}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          tradeType === 'BUY'
            ? 'bg-success hover:bg-success/80 text-white disabled:opacity-50'
            : 'bg-danger hover:bg-danger/80 text-white disabled:opacity-50'
        }`}
      >
        {isTrading
          ? 'Executing…'
          : `${tradeType} ${shares || '0'} shares${symbol ? ` of ${symbol}` : ''}`}
      </button>
    </div>
  );
}
