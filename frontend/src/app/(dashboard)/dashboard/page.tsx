'use client';

import { useEffect } from 'react';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { useMarketStore } from '@/stores/marketStore';
import PortfolioSummaryCard from '@/components/dashboard/PortfolioSummaryCard';
import MarketIndexBar from '@/components/dashboard/MarketIndexBar';
import TopMoversCard from '@/components/dashboard/TopMoversCard';
import EquityChart from '@/components/dashboard/EquityChart';
import HoldingsTable from '@/components/dashboard/HoldingsTable';
import QuickTradePanel from '@/components/dashboard/QuickTradePanel';
import WatchlistWidget from '@/components/dashboard/WatchlistWidget';

export default function DashboardPage() {
  const { activePortfolio, fetchPortfolios } = usePortfolioStore();
  const { indices } = useMarketStore();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Market index ticker bar */}
      <MarketIndexBar />

      {/* Main grid: 3 columns on xl, 2 on lg, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Col 1-2: Portfolio summary + equity chart */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSummaryCard />
          <EquityChart />
          <HoldingsTable />
        </div>

        {/* Col 3: Sidebar widgets */}
        <div className="space-y-6">
          <QuickTradePanel />
          <WatchlistWidget />
          <TopMoversCard />
        </div>
      </div>
    </div>
  );
}
