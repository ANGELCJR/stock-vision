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

  // Calculate best performer
  const bestPerformer = holdings.reduce((best, holding) => {
    const gainLossPercent = parseFloat(holding.gainLossPercent);
    const bestGainLossPercent = parseFloat(best?.gainLossPercent || "0");
    return gainLossPercent > bestGainLossPercent ? holding : best;
  }, holdings[0]);

  // Calculate today's change (mock calculation)
  const totalValue = parseFloat(portfolio?.totalValue || "0");
  const todayChange = totalValue * 0.0228; // Mock 2.28% gain today
  const todayChangePercent = 2.28;

  const portfolioCards = [
    {
      title: "Portfolio Value",
      value: `$${parseFloat(portfolio?.totalValue || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      change: `+$${todayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (+${todayChangePercent}%)`,
      changeColor: "text-green-400",
      subtitle: "Today"
    },
    {
      title: "Total Gain/Loss",
      value: `+$${parseFloat(portfolio?.totalGainLoss || "0").toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      valueColor: "text-green-400",
      icon: ArrowUp,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      change: "+17.4%",
      changeColor: "text-green-400",
      subtitle: "All Time"
    },
    {
      title: "Best Performer",
      value: bestPerformer?.symbol || "N/A",
      icon: Star,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      change: `+${parseFloat(bestPerformer?.gainLossPercent || "0").toFixed(1)}%`,
      changeColor: "text-green-400",
      subtitle: `$${parseFloat(bestPerformer?.currentPrice || "0").toFixed(2)}`
    },
    {
      title: "Risk Score",
      value: portfolio?.riskScore || "0.0",
      valueColor: "text-yellow-400",
      icon: Shield,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      change: "Moderate",
      changeColor: "text-yellow-400",
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
