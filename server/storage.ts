import { 
  users, portfolios, holdings, stockPrices, aiInsights, marketNews, portfolioHistory,
  type User, type InsertUser,
  type Portfolio, type InsertPortfolio,
  type Holding, type InsertHolding,
  type StockPrice, type InsertStockPrice,
  type AIInsight, type InsertAIInsight,
  type MarketNews, type InsertMarketNews,
  type PortfolioHistory, type InsertPortfolioHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

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

  // Portfolio history operations
  getPortfolioHistory(portfolioId: number, period?: string): Promise<PortfolioHistory[]>;
  createPortfolioHistory(history: InsertPortfolioHistory): Promise<PortfolioHistory>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample data on first run
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if data already exists
      const existingUser = await db.select().from(users).limit(1);
      if (existingUser.length > 0) {
        // Initialize news fetching for existing data
        await this.initializeNews();
        return;
      }

      // Create default user
      const [defaultUser] = await db.insert(users).values({
        username: "demo",
        password: "demo123"
      }).returning();

      // Create default portfolio
      const [defaultPortfolio] = await db.insert(portfolios).values({
        userId: defaultUser.id,
        name: "Main Portfolio",
        totalValue: "127845.32",
        totalGainLoss: "18945.78",
        riskScore: "6.7"
      }).returning();

      // Create sample holdings
      const sampleHoldings = [
        {
          portfolioId: defaultPortfolio.id,
          symbol: "AAPL",
          name: "Apple Inc.",
          shares: "50.0000",
          avgPrice: "155.20"
        },
        {
          portfolioId: defaultPortfolio.id,
          symbol: "NVDA",
          name: "NVIDIA Corporation", 
          shares: "25.0000",
          avgPrice: "750.45"
        },
        {
          portfolioId: defaultPortfolio.id,
          symbol: "TSLA",
          name: "Tesla, Inc.",
          shares: "15.0000",
          avgPrice: "265.30"
        },
        {
          portfolioId: defaultPortfolio.id,
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          shares: "30.0000",
          avgPrice: "132.80"
        },
        {
          portfolioId: defaultPortfolio.id,
          symbol: "MSFT",
          name: "Microsoft Corporation",
          shares: "20.0000",
          avgPrice: "398.60"
        }
      ];

      await db.insert(holdings).values(sampleHoldings);

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
          title: "Apple Announces New Smart Features for iPhone",
          summary: "Tech giant reveals comprehensive smart technology integration across iOS ecosystem, potentially boosting hardware sales.",
          sentiment: "bullish" as const,
          relevantSymbols: ["AAPL"],
          source: "TechCrunch",
          url: "https://example.com/apple-smart-features",
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

      await db.insert(marketNews).values(sampleNews);

      // Initialize news fetching
      await this.initializeNews();

      // Create sample AI insights
      const sampleInsights = [
        {
          portfolioId: defaultPortfolio.id,
          type: "opportunity" as const,
          title: "Sector Diversification Opportunity",
          description: "Your portfolio is heavily weighted in technology (68%). Consider adding healthcare, energy, or financial sector exposure to reduce concentration risk.",
          confidence: "0.87"
        },
        {
          portfolioId: defaultPortfolio.id,
          type: "risk" as const,
          title: "High Concentration Risk Detected",
          description: "NVIDIA represents 31% of your portfolio value. Consider rebalancing to limit single-stock exposure to 15-20% maximum.",
          confidence: "0.92"
        },
        {
          portfolioId: defaultPortfolio.id,
          type: "trend" as const,
          title: "AI Sector Momentum Continues",
          description: "Your AI-focused holdings (NVDA, AAPL, GOOGL) are benefiting from strong sector tailwinds. Monitor for profit-taking opportunities.",
          confidence: "0.84"
        }
      ];

      await db.insert(aiInsights).values(sampleInsights);
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  private async initializeNews() {
    try {
      // Check if we have any news at all first
      const existingNews = await db.select()
        .from(marketNews)
        .limit(1);

      if (existingNews.length === 0) {
        console.log("No news found in database, fetching fresh market news...");
        const { fetchMarketNews } = await import("./services/newsService");
        const freshNews = await fetchMarketNews();
        
        if (freshNews.length > 0) {
          // Insert new news
          for (const article of freshNews) {
            try {
              await this.createMarketNews(article);
            } catch (err) {
              console.error("Error inserting news article:", err);
            }
          }
          console.log(`Stored ${freshNews.length} fresh news articles`);
        }
      } else {
        console.log("News already exists in database");
      }
    } catch (error) {
      console.error("Error initializing news:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Portfolio operations
  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio || undefined;
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db.insert(portfolios).values(insertPortfolio).returning();
    return portfolio;
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const [portfolio] = await db.update(portfolios)
      .set(updates)
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio || undefined;
  }

  // Holdings operations
  async getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]> {
    return await db.select().from(holdings).where(eq(holdings.portfolioId, portfolioId));
  }

  async getHolding(id: number): Promise<Holding | undefined> {
    const [holding] = await db.select().from(holdings).where(eq(holdings.id, id));
    return holding || undefined;
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    const [holding] = await db.insert(holdings).values(insertHolding).returning();
    return holding;
  }

  async updateHolding(id: number, updates: Partial<Holding>): Promise<Holding | undefined> {
    const [holding] = await db.update(holdings)
      .set(updates)
      .where(eq(holdings.id, id))
      .returning();
    return holding || undefined;
  }

  async deleteHolding(id: number): Promise<boolean> {
    const result = await db.delete(holdings).where(eq(holdings.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Stock price operations
  async getStockPrice(symbol: string): Promise<StockPrice | undefined> {
    const [stockPrice] = await db.select().from(stockPrices).where(eq(stockPrices.symbol, symbol));
    return stockPrice || undefined;
  }

  async getLatestStockPrices(symbols: string[]): Promise<StockPrice[]> {
    if (symbols.length === 0) return [];
    return await db.select().from(stockPrices);
  }

  async createStockPrice(insertStockPrice: InsertStockPrice): Promise<StockPrice> {
    const [stockPrice] = await db.insert(stockPrices).values(insertStockPrice).returning();
    return stockPrice;
  }

  async updateStockPrice(symbol: string, updates: Partial<StockPrice>): Promise<StockPrice | undefined> {
    const [stockPrice] = await db.update(stockPrices)
      .set(updates)
      .where(eq(stockPrices.symbol, symbol))
      .returning();
    return stockPrice || undefined;
  }

  // AI insights operations
  async getAIInsightsByPortfolioId(portfolioId: number): Promise<AIInsight[]> {
    return await db.select().from(aiInsights).where(eq(aiInsights.portfolioId, portfolioId));
  }

  async createAIInsight(insertInsight: InsertAIInsight): Promise<AIInsight> {
    const [insight] = await db.insert(aiInsights).values(insertInsight).returning();
    return insight;
  }

  async deleteOldAIInsights(portfolioId: number): Promise<void> {
    await db.delete(aiInsights).where(eq(aiInsights.portfolioId, portfolioId));
  }

  // Market news operations - FIXED TO USE publishedAt INSTEAD OF createdAt
  async getLatestMarketNews(limit: number = 10): Promise<MarketNews[]> {
    return await db.select().from(marketNews)
      .orderBy(desc(marketNews.publishedAt))
      .limit(limit);
  }

  async getMarketNewsBySymbols(symbols: string[], limit: number = 10): Promise<MarketNews[]> {
    return await db.select().from(marketNews)
      .orderBy(desc(marketNews.publishedAt))
      .limit(limit);
  }

  async createMarketNews(insertNews: InsertMarketNews): Promise<MarketNews> {
    const [news] = await db.insert(marketNews).values(insertNews).returning();
    return news;
  }

  // Portfolio history operations
  async getPortfolioHistory(portfolioId: number, period: string = "1d"): Promise<PortfolioHistory[]> {
    const cutoffDate = new Date();
    switch (period) {
      case "1d":
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case "1w":
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case "1m":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case "3m":
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case "1y":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
    }

    return await db.select()
      .from(portfolioHistory)
      .where(eq(portfolioHistory.portfolioId, portfolioId))
      .orderBy(portfolioHistory.timestamp);
  }

  async createPortfolioHistory(insertHistory: InsertPortfolioHistory): Promise<PortfolioHistory> {
    const [history] = await db.insert(portfolioHistory).values(insertHistory).returning();
    return history;
  }
}

export const storage = new DatabaseStorage();