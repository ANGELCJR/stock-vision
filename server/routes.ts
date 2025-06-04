import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getStockData, getHistoricalData } from "./services/financialData";

import { fetchMarketNews } from "./services/newsService";
import { insertHoldingSchema, insertPortfolioSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Portfolio routes
  app.get("/api/portfolios", async (req, res) => {
    try {
      const userId = 1; // Default user for demo
      const portfolios = await storage.getPortfoliosByUserId(userId);
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolios", async (req, res) => {
    try {
      const data = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(data);
      res.json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  // Holdings routes
  app.get("/api/portfolios/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      
      // Update current prices for all holdings
      const symbols = holdings.map(h => h.symbol);
      if (symbols.length > 0) {
        await Promise.all(symbols.map(async (symbol) => {
          try {
            const stockData = await getStockData(symbol);
            if (stockData) {
              // Update stock price in storage
              await storage.updateStockPrice(symbol, {
                price: stockData.price.toString(),
                change: stockData.change.toString(),
                changePercent: stockData.changePercent.toString(),
                volume: stockData.volume
              });

              // Update holding with current price and calculations
              const holding = holdings.find(h => h.symbol === symbol);
              if (holding) {
                const currentPrice = parseFloat(stockData.price.toString());
                const shares = parseFloat(holding.shares);
                const avgPrice = parseFloat(holding.avgPrice);
                const totalValue = currentPrice * shares;
                const gainLoss = totalValue - (avgPrice * shares);
                const gainLossPercent = ((currentPrice - avgPrice) / avgPrice) * 100;

                await storage.updateHolding(holding.id, {
                  currentPrice: currentPrice.toString(),
                  totalValue: totalValue.toString(),
                  gainLoss: gainLoss.toString(),
                  gainLossPercent: gainLossPercent.toString()
                });
              }
            }
          } catch (error) {
            console.error(`Failed to update price for ${symbol}:`, error);
          }
        }));

        // Fetch updated holdings
        const updatedHoldings = await storage.getHoldingsByPortfolioId(portfolioId);
        
        // Update portfolio totals
        const totalValue = updatedHoldings.reduce((sum, h) => sum + parseFloat(h.totalValue), 0);
        const totalGainLoss = updatedHoldings.reduce((sum, h) => sum + parseFloat(h.gainLoss), 0);
        
        await storage.updatePortfolio(portfolioId, {
          totalValue: totalValue.toString(),
          totalGainLoss: totalGainLoss.toString()
        });

        res.json(updatedHoldings);
      } else {
        res.json(holdings);
      }
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ error: "Failed to fetch holdings" });
    }
  });

  app.post("/api/portfolios/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const data = insertHoldingSchema.parse({ ...req.body, portfolioId });
      
      // Get current stock price
      const stockData = await getStockData(data.symbol);
      if (!stockData) {
        return res.status(400).json({ error: "Invalid stock symbol" });
      }

      const holding = await storage.createHolding(data);
      
      // Update with current price
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
      console.error("Error creating holding:", error);
      res.status(400).json({ error: "Invalid holding data" });
    }
  });

  app.delete("/api/holdings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHolding(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Holding not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete holding" });
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



  // Market news routes
  app.get("/api/news", async (req, res) => {
    try {
      const symbols = req.query.symbols as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      let news;
      if (symbols) {
        const symbolArray = symbols.split(",").map(s => s.trim().toUpperCase());
        news = await storage.getMarketNewsBySymbols(symbolArray, limit);
      } else {
        news = await storage.getLatestMarketNews(limit);
      }
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  app.post("/api/news/fetch", async (req, res) => {
    try {
      const symbols = req.body.symbols || [];
      const news = await fetchMarketNews(symbols);
      
      // Store news
      await Promise.all(
        news.map(article => storage.createMarketNews(article))
      );
      
      res.json({ success: true, count: news.length });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  // Portfolio performance data
  app.get("/api/portfolios/:id/performance", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const period = req.query.period as string || "1d";
      
      // Generate mock performance data for different time periods
      const generatePerformanceData = (period: string) => {
        const baseValue = 127845.32;
        const points = period === "1d" ? 14 : period === "1w" ? 7 : period === "1m" ? 30 : period === "3m" ? 90 : 365;
        const data = [];
        
        for (let i = 0; i < points; i++) {
          const variance = (Math.random() - 0.5) * 0.02; // 2% variance
          const value = baseValue * (1 + variance * i / points);
          data.push({
            timestamp: new Date(Date.now() - (points - i) * (period === "1d" ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000)),
            value: value
          });
        }
        
        return data;
      };
      
      const performanceData = generatePerformanceData(period);
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Search stocks
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }

      // Mock search results - in a real app, this would search a stock database
      const mockResults = [
        { symbol: "AAPL", name: "Apple Inc." },
        { symbol: "GOOGL", name: "Alphabet Inc." },
        { symbol: "MSFT", name: "Microsoft Corporation" },
        { symbol: "NVDA", name: "NVIDIA Corporation" },
        { symbol: "TSLA", name: "Tesla, Inc." },
        { symbol: "AMZN", name: "Amazon.com Inc." },
        { symbol: "META", name: "Meta Platforms Inc." },
        { symbol: "NFLX", name: "Netflix Inc." }
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      res.json(mockResults);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
