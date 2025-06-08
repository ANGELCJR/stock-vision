import { InsertMarketNews } from "@shared/schema";

interface NewsArticle {
  title: string;
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  relevantSymbols: string[];
  source: string;
  url: string;
  publishedAt: Date;
}

export async function fetchMarketNews(symbols: string[] = []): Promise<InsertMarketNews[]> {
  try {
    return getMockNews(symbols);
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
}

function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const bullishWords = ['growth', 'profit', 'increase', 'positive', 'up', 'gain', 'strong'];
  const bearishWords = ['loss', 'decline', 'decrease', 'negative', 'down', 'fall', 'weak'];
  
  const lowerText = text.toLowerCase();
  let bullishCount = 0;
  let bearishCount = 0;
  
  bullishWords.forEach(word => {
    if (lowerText.includes(word)) bullishCount++;
  });
  
  bearishWords.forEach(word => {
    if (lowerText.includes(word)) bearishCount++;
  });
  
  if (bullishCount > bearishCount) return 'bullish';
  if (bearishCount > bullishCount) return 'bearish';
  return 'neutral';
}

function extractRelevantSymbols(text: string, knownSymbols: string[]): string[] {
  const relevantSymbols: string[] = [];
  knownSymbols.forEach(symbol => {
    if (text.toUpperCase().includes(symbol)) {
      relevantSymbols.push(symbol);
    }
  });
  return relevantSymbols;
}

function getMockNews(symbols: string[] = []): InsertMarketNews[] {
  const mockArticles = [
    {
      title: "Tech Stocks Rally as Market Shows Strong Performance",
      summary: "Major technology companies saw significant gains today as investors showed renewed confidence in the sector.",
      source: "Financial Times",
      url: "https://example.com/news1"
    },
    {
      title: "Market Analysis: Growth Stocks Continue Upward Trend",
      summary: "Analysts predict continued growth for major technology and healthcare stocks in the coming quarter.",
      source: "MarketWatch",
      url: "https://example.com/news2"
    },
    {
      title: "Energy Sector Faces Volatility Amid Global Changes",
      summary: "Energy stocks experienced mixed performance as global market conditions continue to evolve.",
      source: "Bloomberg",
      url: "https://example.com/news3"
    },
    {
      title: "Consumer Spending Data Drives Market Optimism",
      summary: "Latest consumer spending reports indicate strong economic fundamentals supporting market growth.",
      source: "Reuters",
      url: "https://example.com/news4"
    },
    {
      title: "Federal Reserve Signals Stable Interest Rate Policy",
      summary: "Recent Federal Reserve communications suggest a measured approach to monetary policy changes.",
      source: "Wall Street Journal",
      url: "https://example.com/news5"
    }
  ];

  return mockArticles.map(article => ({
    title: article.title,
    summary: article.summary,
    sentiment: analyzeSentiment(article.title + " " + article.summary),
    relevantSymbols: extractRelevantSymbols(article.title + " " + article.summary, symbols),
    source: article.source,
    url: article.url,
    publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
  }));
}