import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { getStockData, getHistoricalData } from "./services/financialData";
import { fetchMarketNews } from "./services/newsService";
import { insertHoldingSchema, insertPortfolioSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure PostgreSQL session store for production
  const pgStore = connectPg(session);
  
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'portfolio-pro-secret-2024',
    resave: false,
    saveUninitialized: true,
    name: 'portfolio.sid',
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));

  // Session-based user isolation middleware
  app.use(async (req: any, res, next) => {
    try {
      if (!req.session.userId) {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 11);
        req.session.userId = `session_${timestamp}_${randomId}`;
        
        console.log(`New session created: ${req.session.userId}`);
        
        await storage.upsertUser({
          id: req.session.userId,
          email: null,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          updatedAt: new Date()
        });
      }
      next();
    } catch (error) {
      console.error("Session middleware error:", error);
      next();
    }
  });

  // Session-isolated portfolio routes
  app.get("/api/portfolios", async (req: any, res) => {
    try {
      const userId = req.session.userId;
      console.log(`Fetching portfolio for user: ${userId}`);
      
      const portfolio = await storage.getOrCreateUserPortfolio(userId);
      res.json([portfolio]);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolios/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio || portfolio.userId !== userId) {
        console.log(`Access denied: Portfolio ${id} not owned by ${userId}`);
        return res.status(404).json({ error: "Portfolio not found" });
      }
      
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/portfolios/:id/holdings", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  app.post("/api/portfolios/:id/holdings", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const data = insertHoldingSchema.parse({ ...req.body, portfolioId });
      
      const stockData = await getStockData(data.symbol);
      if (!stockData) {
        return res.status(400).json({ error: "Invalid stock symbol" });
      }

      const holding = await storage.createHolding(data);
      
      const currentPrice = parseFloat(stockData.price.toString());
      const shares = parseFloat(holding.shares);
      const avgPrice = parseFloat(holding.avgPrice);
      const totalValue = currentPrice * shares;
      const gainLoss = totalValue - (avgPrice * shares);
      const gainLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

      const updatedHolding = await storage.updateHolding(holding.id, {
        currentPrice: currentPrice.toString(),
        totalValue: totalValue.toString(),
        gainLoss: gainLoss.toString(),
        gainLossPercent: gainLossPercent.toString()
      });

      res.json(updatedHolding);
    } catch (error) {
      console.error("Error creating holding:", error);
      res.status(400).json({ error: "Invalid holding data" });
    }
  });

  app.delete("/api/holdings/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const holding = await storage.getHolding(id);
      if (!holding) {
        return res.status(404).json({ error: "Holding not found" });
      }
      
      const portfolio = await storage.getPortfolio(holding.portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const success = await storage.deleteHolding(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting holding:", error);
      res.status(500).json({ error: "Failed to delete holding" });
    }
  });

  app.get("/api/portfolios/:id/performance", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const data = [];
      const now = new Date();
      const currentValue = parseFloat(portfolio.totalValue || "0");
      
      for (let i = 0; i < 14; i++) {
        const timestamp = new Date(now.getTime() - (14 - i) * 30 * 60 * 1000);
        data.push({
          timestamp,
          totalValue: currentValue,
          totalGainLoss: parseFloat(portfolio.totalGainLoss || "0")
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Stock routes
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stockData = await getStockData(symbol);
      if (!stockData) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stockData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  app.get("/api/stocks/:symbol/history", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const period = req.query.period as string || "1d";
      const historicalData = await getHistoricalData(symbol, period);
      res.json(historicalData);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ error: "Failed to fetch historical data" });
    }
  });

  // Fixed news API
  app.get("/api/news", async (req, res) => {
    try {
      console.log("Fetching market news...");
      const news = await storage.getLatestMarketNews(10);
      console.log(`Found ${news.length} news articles`);
      res.json(news);
    } catch (error) {
      console.error("Market news error:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
      const response = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );

      const data = await response.json();
      const results = (data.result || [])
        .filter((stock: any) => stock.type === "Common Stock")
        .slice(0, 10)
        .map((stock: any) => ({
          symbol: stock.symbol,
          name: stock.description
        }));

      res.json(results);
    } catch (error) {
      console.error("Stock search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}