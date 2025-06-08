import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { getStockData, getHistoricalData } from "./services/financialData";
import { fetchMarketNews } from "./services/newsService";
import { insertHoldingSchema, insertPortfolioSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup PostgreSQL session store
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'portfolio-pro-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  }));

  // Middleware to ensure each session has a unique user ID
  app.use(async (req: any, res, next) => {
    if (!req.session.userId) {
      // Generate unique user ID for this session
      req.session.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a user record in database
      try {
        await storage.upsertUser({
          id: req.session.userId,
          email: null,
          firstName: null,
          lastName: null,
          profileImageUrl: null,
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Error creating session user:", error);
      }
    }
    next();
  });

  // Portfolio routes - now session-based with ownership validation
  app.get("/api/portfolios", async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const portfolio = await storage.getOrCreateUserPortfolio(userId);
      res.json([portfolio]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolios/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/portfolios/:id/holdings", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Verify the portfolio belongs to this user
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  app.post("/api/portfolios/:id/holdings", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Verify the portfolio belongs to this user
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const data = insertHoldingSchema.parse({ ...req.body, portfolioId });
      
      // Get current stock price
      const stockData = await getStockData(data.symbol);
      if (!stockData) {
        return res.status(400).json({ error: "Invalid stock symbol" });
      }

      const holding = await storage.createHolding(data);
      
      // Update with current price calculations
      const currentPrice = parseFloat(stockData.price.toString());
      const shares = parseFloat(holding.shares);
      const avgPrice = parseFloat(holding.avgPrice);
      const totalValue = currentPrice * shares;
      const gainLoss = totalValue - (avgPrice * shares);
      const gainLossPercent = ((currentPrice - avgPrice) / avgPrice) * 100;

      const updatedHolding = await storage.updateHolding(holding.id, {
        currentPrice: currentPrice.toString(),
        totalValue: totalValue.toString(),
        gainLoss: gainLoss.toString(),
        gainLossPercent: gainLossPercent.toString()
      });

      res.json(updatedHolding);
    } catch (error) {
      res.status(400).json({ error: "Invalid holding data" });
    }
  });

  app.delete("/api/holdings/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Get holding and verify ownership
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
      res.status(500).json({ error: "Failed to delete holding" });
    }
  });

  app.get("/api/portfolios/:id/performance", async (req: any, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      // Verify ownership
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio || portfolio.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Generate performance data
      const data = [];
      const now = new Date();
      const currentValue = parseFloat(portfolio.totalValue || "0");
      
      for (let i = 0; i < 14; i++) {
        const timestamp = new Date(now.getTime() - (14 - i) * 30 * 60 * 1000);
        const variation = Math.sin(i * 0.1) * (currentValue * 0.1);
        data.push({
          timestamp,
          totalValue: Math.max(0, currentValue + variation),
          totalGainLoss: parseFloat(portfolio.totalGainLoss || "0")
        });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Stock and news routes (unchanged)
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stockData = await getStockData(symbol);
      if (!stockData) {
        return res.status(404).json({ error: "Stock not found" });
      }
      res.json(stockData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getLatestMarketNews(10);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

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
      res.status(500).json({ error: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}