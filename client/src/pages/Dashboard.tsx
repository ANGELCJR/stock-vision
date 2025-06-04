import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioOverview from "@/components/PortfolioOverview";
import PerformanceChart from "@/components/PerformanceChart";
import HoldingsTable from "@/components/HoldingsTable";
import AIInsights from "@/components/AIInsights";
import MarketNews from "@/components/MarketNews";
import QuickActions from "@/components/QuickActions";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useGenerateAIInsights } from "@/hooks/useAIInsights";

export default function Dashboard() {
  const { data: portfolio } = usePortfolio(1);
  const generateInsights = useGenerateAIInsights();

  // Generate AI insights when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      generateInsights.mutate(1);
    }, 2000); // Wait 2 seconds after mount

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Cards */}
        <PortfolioOverview portfolioId={1} />

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Charts and Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Stock Chart */}
            <PerformanceChart portfolioId={1} />

            {/* Holdings Table */}
            <HoldingsTable portfolioId={1} />
          </div>

          {/* Right Column - AI Insights and News */}
          <div className="space-y-8">
            {/* AI-Powered Insights */}
            <AIInsights portfolioId={1} />

            {/* Market News with Sentiment */}
            <MarketNews portfolioId={1} />

            {/* Quick Actions */}
            <QuickActions portfolioId={1} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
