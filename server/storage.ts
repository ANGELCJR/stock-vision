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

    // Initialize with a default portfolio for demo purposes
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

    this.currentId = 2;
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
      ...insertNews,
      id,
      createdAt: new Date()
    };
    this.marketNews.set(id, news);
    return news;
  }
}

export const storage = new MemStorage();
