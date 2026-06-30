/**
 * Market data Zustand store.
 * Real-time quotes via WebSocket + REST batch fetching.
 */
import { create } from 'zustand';
import { apiGet, apiPost } from '@/lib/api';

export interface Quote {
  symbol: string;
  name?: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  direction: 'up' | 'down' | 'flat';
  volume?: number;
  marketCap?: number;
  updatedAt: string;
  // Intraday
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
}

interface MarketState {
  quotes: Record<string, Quote>;     // keyed by symbol
  indices: Quote[];
  movers: { gainers: Quote[]; losers: Quote[] };
  watchedSymbols: string[];
  isConnected: boolean;

  // Actions
  fetchQuote: (symbol: string) => Promise<Quote>;
  fetchBatchQuotes: (symbols: string[]) => Promise<void>;
  fetchIndices: () => Promise<void>;
  fetchMovers: () => Promise<void>;
  updateQuote: (quote: Quote) => void;  // called by WebSocket
  addWatched: (symbol: string) => void;
  removeWatched: (symbol: string) => void;
  setConnected: (v: boolean) => void;
}

export const useMarketStore = create<MarketState>()((set, get) => ({
  quotes: {},
  indices: [],
  movers: { gainers: [], losers: [] },
  watchedSymbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'],
  isConnected: false,

  fetchQuote: async (symbol) => {
    const quote = await apiGet<Quote>(`/market/quote/${symbol}`);
    set((s) => ({ quotes: { ...s.quotes, [symbol]: quote } }));
    return quote;
  },

  fetchBatchQuotes: async (symbols) => {
    if (!symbols.length) return;
    const quotes = await apiPost<Quote[]>('/market/quotes/batch', { symbols });
    const map: Record<string, Quote> = {};
    quotes.forEach((q) => (map[q.symbol] = q));
    set((s) => ({ quotes: { ...s.quotes, ...map } }));
  },

  fetchIndices: async () => {
    const indices = await apiGet<Quote[]>('/market/indices');
    set({ indices });
  },

  fetchMovers: async () => {
    const movers = await apiGet<{ gainers: Quote[]; losers: Quote[] }>('/market/movers');
    set({ movers });
  },

  updateQuote: (quote) =>
    set((s) => ({ quotes: { ...s.quotes, [quote.symbol]: quote } })),

  addWatched: (symbol) =>
    set((s) => ({
      watchedSymbols: s.watchedSymbols.includes(symbol)
        ? s.watchedSymbols
        : [...s.watchedSymbols, symbol],
    })),

  removeWatched: (symbol) =>
    set((s) => ({ watchedSymbols: s.watchedSymbols.filter((s) => s !== symbol) })),

  setConnected: (v) => set({ isConnected: v }),
}));
