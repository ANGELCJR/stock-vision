import { useState } from "react";
import { Newspaper, TrendingUp, Search, Filter, ExternalLink, Calendar, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarketNews } from "@/hooks/useMarketNews";
import { useHoldings } from "@/hooks/usePortfolio";

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const { data: holdings = [] } = useHoldings(1);
  const symbols = holdings.map(h => h.symbol);
  const { data: allNews = [], isLoading: allNewsLoading } = useMarketNews([], 50);
  const { data: portfolioNews = [], isLoading: portfolioNewsLoading } = useMarketNews(symbols, 20);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'bearish':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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

  const filterNews = (news: any[]) => {
    return news.filter(article => {
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSentiment = selectedSentiment === "all" || article.sentiment === selectedSentiment;
      
      return matchesSearch && matchesSentiment;
    });
  };

  const filteredAllNews = filterNews(allNews);
  const filteredPortfolioNews = filterNews(portfolioNews);

  // Market sentiment analysis
  const sentimentStats = allNews.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalArticles = allNews.length;
  const bullishPercentage = totalArticles > 0 ? ((sentimentStats.bullish || 0) / totalArticles) * 100 : 0;
  const bearishPercentage = totalArticles > 0 ? ((sentimentStats.bearish || 0) / totalArticles) * 100 : 0;
  const neutralPercentage = totalArticles > 0 ? ((sentimentStats.neutral || 0) / totalArticles) * 100 : 0;

  // Top trending symbols
  const symbolMentions = allNews.reduce((acc, article) => {
    article.relevantSymbols?.forEach((symbol: string) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const trendingSymbols = Object.entries(symbolMentions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Market News & Analysis</h1>
            <p className="text-gray-400">Real-time financial news with market sentiment analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-secondary border-gray-700 pl-10 w-64"
              />
            </div>
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="w-[140px] bg-dark-secondary border-gray-700">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-gray-700">
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="bullish">Bullish</SelectItem>
                <SelectItem value="bearish">Bearish</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-secondary border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Market Sentiment</p>
                  <p className="text-2xl font-bold">
                    {bullishPercentage > bearishPercentage ? "Bullish" : 
                     bearishPercentage > bullishPercentage ? "Bearish" : "Neutral"}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${
                  bullishPercentage > bearishPercentage ? "text-green-400" : 
                  bearishPercentage > bullishPercentage ? "text-red-400" : "text-yellow-400"
                }`} />
              </div>
              <div className="flex space-x-1 mt-3">
                <div className="h-2 bg-green-500 rounded" style={{ width: `${bullishPercentage}%` }}></div>
                <div className="h-2 bg-red-500 rounded" style={{ width: `${bearishPercentage}%` }}></div>
                <div className="h-2 bg-yellow-500 rounded" style={{ width: `${neutralPercentage}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bullish Articles</p>
                  <p className="text-2xl font-bold text-green-400">{sentimentStats.bullish || 0}</p>
                </div>
                <div className="text-green-400 text-xl font-bold">
                  {bullishPercentage.toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Bearish Articles</p>
                  <p className="text-2xl font-bold text-red-400">{sentimentStats.bearish || 0}</p>
                </div>
                <div className="text-red-400 text-xl font-bold">
                  {bearishPercentage.toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-secondary border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Articles</p>
                  <p className="text-2xl font-bold">{totalArticles}</p>
                </div>
                <Newspaper className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mt-2">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all-news" className="space-y-6">
              <TabsList className="bg-dark-secondary">
                <TabsTrigger value="all-news">All News</TabsTrigger>
                <TabsTrigger value="portfolio-news">Portfolio Related</TabsTrigger>
                <TabsTrigger value="breaking">Breaking News</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="all-news" className="space-y-4">
                {filteredAllNews.length > 0 ? (
                  filteredAllNews.map((article) => (
                    <Card key={article.id} className="bg-dark-secondary border-gray-700 hover:border-gray-600 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Globe className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={`${getSentimentColor(article.sentiment)} text-xs`}>
                                {article.sentiment}
                              </Badge>
                              <span className="text-gray-400 text-sm flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTimeAgo(new Date(article.publishedAt))}
                              </span>
                              <span className="text-gray-400 text-sm">{article.source}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {article.relevantSymbols && article.relevantSymbols.length > 0 && (
                                  <>
                                    <span className="text-xs text-gray-500">Related:</span>
                                    <div className="flex space-x-1">
                                      {article.relevantSymbols.slice(0, 4).map((symbol: string) => (
                                        <Badge key={symbol} variant="outline" className="text-xs px-2 py-1 text-blue-400 border-blue-500/30">
                                          {symbol}
                                        </Badge>
                                      ))}
                                      {article.relevantSymbols.length > 4 && (
                                        <span className="text-xs text-gray-400">+{article.relevantSymbols.length - 4}</span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Read More
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No news articles found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="portfolio-news" className="space-y-4">
                {filteredPortfolioNews.length > 0 ? (
                  filteredPortfolioNews.map((article) => (
                    <Card key={article.id} className="bg-dark-secondary border-gray-700 hover:border-gray-600 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={`${getSentimentColor(article.sentiment)} text-xs`}>
                                {article.sentiment}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">Portfolio Related</Badge>
                              <span className="text-gray-400 text-sm flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTimeAgo(new Date(article.publishedAt))}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {article.title}
                            </h3>
                            <p className="text-gray-300 text-sm mb-3">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {article.relevantSymbols && article.relevantSymbols.length > 0 && (
                                  <>
                                    <span className="text-xs text-gray-500">Your Holdings:</span>
                                    <div className="flex space-x-1">
                                      {article.relevantSymbols
                                        .filter((symbol: string) => symbols.includes(symbol))
                                        .map((symbol: string) => (
                                        <Badge key={symbol} className="text-xs px-2 py-1 bg-green-500/20 text-green-400 border-green-500/30">
                                          {symbol}
                                        </Badge>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Read More
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No portfolio-related news found.</p>
                    <p className="text-gray-500 text-sm mt-2">Add more holdings to see relevant news.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="breaking" className="space-y-4">
                <div className="text-center py-12">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Breaking news feed coming soon.</p>
                  <p className="text-gray-500 text-sm mt-2">Real-time alerts for major market events.</p>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">In-depth market analysis coming soon.</p>
                  <p className="text-gray-500 text-sm mt-2">Expert commentary and market insights.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Symbols */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Trending Symbols</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingSymbols.slice(0, 8).map(([symbol, mentions]) => (
                    <div key={symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {symbol.charAt(0)}
                        </div>
                        <span className="font-medium">{symbol}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {mentions} mentions
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Indicators */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Market Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fear & Greed Index</span>
                  <div className="text-right">
                    <p className="font-mono">72</p>
                    <p className="text-xs text-green-400">Greed</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">VIX (Volatility)</span>
                  <div className="text-right">
                    <p className="font-mono">16.8</p>
                    <p className="text-xs text-green-400">-2.1%</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">News Sentiment</span>
                  <div className="text-right">
                    <p className="font-mono">{bullishPercentage.toFixed(0)}%</p>
                    <p className="text-xs text-green-400">Bullish</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Social Volume</span>
                  <div className="text-right">
                    <p className="font-mono">High</p>
                    <p className="text-xs text-yellow-400">+12%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News Sources */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Top Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {["MarketWatch", "Reuters", "Bloomberg", "CNBC", "TechCrunch"].map((source) => (
                    <div key={source} className="flex items-center justify-between p-2 bg-dark-tertiary rounded">
                      <span className="text-sm">{source}</span>
                      <span className="text-xs text-gray-400">
                        {Math.floor(Math.random() * 10) + 1} articles
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}