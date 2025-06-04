import { 
  users, portfolios, holdings, stockPrices, aiInsights, marketNews,
  type User, type InsertUser,
  type Portfolio, type InsertPortfolio,
  type Holding, type InsertHolding,
  type StockPrice, type InsertStockPrice,
  type AIInsight, type InsertAIInsight,
  type MarketNews, type InsertMarketNews
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio operations
  getPortfoliosByUserId(userId: number): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | undefined>;

  // Holdings operations
  getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]>;
  getHolding(id: number): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: number, updates: Partial<Holding>): Promise<Holding | undefined>;
  deleteHolding(id: number): Promise<boolean>;

  // Stock price operations
  getStockPrice(symbol: string): Promise<StockPrice | undefined>;
  getLatestStockPrices(symbols: string[]): Promise<StockPrice[]>;
  createStockPrice(stockPrice: InsertStockPrice): Promise<StockPrice>;
  updateStockPrice(symbol: string, updates: Partial<StockPrice>): Promise<StockPrice | undefined>;

  // AI insights operations
  getAIInsightsByPortfolioId(portfolioId: number): Promise<AIInsight[]>;
  createAIInsight(insight: InsertAIInsight): Promise<AIInsight>;
  deleteOldAIInsights(portfolioId: number): Promise<void>;

  // Market news operations
  getLatestMarketNews(limit?: number): Promise<MarketNews[]>;
  getMarketNewsBySymbols(symbols: string[], limit?: number): Promise<MarketNews[]>;
  createMarketNews(news: InsertMarketNews): Promise<MarketNews>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private portfolios: Map<number, Portfolio>;
  private holdings: Map<number, Holding>;
  private stockPrices: Map<string, StockPrice>;
  private aiInsights: Map<number, AIInsight>;
  private marketNews: Map<number, MarketNews>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.holdings = new Map();
    this.stockPrices = new Map();
    this.aiInsights = new Map();
    this.marketNews = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "demo",
      password: "demo123"
    };
    this.users.set(1, defaultUser);

    // Create default portfolio
    const defaultPortfolio: Portfolio = {
      id: 1,
      userId: 1,
      name: "Main Portfolio",
      totalValue: "127845.32",
      totalGainLoss: "18945.78",
      riskScore: "6.7",
      createdAt: new Date()
    };
    this.portfolios.set(1, defaultPortfolio);

    // Create sample holdings
    const sampleHoldings = [
      {
        portfolioId: 1,
        symbol: "AAPL",
        name: "Apple Inc.",
        shares: "50.0000",
        avgPrice: "155.20",
        currentPrice: "178.91",
        totalValue: "8945.50",
        gainLoss: "1185.50",
        gainLossPercent: "15.27"
      },
      {
        portfolioId: 1,
        symbol: "NVDA", 
        name: "NVIDIA Corporation",
        shares: "25.0000",
        avgPrice: "750.45",
        currentPrice: "891.23",
        totalValue: "22280.75",
        gainLoss: "3519.50",
        gainLossPercent: "18.75"
      },
      {
        portfolioId: 1,
        symbol: "TSLA",
        name: "Tesla, Inc.",
        shares: "15.0000",
        avgPrice: "265.30",
        currentPrice: "243.84",
        totalValue: "3657.60",
        gainLoss: "-321.90",
        gainLossPercent: "-8.09"
      },
      {
        portfolioId: 1,
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        shares: "30.0000",
        avgPrice: "132.80",
        currentPrice: "139.47",
        totalValue: "4184.10",
        gainLoss: "200.10",
        gainLossPercent: "5.02"
      },
      {
        portfolioId: 1,
        symbol: "MSFT",
        name: "Microsoft Corporation",
        shares: "20.0000",
        avgPrice: "398.60",
        currentPrice: "415.23",
        totalValue: "8304.60",
        gainLoss: "332.60",
        gainLossPercent: "4.17"
      }
    ];

    sampleHoldings.forEach((holding, index) => {
      const id = index + 2;
      this.holdings.set(id, {
        id,
        ...holding,
        updatedAt: new Date()
      });
    });

    // Create sample market news
    const sampleNews = [
      {
        title: "NVIDIA Reports Record Q4 Earnings, Beats Expectations",
        summary: "Strong AI chip demand drives revenue growth of 45% year-over-year, with data center revenue reaching new highs.",
        sentiment: "bullish" as const,
        relevantSymbols: ["NVDA", "AMD"],
        source: "MarketWatch",
        url: "https://example.com/nvidia-earnings",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        title: "Apple Announces New AI Features for iPhone",
        summary: "Tech giant reveals comprehensive AI integration across iOS ecosystem, potentially boosting hardware sales.",
        sentiment: "bullish" as const,
        relevantSymbols: ["AAPL"],
        source: "TechCrunch", 
        url: "https://example.com/apple-ai-features",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        title: "Tesla Faces Production Challenges in Q4",
        summary: "Electric vehicle manufacturer reports lower than expected delivery numbers amid supply chain constraints.",
        sentiment: "bearish" as const,
        relevantSymbols: ["TSLA"],
        source: "Reuters",
        url: "https://example.com/tesla-production",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        title: "Microsoft Cloud Revenue Surges 25% in Latest Quarter",
        summary: "Azure and productivity software drive strong quarterly performance, exceeding analyst expectations.",
        sentiment: "bullish" as const,
        relevantSymbols: ["MSFT"],
        source: "CNBC",
        url: "https://example.com/microsoft-cloud",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        title: "Alphabet Reports Strong Search and Cloud Growth",
        summary: "Google parent company shows resilient performance across key business segments despite market headwinds.",
        sentiment: "bullish" as const,
        relevantSymbols: ["GOOGL"],
        source: "Bloomberg",
        url: "https://example.com/alphabet-earnings",
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    sampleNews.forEach((news, index) => {
      const id = index + 10;
      this.marketNews.set(id, {
        id,
        ...news,
        createdAt: new Date()
      });
    });

    // Create sample AI insights
    const sampleInsights = [
      {
        portfolioId: 1,
        type: "opportunity" as const,
        title: "Sector Diversification Opportunity",
        description: "Your portfolio is heavily weighted in technology (68%). Consider adding healthcare, energy, or financial sector exposure to reduce concentration risk.",
        confidence: "0.87"
      },
      {
        portfolioId: 1,
        type: "risk" as const,
        title: "High Concentration Risk Detected",
        description: "NVIDIA represents 31% of your portfolio value. Consider rebalancing to limit single-stock exposure to 15-20% maximum.",
        confidence: "0.92"
      },
      {
        portfolioId: 1,
        type: "trend" as const,
        title: "AI Sector Momentum Continues",
        description: "Your AI-focused holdings (NVDA, AAPL, GOOGL) are benefiting from strong sector tailwinds. Monitor for profit-taking opportunities.",
        confidence: "0.84"
      }
    ];

    sampleInsights.forEach((insight, index) => {
      const id = index + 20;
      this.aiInsights.set(id, {
        id,
        ...insight,
        createdAt: new Date()
      });
    });

    this.currentId = 30;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Portfolio operations
  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(p => p.userId === userId);
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentId++;
    const portfolio: Portfolio = {
      ...insertPortfolio,
      id,
      totalValue: "0",
      totalGainLoss: "0",
      riskScore: "0",
      createdAt: new Date()
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) return undefined;
    
    const updated = { ...portfolio, ...updates };
    this.portfolios.set(id, updated);
    return updated;
  }

  // Holdings operations
  async getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]> {
    return Array.from(this.holdings.values()).filter(h => h.portfolioId === portfolioId);
  }

  async getHolding(id: number): Promise<Holding | undefined> {
    return this.holdings.get(id);
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    const id = this.currentId++;
    const holding: Holding = {
      ...insertHolding,
      id,
      currentPrice: "0",
      totalValue: "0",
      gainLoss: "0",
      gainLossPercent: "0",
      updatedAt: new Date()
    };
    this.holdings.set(id, holding);
    return holding;
  }

  async updateHolding(id: number, updates: Partial<Holding>): Promise<Holding | undefined> {
    const holding = this.holdings.get(id);
    if (!holding) return undefined;
    
    const updated = { ...holding, ...updates, updatedAt: new Date() };
    this.holdings.set(id, updated);
    return updated;
  }

  async deleteHolding(id: number): Promise<boolean> {
    return this.holdings.delete(id);
  }

  // Stock price operations
  async getStockPrice(symbol: string): Promise<StockPrice | undefined> {
    return this.stockPrices.get(symbol);
  }

  async getLatestStockPrices(symbols: string[]): Promise<StockPrice[]> {
    return symbols.map(symbol => this.stockPrices.get(symbol)).filter(Boolean) as StockPrice[];
  }

  async createStockPrice(insertStockPrice: InsertStockPrice): Promise<StockPrice> {
    const id = this.currentId++;
    const stockPrice: StockPrice = {
      ...insertStockPrice,
      id,
      volume: insertStockPrice.volume || 0,
      timestamp: new Date()
    };
    this.stockPrices.set(insertStockPrice.symbol, stockPrice);
    return stockPrice;
  }

  async updateStockPrice(symbol: string, updates: Partial<StockPrice>): Promise<StockPrice | undefined> {
    const stockPrice = this.stockPrices.get(symbol);
    if (!stockPrice) return undefined;
    
    const updated = { ...stockPrice, ...updates, timestamp: new Date() };
    this.stockPrices.set(symbol, updated);
    return updated;
  }

  // AI insights operations
  async getAIInsightsByPortfolioId(portfolioId: number): Promise<AIInsight[]> {
    return Array.from(this.aiInsights.values())
      .filter(insight => insight.portfolioId === portfolioId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const id = this.currentId++;
    const insight: AIInsight = {
      ...insertInsight,
      id,
      createdAt: new Date()
    };
    this.aiInsights.set(id, insight);
    return insight;
  }

  async deleteOldAIInsights(portfolioId: number): Promise<void> {
    const insights = Array.from(this.aiInsights.values())
      .filter(insight => insight.portfolioId === portfolioId);
    
    insights.forEach(insight => this.aiInsights.delete(insight.id));
  }

  // Market news operations
  async getLatestMarketNews(limit: number = 10): Promise<MarketNews[]> {
    return Array.from(this.marketNews.values())
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getMarketNewsBySymbols(symbols: string[], limit: number = 10): Promise<MarketNews[]> {
    return Array.from(this.marketNews.values())
      .filter(news => news.relevantSymbols?.some(symbol => symbols.includes(symbol)))
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createMarketNews(insertNews: InsertMarketNews): Promise<MarketNews> {
    const id = this.currentId++;
    const news: MarketNews = {
      id,
      title: insertNews.title,
      summary: insertNews.summary,
      sentiment: insertNews.sentiment,
      relevantSymbols: insertNews.relevantSymbols || null,
      source: insertNews.source,
      url: insertNews.url,
      publishedAt: insertNews.publishedAt,
      createdAt: new Date()
    };
    this.marketNews.set(id, news);
    return news;
  }
}

export const storage = new MemStorage();
