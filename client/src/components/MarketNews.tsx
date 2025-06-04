import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketNews } from "@/hooks/useMarketNews";
import { useHoldings } from "@/hooks/usePortfolio";

interface MarketNewsProps {
  portfolioId: number;
}

export default function MarketNews({ portfolioId }: MarketNewsProps) {
  const { data: holdings = [] } = useHoldings(portfolioId);
  const symbols = holdings.map(h => h.symbol);
  const { data: news = [], isLoading } = useMarketNews(symbols, 10);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400';
      case 'bearish':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Market News</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-b border-gray-800 pb-4">
                <Skeleton className="h-20 w-full bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Market News</CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((article) => (
              <div key={article.id} className="border-b border-gray-800 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  {/* Placeholder for news image */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs font-bold">📰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={`${getSentimentColor(article.sentiment)} text-xs capitalize`}>
                        {article.sentiment}
                      </Badge>
                      <span className="text-gray-400 text-xs">
                        {formatTimeAgo(new Date(article.publishedAt))}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-white mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {article.relevantSymbols && article.relevantSymbols.length > 0 && (
                          <>
                            <span className="text-xs text-gray-500">Relevance:</span>
                            <div className="flex space-x-1">
                              {article.relevantSymbols.slice(0, 3).map((symbol) => (
                                <Badge key={symbol} variant="outline" className="text-xs px-1 py-0.5 text-blue-400 border-blue-500/30">
                                  {symbol}
                                </Badge>
                              ))}
                              {article.relevantSymbols.length > 3 && (
                                <span className="text-xs text-gray-400">+{article.relevantSymbols.length - 3}</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-400 hover:text-white p-1 h-auto"
                      >
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">{article.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No market news available at the moment.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
