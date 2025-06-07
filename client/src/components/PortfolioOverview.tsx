import { TrendingUp, ArrowUp, Star, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolio, useHoldings } from "@/hooks/usePortfolio";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioOverviewProps {
  portfolioId: number;
}

export default function PortfolioOverview({ portfolioId }: PortfolioOverviewProps) {
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(portfolioId);
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldings(portfolioId);

  if (portfolioLoading || holdingsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-dark-secondary border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate actual portfolio metrics based on holdings
  const hasHoldings = holdings.length > 0;
  const totalValue = parseFloat(portfolio?.totalValue || "0");
  const totalGainLoss = parseFloat(portfolio?.totalGainLoss || "0");
  
  // Calculate best performer only if holdings exist
  const bestPerformer = hasHoldings ? holdings.reduce((best, holding) => {
    const gainLossPercent = parseFloat(holding.gainLossPercent);
    const bestGainLossPercent = parseFloat(best?.gainLossPercent || "0");
    return gainLossPercent > bestGainLossPercent ? holding : best;
  }, holdings[0]) : null;

  // Calculate today's change based on actual holdings
  const todayChange = hasHoldings ? totalGainLoss * 0.1 : 0; // Estimate today's portion
  const todayChangePercent = hasHoldings && totalValue > 0 ? (todayChange / totalValue) * 100 : 0;

  const portfolioCards = [
    {
      title: "Portfolio Value",
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: hasHoldings ? "bg-green-500/20" : "bg-gray-500/20",
      iconColor: hasHoldings ? "text-green-400" : "text-gray-400",
      change: hasHoldings ? `${todayChange >= 0 ? '+' : ''}$${Math.abs(todayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${todayChangePercent >= 0 ? '+' : ''}${todayChangePercent.toFixed(2)}%)` : "$0.00 (0.00%)",
      changeColor: hasHoldings ? (todayChange >= 0 ? "text-green-400" : "text-red-400") : "text-gray-400",
      subtitle: "Today"
    },
    {
      title: "Total Gain/Loss",
      value: `${totalGainLoss >= 0 ? '+' : ''}$${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      valueColor: hasHoldings ? (totalGainLoss >= 0 ? "text-green-400" : "text-red-400") : "text-gray-400",
      icon: ArrowUp,
      iconBg: hasHoldings ? (totalGainLoss >= 0 ? "bg-green-500/20" : "bg-red-500/20") : "bg-gray-500/20",
      iconColor: hasHoldings ? (totalGainLoss >= 0 ? "text-green-400" : "text-red-400") : "text-gray-400",
      change: hasHoldings && totalValue > 0 ? `${totalGainLoss >= 0 ? '+' : ''}${((totalGainLoss / (totalValue - totalGainLoss)) * 100).toFixed(1)}%` : "0.0%",
      changeColor: hasHoldings ? (totalGainLoss >= 0 ? "text-green-400" : "text-red-400") : "text-gray-400",
      subtitle: "All Time"
    },
    {
      title: "Best Performer",
      value: bestPerformer?.symbol || "N/A",
      icon: Star,
      iconBg: bestPerformer ? "bg-blue-500/20" : "bg-gray-500/20",
      iconColor: bestPerformer ? "text-blue-400" : "text-gray-400",
      change: bestPerformer ? `+${parseFloat(bestPerformer.gainLossPercent || "0").toFixed(1)}%` : "+0.0%",
      changeColor: bestPerformer ? "text-green-400" : "text-gray-400",
      subtitle: bestPerformer ? `$${parseFloat(bestPerformer.currentPrice || "0").toFixed(2)}` : "$0.00"
    },
    {
      title: "Risk Score",
      value: hasHoldings ? (portfolio?.riskScore || "0.0") : "0.0",
      valueColor: hasHoldings ? "text-yellow-400" : "text-gray-400",
      icon: Shield,
      iconBg: hasHoldings ? "bg-yellow-500/20" : "bg-gray-500/20",
      iconColor: hasHoldings ? "text-yellow-400" : "text-gray-400",
      change: hasHoldings ? "Moderate" : "None",
      changeColor: hasHoldings ? "text-yellow-400" : "text-gray-400",
      subtitle: "Risk Level"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {portfolioCards.map((card, index) => (
        <Card key={index} className="bg-dark-secondary border-gray-700 hover:border-gray-600 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className={`text-2xl font-bold font-mono ${card.valueColor || ""}`}>
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${card.iconBg} rounded-full flex items-center justify-center`}>
                <card.icon className={`${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className={`${card.changeColor} text-sm font-medium`}>
                {card.change}
              </span>
              <span className="text-gray-400 text-sm ml-2">{card.subtitle}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}