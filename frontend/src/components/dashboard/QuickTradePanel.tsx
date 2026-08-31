'use client';

import { useState } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore }    from '@/stores/marketStore';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

export default function QuickTradePanel() {
  const { activePortfolioId, activePortfolio, executeTrade, isTrading, error, clearError } = usePortfolioStore();
  const { fetchQuote } = useMarketStore();

  const [symbol,    setSymbol]    = useState('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares,    setShares]    = useState('');
  const [quote,     setQuote]     = useState<{ price: number; name?: string } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [success,   setSuccess]   = useState('');
  const shouldReduce = useReducedMotion();

  const isBuy = tradeType === 'BUY';

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
      setTimeout(() => setSuccess(''), 5000);
    } catch { /* error shown via store */ }
  };

  const estimatedTotal   = quote && shares ? quote.price * Number(shares) : null;
  const cashAvailable    = activePortfolio?.cashBalance ?? 0;
  const insufficientCash = isBuy && estimatedTotal !== null && estimatedTotal > cashAvailable;

  const tradeColor = isBuy ? 'rgba(34,197,94,1)' : 'rgba(239,68,68,1)';
  const tradeLight = isBuy ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';
  const tradeBorder = isBuy ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';

  return (
    <motion.div
      className="card !p-0 overflow-hidden"
      initial={shouldReduce ? undefined : { opacity: 0, y: 14 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.04 }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Quick Trade</h3>
        <span className="live-dot" />
      </div>

      <div className="p-5 space-y-4">
        {/* BUY / SELL toggle */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-bg-secondary">
          {(['BUY', 'SELL'] as const).map(t => (
            <motion.button
              key={t}
              id={`trade-${t.toLowerCase()}-btn`}
              onClick={() => { setTradeType(t); clearError(); setSuccess(''); }}
              className={cn(
                'relative flex-1 py-2 text-sm font-bold rounded-lg transition-colors',
                tradeType === t
                  ? t === 'BUY' ? 'text-success' : 'text-danger'
                  : 'text-text-muted hover:text-text-secondary',
              )}
              whileTap={shouldReduce ? {} : { scale: 0.95 }}
            >
              {tradeType === t && (
                <motion.span
                  layoutId="trade-toggle-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: tradeLight, border: `1px solid ${tradeBorder}` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{t}</span>
            </motion.button>
          ))}
        </div>

        {/* Symbol */}
        <div className="space-y-1.5">
          <label className="metric-label block">Symbol</label>
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
            <motion.button
              id="trade-lookup-btn"
              onClick={lookupSymbol}
              disabled={lookingUp || !symbol.trim()}
              className="btn-secondary !px-3 !rounded-xl flex-shrink-0"
              whileTap={shouldReduce ? {} : { scale: 0.92 }}
            >
              {lookingUp ? (
                <motion.span
                  className="w-4 h-4 rounded-full border-2 border-current border-t-transparent block"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between rounded-xl px-3 py-2 overflow-hidden bg-bg-hover border border-border-light"
              >
                <span className="text-xs text-text-secondary">{quote.name ?? symbol}</span>
                <span className="text-sm font-bold font-mono text-text-primary">{fmtMoney(quote.price)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shares */}
        <div className="space-y-1.5">
          <label className="metric-label block">Shares</label>
          <input
            id="trade-shares-input"
            type="number" min="0.0001" step="1"
            className="input font-mono"
            placeholder="0"
            value={shares}
            onChange={e => setShares(e.target.value)}
          />
        </div>

        {/* Estimated total */}
        <AnimatePresence>
          {estimatedTotal !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 border overflow-hidden',
                insufficientCash
                  ? 'bg-danger/8 border-danger/20'
                  : 'bg-bg-hover border-border-light',
              )}
            >
              <span className={cn('text-xs', insufficientCash ? 'text-danger' : 'text-text-secondary')}>
                {insufficientCash ? '⚠ Insufficient cash' : 'Estimated total'}
              </span>
              <span className={cn('text-sm font-bold font-mono', insufficientCash ? 'text-danger' : 'text-text-primary')}>
                {fmtMoney(estimatedTotal)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cash available */}
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Cash available</span>
          <span className="font-bold font-mono text-accent">{fmtMoney(cashAvailable)}</span>
        </div>

        {/* Feedback banners */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-xs rounded-xl px-3 py-2.5 bg-danger/8 border border-danger/20 text-danger"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-xs rounded-xl px-3 py-2.5 flex items-center gap-2 bg-success/8 border border-success/20 text-success"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Execute button */}
        <motion.button
          id="trade-execute-btn"
          onClick={handleTrade}
          disabled={isTrading || !symbol || !shares || !activePortfolioId || insufficientCash}
          className="w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isTrading ? tradeLight : tradeLight,
            border:     `1px solid ${tradeBorder}`,
            color:      tradeColor,
            boxShadow:  !isTrading ? `0 0 20px ${tradeLight}` : 'none',
          }}
          whileHover={shouldReduce ? {} : { scale: 1.02 }}
          whileTap={shouldReduce ? {} : { scale: 0.97 }}
        >
          {isTrading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="w-4 h-4 rounded-full border-2 border-current border-t-transparent block"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
              Executing…
            </span>
          ) : (
            `${tradeType} ${shares || '0'} shares${symbol ? ` of ${symbol}` : ''}`
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
