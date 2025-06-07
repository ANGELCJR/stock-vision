import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioOverview from "@/components/PortfolioOverview";
import PerformanceChart from "@/components/PerformanceChart";
import HoldingsTable from "@/components/HoldingsTable";
import MarketNews from "@/components/MarketNews";
import QuickActions from "@/components/QuickActions";
import { usePortfolio } from "@/hooks/usePortfolio";

export default function Dashboard() {
  const { data: portfolio } = usePortfolio(1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Portfolio Overview Cards */}
        <PortfolioOverview portfolioId={1} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6 lg:mt-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Interactive Stock Chart */}
            <PerformanceChart portfolioId={1} />

            {/* Holdings Table */}
            <HoldingsTable portfolioId={1} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <QuickActions portfolioId={1} />

            {/* Market News Widget */}
            <MarketNews portfolioId={1} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}