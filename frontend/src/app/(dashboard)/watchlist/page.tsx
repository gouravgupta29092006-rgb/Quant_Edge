'use client';

import WatchlistWidget from '@/components/dashboard/WatchlistWidget';
import { useMarketStore } from '@/stores/marketStore';

export default function WatchlistPage() {
  const { quotes } = useMarketStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Watchlist</h1>
      <div className="max-w-2xl">
        <WatchlistWidget />
      </div>
    </div>
  );
}
