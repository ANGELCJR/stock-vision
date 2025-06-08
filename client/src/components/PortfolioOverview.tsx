import { TrendingUp, ArrowUp, Star, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolio, useHoldings } from "@/hooks/usePortfolio";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioOverviewProps {
  portfolioId?: number;
}

export default function PortfolioOverview({ portfolioId }: PortfolioOverviewProps) {
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(portfolioId);
  const { data: holdings = [], isLoading: holdingsLoading } = useHoldings(portfolioId);

  if (portfolioLoading || holdingsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full bg-gray-200 dark:bg-gray-700" />
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
  const gainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
  const riskScore = portfolio?.riskScore || 0;

  const cards = [
    {
      title: "Portfolio Value",
      value: hasHoldings ? `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      change: hasHoldings ? `${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%` : "+0.00%",
      icon: TrendingUp,
      positive: gainLossPercent >= 0,
      color: "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
    },
    {
      title: "Total Gain/Loss",
      value: hasHoldings ? `${totalGainLoss >= 0 ? '+' : ''}$${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      change: hasHoldings ? `${holdings.length} positions` : "0 positions",
      icon: ArrowUp,
      positive: totalGainLoss >= 0,
      color: "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
    },
    {
      title: "Holdings",
      value: hasHoldings ? `${holdings.length}` : "0",
      change: hasHoldings ? "Active stocks" : "No stocks",
      icon: Star,
      positive: true,
      color: "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700"
    },
    {
      title: "Risk Score",
      value: hasHoldings ? `${riskScore.toFixed(1)}/10` : "0.0/10",
      change: hasHoldings ? (riskScore <= 3 ? "Low Risk" : riskScore <= 7 ? "Medium Risk" : "High Risk") : "No Risk",
      icon: Shield,
      positive: riskScore <= 5,
      color: "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                card.positive 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {card.change}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}