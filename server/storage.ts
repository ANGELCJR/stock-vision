import {
  users,
  portfolios,
  holdings,
  stockPrices,
  aiInsights,
  marketNews,
  portfolioHistory,
  type User,
  type UpsertUser,
  type Portfolio,
  type InsertPortfolio,
  type Holding,
  type InsertHolding,
  type StockPrice,
  type InsertStockPrice,
  type AIInsight,
  type InsertAIInsight,
  type MarketNews,
  type InsertMarketNews,
  type PortfolioHistory,
  type InsertPortfolioHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations for session-based auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Portfolio operations
  getPortfoliosByUserId(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | undefined>;
  getOrCreateUserPortfolio(userId: string): Promise<Portfolio>;

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
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getOrCreateUserPortfolio(userId: string): Promise<Portfolio> {
    // Check if user already has a portfolio
    const existingPortfolios = await this.getPortfoliosByUserId(userId);
    if (existingPortfolios.length > 0) {
      return existingPortfolios[0];
    }

    // Create new portfolio for user
    return this.createPortfolio({
      userId,
      name: "My Portfolio"
    });
  }

  async getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.userId, userId));
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db.insert(portfolios).values(insertPortfolio).returning();
    return portfolio;
  }

  async updatePortfolio(id: number, updates: Partial<Portfolio>): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .update(portfolios)
      .set(updates)
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  }

  // Holdings operations
  async getHoldingsByPortfolioId(portfolioId: number): Promise<Holding[]> {
    return await db.select().from(holdings).where(eq(holdings.portfolioId, portfolioId));
  }

  async getHolding(id: number): Promise<Holding | undefined> {
    const [holding] = await db.select().from(holdings).where(eq(holdings.id, id));
    return holding;
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    const [holding] = await db.insert(holdings).values(insertHolding).returning();
    return holding;
  }

  async updateHolding(id: number, updates: Partial<Holding>): Promise<Holding | undefined> {
    const [holding] = await db
      .update(holdings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(holdings.id, id))
      .returning();
    return holding;
  }

  async deleteHolding(id: number): Promise<boolean> {
    const result = await db.delete(holdings).where(eq(holdings.id, id));
    return result.rowCount > 0;
  }

  // Stock price operations
  async getStockPrice(symbol: string): Promise<StockPrice | undefined> {
    const [stockPrice] = await db.select().from(stockPrices).where(eq(stockPrices.symbol, symbol));
    return stockPrice;
  }

  async getLatestStockPrices(symbols: string[]): Promise<StockPrice[]> {
    return await db.select().from(stockPrices).where(inArray(stockPrices.symbol, symbols));
  }

  async createStockPrice(insertStockPrice: InsertStockPrice): Promise<StockPrice> {
    const [stockPrice] = await db.insert(stockPrices).values(insertStockPrice).returning();
    return stockPrice;
  }

  async updateStockPrice(symbol: string, updates: Partial<StockPrice>): Promise<StockPrice | undefined> {
    const [stockPrice] = await db
      .update(stockPrices)
      .set({ ...updates, timestamp: new Date() })
      .where(eq(stockPrices.symbol, symbol))
      .returning();
    return stockPrice;
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

  // Market news operations
  async getLatestMarketNews(limit: number = 10): Promise<MarketNews[]> {
    return await db.select().from(marketNews).orderBy(desc(marketNews.publishedAt)).limit(limit);
  }

  async getMarketNewsBySymbols(symbols: string[], limit: number = 10): Promise<MarketNews[]> {
    return await db.select().from(marketNews).limit(limit);
  }

  async createMarketNews(insertNews: InsertMarketNews): Promise<MarketNews> {
    const [news] = await db.insert(marketNews).values(insertNews).returning();
    return news;
  }

  // Portfolio history operations
  async getPortfolioHistory(portfolioId: number, period: string = "1d"): Promise<PortfolioHistory[]> {
    return await db.select().from(portfolioHistory).where(eq(portfolioHistory.portfolioId, portfolioId));
  }

  async createPortfolioHistory(insertHistory: InsertPortfolioHistory): Promise<PortfolioHistory> {
    const [history] = await db.insert(portfolioHistory).values(insertHistory).returning();
    return history;
  }
}

export const storage = new DatabaseStorage();