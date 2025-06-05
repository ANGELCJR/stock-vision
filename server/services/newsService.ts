import type { InsertMarketNews } from "@shared/schema";

interface NewsArticle {
  title: string;
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  relevantSymbols: string[];
  source: string;
  url: string;
  publishedAt: Date;
}

// News API integration
const NEWS_API_KEY = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY || "demo";
const NEWS_API_BASE_URL = "https://newsapi.org/v2";

export async function fetchMarketNews(symbols: string[] = []): Promise<InsertMarketNews[]> {
  try {
    // Build query based on symbols
    let query = "stock market OR finance OR investing";
    if (symbols.length > 0) {
      query += " OR " + symbols.join(" OR ");
    }

    console.log(`Fetching news with API key: ${NEWS_API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=20&apiKey=${NEWS_API_KEY}`
    );

    console.log(`News API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`News API error: ${response.status} - ${errorText}`);
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`News API returned ${data.articles?.length || 0} articles`);

    if (data.articles && data.articles.length > 0) {
      return data.articles.map((article: any) => {
        const sentiment = analyzeSentiment(article.title + " " + (article.description || ""));
        const relevantSymbols = extractRelevantSymbols(article.title + " " + (article.description || ""), symbols);

        return {
          title: article.title,
          summary: article.description || article.title,
          sentiment,
          relevantSymbols,
          source: article.source?.name || "Unknown",
          url: article.url,
          publishedAt: new Date(article.publishedAt)
        };
      });
    }

    // Fallback to mock data
    return getMockNews(symbols);

  } catch (error) {
    console.error("Error fetching market news:", error);
    return getMockNews(symbols);
  }
}

function analyzeSentiment(text: string): "bullish" | "bearish" | "neutral" {
  const bullishWords = ["growth", "gains", "profits", "beats", "exceeds", "strong", "positive", "rally", "surge", "up", "rises"];
  const bearishWords = ["losses", "decline", "falls", "drops", "weak", "negative", "crash", "plunge", "down", "concerns"];

  const lowerText = text.toLowerCase();
  const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
  const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;

  if (bullishCount > bearishCount) return "bullish";
  if (bearishCount > bullishCount) return "bearish";
  return "neutral";
}

function extractRelevantSymbols(text: string, knownSymbols: string[]): string[] {
  const relevantSymbols: string[] = [];
  const upperText = text.toUpperCase();

  // Check for known symbols
  knownSymbols.forEach(symbol => {
    if (upperText.includes(symbol)) {
      relevantSymbols.push(symbol);
    }
  });

  // Check for common symbols mentioned in text
  const commonSymbols = ["AAPL", "NVDA", "TSLA", "GOOGL", "MSFT", "AMZN", "META", "NFLX"];
  commonSymbols.forEach(symbol => {
    if (upperText.includes(symbol) && !relevantSymbols.includes(symbol)) {
      relevantSymbols.push(symbol);
    }
  });

  return relevantSymbols;
}

function getMockNews(symbols: string[] = []): InsertMarketNews[] {
  const mockArticles: InsertMarketNews[] = [
    {
      title: "NVIDIA Reports Record Q4 Earnings, Beats Expectations",
      summary: "Strong AI chip demand drives revenue growth of 45% year-over-year, with data center revenue reaching new highs.",
      sentiment: "bullish",
      relevantSymbols: ["NVDA", "AMD"],
      source: "MarketWatch",
      url: "https://www.marketwatch.com/story/nvidia-earnings-q4-2024",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      title: "Fed Signals Potential Rate Hike Amid Inflation Concerns",
      summary: "Federal Reserve officials hint at more aggressive monetary policy to combat persistent inflation pressures.",
      sentiment: "bearish",
      relevantSymbols: [],
      source: "Reuters",
      url: "https://www.reuters.com/business/finance/fed-rate-policy-inflation-2024",
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      title: "Tesla Faces Production Challenges in Q4",
      summary: "Electric vehicle manufacturer reports lower than expected delivery numbers amid supply chain constraints.",
      sentiment: "bearish",
      relevantSymbols: ["TSLA"],
      source: "Reuters",
      url: "https://www.reuters.com/business/autos-transportation/tesla-q4-deliveries-2024",
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
    },
    {
      title: "Apple Announces New Features for iPhone",
      summary: "Tech giant reveals comprehensive integration across iOS ecosystem, potentially boosting hardware sales.",
      sentiment: "bullish",
      relevantSymbols: ["AAPL"],
      source: "TechCrunch",
      url: "https://techcrunch.com/2024/apple-iphone-features-announcement",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    },
    {
      title: "Microsoft Cloud Revenue Surges 25% in Latest Quarter",
      summary: "Azure and productivity software drive strong quarterly performance, exceeding analyst expectations.",
      sentiment: "bullish",
      relevantSymbols: ["MSFT"],
      source: "CNBC",
      url: "https://www.cnbc.com/2024/microsoft-cloud-earnings-q4",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    }
  ];

  // Filter by relevant symbols if provided
  if (symbols.length > 0) {
    return mockArticles.filter(article => 
      article.relevantSymbols.some(symbol => symbols.includes(symbol))
    );
  }

  return mockArticles;
}
