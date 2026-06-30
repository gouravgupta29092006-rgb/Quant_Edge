'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * StoreProvider — initialises all Zustand stores after mount.
 * Fetches: portfolios (and auto-selects default), market indices, movers.
 * Only runs when the user is authenticated.
 */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { fetchPortfolios } = usePortfolioStore();
  const { fetchIndices, fetchMovers } = useMarketStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Parallel bootstrap data fetch
    const init = async () => {
      await Promise.allSettled([
        fetchPortfolios(),
        fetchIndices(),
        fetchMovers(),
      ]);
    };

    init();
  }, [isAuthenticated]);

  return <>{children}</>;
}
