/**
 * Portfolio Zustand store.
 * Manages all portfolio data, holdings, and trade state.
 */
import { create } from 'zustand';
import { apiGet, apiPost, apiDelete } from '@/lib/api';

export interface Holding {
  id: string;
  symbol: string;
  shares: number;
  averageCost: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPct?: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  cashBalance: number;
  initialCapital: number;
  isDefault: boolean;
  createdAt: string;
}

export interface PortfolioWithValues extends Portfolio {
  holdings: Holding[];
  totalValue: number;
  holdingsValue: number;
  totalReturn: number;
  totalReturnPct: number;
}

export interface TradeData {
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  limitPrice?: number;
  notes?: string;
}

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolio: PortfolioWithValues | null;
  activePortfolioId: string | null;
  isLoading: boolean;
  isTrading: boolean;
  error: string | null;

  // Actions
  fetchPortfolios: () => Promise<void>;
  fetchPortfolio: (id: string) => Promise<void>;
  createPortfolio: (name: string, initialCapital: number, description?: string) => Promise<Portfolio>;
  deletePortfolio: (id: string) => Promise<void>;
  executeTrade: (portfolioId: string, trade: TradeData) => Promise<void>;
  setActivePortfolioId: (id: string) => void;
  clearError: () => void;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  portfolios: [],
  activePortfolio: null,
  activePortfolioId: null,
  isLoading: false,
  isTrading: false,
  error: null,

  fetchPortfolios: async () => {
    set({ isLoading: true, error: null });
    try {
      const portfolios = await apiGet<Portfolio[]>('/portfolios');
      set({ portfolios, isLoading: false });
      // Auto-select first portfolio
      if (portfolios.length > 0 && !get().activePortfolioId) {
        const defaultP = portfolios.find((p) => p.isDefault) || portfolios[0];
        set({ activePortfolioId: defaultP.id });
        get().fetchPortfolio(defaultP.id);
      }
    } catch (err: any) {
      set({ error: 'Failed to load portfolios.', isLoading: false });
    }
  },

  fetchPortfolio: async (id) => {
    set({ isLoading: true });
    try {
      const data = await apiGet<PortfolioWithValues>(`/portfolios/${id}`);
      set({ activePortfolio: data, isLoading: false });
    } catch {
      set({ error: 'Failed to load portfolio.', isLoading: false });
    }
  },

  createPortfolio: async (name, initialCapital, description) => {
    set({ isLoading: true, error: null });
    try {
      const portfolio = await apiPost<Portfolio>('/portfolios', { name, initialCapital, description });
      set((s) => ({ portfolios: [...s.portfolios, portfolio], isLoading: false }));
      return portfolio;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create portfolio.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  deletePortfolio: async (id) => {
    await apiDelete(`/portfolios/${id}`);
    set((s) => ({
      portfolios: s.portfolios.filter((p) => p.id !== id),
      activePortfolio: s.activePortfolio?.id === id ? null : s.activePortfolio,
      activePortfolioId: s.activePortfolioId === id ? null : s.activePortfolioId,
    }));
  },

  executeTrade: async (portfolioId, trade) => {
    set({ isTrading: true, error: null });
    try {
      await apiPost(`/portfolios/${portfolioId}/trade`, trade);
      // Refresh portfolio after trade
      await get().fetchPortfolio(portfolioId);
      set({ isTrading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Trade failed. Please try again.';
      set({ error: msg, isTrading: false });
      throw err;
    }
  },

  setActivePortfolioId: (id) => {
    set({ activePortfolioId: id });
    get().fetchPortfolio(id);
  },

  clearError: () => set({ error: null }),
}));
