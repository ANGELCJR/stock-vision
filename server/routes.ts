import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { getStockData, getHistoricalData } from "./services/financialData";
import { fetchMarketNews } from "./services/newsService";
import { generateAIInsights } from "./services/openai";
import { insertHoldingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration for user isolation
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // Session-based user creation middleware
  app.use(async (req: any, res, next) => {
    if (!req.session.userId) {
      // Create unique session user ID
      const sessionUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      req.session.userId = sessionUserId;
      
      try {
        // Create user record for session
        await storage.upsertUser({
          id: sessionUserId,
          email: null,
          firstName: null,
          lastName: null,
          profileImageUrl: null
        });
        
        // Create default portfolio for user
        await storage.getOrCreateUserPortfolio(sessionUserId);
      } catch (error) {
        console.error("Error creating session user:", error);
      }
    }
    next();
  });

  // Portfolio routes
  app.get("/api/portfolios", async (req: any, res) => {
    try {
      const portfolios = await storage.getPortfoliosByUserId(req.session.userId);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolios/:id", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Holdings routes
  app.get("/api/portfolios/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  app.post("/api/portfolios/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const validatedData = insertHoldingSchema.parse({
        ...req.body,
        portfolioId
      });

      // Get current stock price
      const stockData = await getStockData(validatedData.symbol);
      const currentPrice = stockData?.price || parseFloat(validatedData.avgPrice);

      const holding = await storage.createHolding({
        ...validatedData,
        currentPrice,
        totalValue: parseFloat(validatedData.shares) * currentPrice,
        gainLoss: (currentPrice - parseFloat(validatedData.avgPrice)) * parseFloat(validatedData.shares),
        gainLossPercent: ((currentPrice - parseFloat(validatedData.avgPrice)) / parseFloat(validatedData.avgPrice)) * 100
      });

      // Update portfolio totals
      await updatePortfolioTotals(portfolioId);

      res.json(holding);
    } catch (error) {
      console.error("Error adding holding:", error);
      res.status(500).json({ error: "Failed to add holding" });
    }
  });

  app.delete("/api/holdings/:id", async (req, res) => {
    try {
      const holdingId = parseInt(req.params.id);
      const holding = await storage.getHolding(holdingId);
      
      if (!holding) {
        return res.status(404).json({ error: "Holding not found" });
      }

      await storage.deleteHolding(holdingId);
      
      // Update portfolio totals
      await updatePortfolioTotals(holding.portfolioId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting holding:", error);
      res.status(500).json({ error: "Failed to delete holding" });
    }
  });

  // Performance data route
  app.get("/api/portfolios/:id/performance", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const period = req.query.period as string || "1d";
      
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      
      if (holdings.length === 0) {
        return res.json([]);
      }

      // Generate performance data points
      const performanceData = [];
      const now = new Date();
      const periods = period === "1d" ? 24 : period === "1w" ? 7 : period === "1m" ? 30 : 365;
      const interval = period === "1d" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

      for (let i = periods; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * interval));
        let totalValue = 0;
        let totalGainLoss = 0;

        holdings.forEach(holding => {
          // Simulate price variation for demo
          const variation = 1 + (Math.sin(i * 0.1) * 0.05);
          const simulatedPrice = holding.currentPrice * variation;
          const holdingValue = holding.shares * simulatedPrice;
          const holdingGainLoss = (simulatedPrice - holding.avgPrice) * holding.shares;
          
          totalValue += holdingValue;
          totalGainLoss += holdingGainLoss;
        });

        performanceData.push({
          timestamp,
          totalValue,
          totalGainLoss
        });
      }

      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Stock data routes
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

  // Stock search route
  app.get("/api/search/stocks", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }

      // Mock search results for demo
      const mockResults = [
        { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
        { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
        { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
        { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
        { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
        { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
        { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
        { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ" }
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      res.json(mockResults.slice(0, 10));
    } catch (error) {
      console.error("Error searching stocks:", error);
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  // Market news route
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const news = await storage.getLatestMarketNews(limit);
      
      // If no news in database, fetch and store some
      if (news.length === 0) {
        const fetchedNews = await fetchMarketNews();
        // Store news in database
        for (const article of fetchedNews) {
          await storage.createMarketNews(article);
        }
        const newNews = await storage.getLatestMarketNews(limit);
        return res.json(newNews);
      }
      
      res.json(news);
    } catch (error) {
      console.error("Error fetching market news:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  // Insights route
  app.get("/api/insights/:portfolioId", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.portfolioId);
      const insights = await storage.getAIInsightsByPortfolioId(portfolioId);
      
      // If no insights, generate some
      if (insights.length === 0) {
        const portfolio = await storage.getPortfolio(portfolioId);
        const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
        
        if (portfolio && holdings.length > 0) {
          const generatedInsights = await generateAIInsights(portfolio, holdings);
          
          // Store insights
          for (const insight of generatedInsights) {
            await storage.createAIInsight({
              portfolioId,
              ...insight
            });
          }
          
          const newInsights = await storage.getAIInsightsByPortfolioId(portfolioId);
          return res.json(newInsights);
        }
      }
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Helper function to update portfolio totals
  async function updatePortfolioTotals(portfolioId: number) {
    const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
    
    const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
    const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
    
    // Calculate risk score based on portfolio diversity and volatility
    const riskScore = Math.min(10, Math.max(1, holdings.length > 5 ? 5 : 7));
    
    await storage.updatePortfolio(portfolioId, {
      totalValue: totalValue.toString(),
      totalGainLoss: totalGainLoss.toString(),
      riskScore: riskScore.toString()
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}