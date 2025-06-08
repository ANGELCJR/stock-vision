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
      const matchesQuery = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSentiment = selectedSentiment === "all" || article.sentiment === selectedSentiment;
      
      return matchesQuery && matchesSentiment;
    });
  };

  const filteredAllNews = filterNews(allNews);
  const filteredPortfolioNews = filterNews(portfolioNews);

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Market News</h1>
            <p className="text-slate-600 dark:text-muted-foreground">Stay informed with the latest market developments</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-muted dark:bg-dark-tertiary border-border"
              />
            </div>
            
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="w-full sm:w-[140px] bg-muted dark:bg-dark-secondary border-border">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-dark-secondary border-border">
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="bullish">Bullish</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="bearish">Bearish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Main News Feed */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="all-news" className="space-y-6">
              <TabsList className="bg-card dark:bg-dark-secondary">
                <TabsTrigger value="all-news">All News</TabsTrigger>
                <TabsTrigger value="portfolio-news">Portfolio Related</TabsTrigger>
              </TabsList>

              <TabsContent value="all-news" className="space-y-4">
                {allNewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="bg-card dark:bg-dark-secondary border-border">
                        <CardContent className="p-4 sm:p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-1"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredAllNews.length > 0 ? (
                  filteredAllNews.map((article) => (
                    <Card key={article.id} className="bg-card dark:bg-dark-secondary border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                            <Globe className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground leading-tight mb-2 sm:mb-0">
                                {article.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs border ${getSentimentColor(article.sentiment)}`}>
                                  {article.sentiment}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-muted-foreground whitespace-nowrap">
                                  {formatTimeAgo(new Date(article.publishedAt))}
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-muted-foreground text-sm sm:text-base mb-3 line-clamp-3">
                              {article.summary}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500 dark:text-muted-foreground">Source:</span>
                                <span className="text-xs font-medium text-slate-800 dark:text-foreground">{article.source}</span>
                                {article.relevantSymbols && article.relevantSymbols.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-slate-500 dark:text-muted-foreground">•</span>
                                    <div className="flex space-x-1">
                                      {article.relevantSymbols.slice(0, 3).map((symbol: string) => (
                                        <Badge key={symbol} variant="outline" className="text-xs px-1 py-0">
                                          {symbol}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                                onClick={() => window.open(article.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Read More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Newspaper className="h-12 w-12 text-slate-400 dark:text-muted-foreground mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-muted-foreground">No news articles found matching your filters.</p>
                    <p className="text-slate-500 dark:text-muted-foreground text-sm mt-1">Try adjusting your search or sentiment filter.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="portfolio-news" className="space-y-4">
                {portfolioNewsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="bg-card dark:bg-dark-secondary border-border">
                        <CardContent className="p-4 sm:p-6">
                          <div className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-full mb-1"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredPortfolioNews.length > 0 ? (
                  filteredPortfolioNews.map((article) => (
                    <Card key={article.id} className="bg-card dark:bg-dark-secondary border-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center mx-auto sm:mx-0">
                            <TrendingUp className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground leading-tight mb-2 sm:mb-0">
                                {article.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={`text-xs border ${getSentimentColor(article.sentiment)}`}>
                                  {article.sentiment}
                                </Badge>
                                <span className="text-xs text-slate-500 dark:text-muted-foreground whitespace-nowrap">
                                  {formatTimeAgo(new Date(article.publishedAt))}
                                </span>
                              </div>
                            </div>
                            <p className="text-slate-700 dark:text-muted-foreground text-sm sm:text-base mb-3 line-clamp-3">
                              {article.summary}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-slate-500 dark:text-muted-foreground">Source:</span>
                                <span className="text-xs font-medium text-slate-800 dark:text-foreground">{article.source}</span>
                                {article.relevantSymbols && article.relevantSymbols.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-slate-500 dark:text-muted-foreground">•</span>
                                    <div className="flex space-x-1">
                                      {article.relevantSymbols.slice(0, 3).map((symbol: string) => (
                                        <Badge key={symbol} variant="outline" className="text-xs px-1 py-0 bg-primary/10 text-primary">
                                          {symbol}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                                onClick={() => window.open(article.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Read More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-slate-400 dark:text-muted-foreground mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-muted-foreground">No portfolio-related news found.</p>
                    <p className="text-slate-500 dark:text-muted-foreground text-sm mt-1">Add stocks to your portfolio to see relevant news.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Sentiment */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-foreground">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-muted-foreground">Bullish</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm text-slate-800 dark:text-foreground font-mono">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-muted-foreground">Neutral</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                      </div>
                      <span className="text-sm text-slate-800 dark:text-foreground font-mono">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-muted-foreground">Bearish</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm text-slate-800 dark:text-foreground font-mono">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News Categories */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-foreground">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: 'Market Updates', count: 24 },
                    { name: 'Earnings', count: 12 },
                    { name: 'Tech Sector', count: 18 },
                    { name: 'Economy', count: 15 },
                    { name: 'Crypto', count: 9 }
                  ].map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-2 hover:bg-muted dark:hover:bg-dark-tertiary rounded cursor-pointer transition-colors">
                      <span className="text-slate-700 dark:text-foreground">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
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