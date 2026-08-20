'use client';

import { useState } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';

export default function QuickTradePanel() {
  const { activePortfolioId, activePortfolio, executeTrade, isTrading, error, clearError } = usePortfolioStore();
  const { fetchQuote } = useMarketStore();

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
    } catch { setQuote(null); }
    finally { setLookingUp(false); }
  };

  const handleTrade = async () => {
    if (!activePortfolioId || !symbol || !shares || Number(shares) <= 0) return;
    clearError();
    setSuccess('');
    try {
      await executeTrade(activePortfolioId, {
        symbol: symbol.toUpperCase(), type: tradeType, shares: Number(shares),
      });
      setSuccess(`${tradeType} order for ${shares} × ${symbol.toUpperCase()} executed!`);
      setSymbol(''); setShares(''); setQuote(null);
    } catch { /* error shown via store */ }
  };

  const estimatedTotal    = quote && shares ? quote.price * Number(shares) : null;
  const cashAvailable     = activePortfolio?.cashBalance ?? 0;
  const insufficientCash  = tradeType === 'BUY' && estimatedTotal !== null && estimatedTotal > cashAvailable;

  const isBuy = tradeType === 'BUY';
  const btnColor  = isBuy ? '#00D395' : '#FF4466';
  const btnBorder = isBuy ? 'rgba(0,211,149,0.3)' : 'rgba(255,68,102,0.3)';

  return (
    <div className="card !p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid #161C2E' }}>
        <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
          Quick Trade
        </h3>
        <span className="live-dot" />
      </div>

      <div className="p-5 space-y-4">
        {/* BUY / SELL toggle */}
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(24,28,46,0.6)' }}>
          {(['BUY', 'SELL'] as const).map(t => (
            <button
              key={t}
              id={`trade-${t.toLowerCase()}-btn`}
              onClick={() => setTradeType(t)}
              className="flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-150"
              style={{
                background: tradeType === t
                  ? t === 'BUY' ? 'rgba(0,211,149,0.15)' : 'rgba(255,68,102,0.15)'
                  : 'transparent',
                color: tradeType === t
                  ? t === 'BUY' ? '#00D395' : '#FF4466'
                  : '#4E5A7A',
                border: tradeType === t
                  ? `1px solid ${t === 'BUY' ? 'rgba(0,211,149,0.3)' : 'rgba(255,68,102,0.3)'}`
                  : '1px solid transparent',
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Symbol */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: '#4E5A7A', letterSpacing: '0.07em' }}>
            SYMBOL
          </label>
          <div className="flex gap-2">
            <input
              id="trade-symbol-input"
              type="text"
              className="input flex-1 uppercase font-mono"
              placeholder="AAPL, MSFT…"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && lookupSymbol()}
            />
            <button
              id="trade-lookup-btn"
              onClick={lookupSymbol}
              disabled={lookingUp || !symbol.trim()}
              className="btn-secondary !px-3 !rounded-xl flex-shrink-0">
              {lookingUp ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
          {quote && (
            <div className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: 'rgba(24,28,46,0.5)', border: '1px solid #161C2E' }}>
              <span className="text-xs" style={{ color: '#8896B3' }}>{quote.name ?? symbol}</span>
              <span className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(quote.price)}
              </span>
            </div>
          )}
        </div>

        {/* Shares */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider block" style={{ color: '#4E5A7A', letterSpacing: '0.07em' }}>
            SHARES
          </label>
          <input
            id="trade-shares-input"
            type="number"
            min="0.0001"
            step="1"
            className="input font-mono"
            placeholder="0"
            value={shares}
            onChange={e => setShares(e.target.value)}
          />
        </div>

        {/* Estimated total */}
        {estimatedTotal !== null && (
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5"
            style={{
              background: insufficientCash ? 'rgba(255,68,102,0.08)' : 'rgba(24,28,46,0.5)',
              border: `1px solid ${insufficientCash ? 'rgba(255,68,102,0.2)' : '#161C2E'}`,
            }}>
            <span className="text-xs" style={{ color: insufficientCash ? '#FF4466' : '#8896B3' }}>
              {insufficientCash ? '⚠ Insufficient cash' : 'Estimated total'}
            </span>
            <span className="text-sm font-bold font-mono" style={{ color: insufficientCash ? '#FF4466' : '#F0F4FF' }}>
              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(estimatedTotal)}
            </span>
          </div>
        )}

        {/* Cash available */}
        <div className="flex justify-between text-xs">
          <span style={{ color: '#4E5A7A' }}>Cash available</span>
          <span className="font-bold font-mono" style={{ color: '#06B6D4' }}>
            ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(cashAvailable)}
          </span>
        </div>

        {/* Feedback */}
        {error && (
          <div className="text-xs rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)', color: '#FF4466' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs rounded-lg px-3 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(0,211,149,0.08)', border: '1px solid rgba(0,211,149,0.2)', color: '#00D395' }}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        {/* Execute button */}
        <button
          id="trade-execute-btn"
          onClick={handleTrade}
          disabled={isTrading || !symbol || !shares || !activePortfolioId || insufficientCash}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isTrading ? `${btnColor}10` : `${btnColor}15`,
            border: `1px solid ${btnBorder}`,
            color: btnColor,
            boxShadow: isTrading ? 'none' : `0 0 16px ${btnColor}15`,
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = `${btnColor}20`; e.currentTarget.style.boxShadow = `0 0 24px ${btnColor}25`; } }}
          onMouseLeave={e => { e.currentTarget.style.background = `${btnColor}15`; e.currentTarget.style.boxShadow = `0 0 16px ${btnColor}15`; }}>
          {isTrading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Executing…
            </span>
          ) : (
            `${tradeType} ${shares || '0'} shares${symbol ? ` of ${symbol}` : ''}`
          )}
        </button>
      </div>
    </div>
  );
}
