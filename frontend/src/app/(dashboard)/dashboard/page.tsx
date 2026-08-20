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
  const { fetchPortfolios } = usePortfolioStore();
  const { indices } = useMarketStore();

  useEffect(() => { fetchPortfolios(); }, []);

  return (
    <div className="page-wrapper">
      {/* Live market ticker */}
      <MarketIndexBar />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioSummaryCard />
          <EquityChart />
          <HoldingsTable />
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <QuickTradePanel />
          <WatchlistWidget />
          <TopMoversCard />
        </div>
      </div>
    </div>
  );
}
