import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketNews } from "@/hooks/useMarketNews";
import { useHoldings } from "@/hooks/usePortfolio";
import { Link } from "wouter";

interface MarketNewsProps {
  portfolioId?: number;
}

export default function MarketNews({ portfolioId }: MarketNewsProps) {
  const { data: holdings = [] } = useHoldings(portfolioId);
  const symbols = holdings.map(h => h.symbol);
  const { data: news = [], isLoading } = useMarketNews(symbols.length > 0 ? symbols : undefined, 6);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'bearish':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white">Market News</CardTitle>
        <Link href="/news">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {news.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No market news available</p>
        ) : (
          <div className="space-y-4">
            {news.slice(0, 5).map((article, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight flex-1 mr-2">
                    {article.title}
                  </h4>
                  <Badge className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.source}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTimeAgo(new Date(article.publishedAt))}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => window.open(article.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}