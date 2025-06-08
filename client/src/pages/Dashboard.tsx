import { useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioOverview from "@/components/PortfolioOverview";
import PerformanceChart from "@/components/PerformanceChart";
import HoldingsTable from "@/components/HoldingsTable";
import MarketNews from "@/components/MarketNews";
import QuickActions from "@/components/QuickActions";

export default function Dashboard() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Portfolio Overview Cards */}
        <PortfolioOverview />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Stock Chart */}
            <PerformanceChart />

            {/* Holdings Table */}
            <HoldingsTable />
          </div>

          {/* Right Column - News and Quick Actions */}
          <div className="space-y-8">
            {/* Market News with Sentiment */}
            <MarketNews />

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}