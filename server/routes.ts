import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getStockData, getHistoricalData } from "./services/financialData";

import { fetchMarketNews } from "./services/newsService";
import { insertHoldingSchema, insertPortfolioSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Function to recalculate portfolio totals based on holdings
  async function updatePortfolioTotals(portfolioId: number) {
    const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
    
    if (holdings.length === 0) {
      // No holdings - set values to 0
      await storage.updatePortfolio(portfolioId, {
        totalValue: "0",
        totalGainLoss: "0"
      });
      return;
    }

    let totalValue = 0;
    let totalGainLoss = 0;

    for (const holding of holdings) {
      totalValue += parseFloat(holding.totalValue || "0");
      totalGainLoss += parseFloat(holding.gainLoss || "0");
    }

    await storage.updatePortfolio(portfolioId, {
      totalValue: totalValue.toString(),
      totalGainLoss: totalGainLoss.toString()
    });
  }

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
        await updatePortfolioTotals(portfolioId);

        res.json(updatedHoldings);
      } else {
        // Ensure portfolio totals are 0 when no holdings
        await updatePortfolioTotals(portfolioId);
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

      // Recalculate portfolio totals after adding holding
      await updatePortfolioTotals(portfolioId);

      // Record portfolio history snapshot
      const updatedPortfolio = await storage.getPortfolio(portfolioId);
      if (updatedPortfolio) {
        await storage.createPortfolioHistory({
          portfolioId,
          totalValue: updatedPortfolio.totalValue,
          totalGainLoss: updatedPortfolio.totalGainLoss
        });
      }

      res.json(updatedHolding);
    } catch (error) {
      console.error("Error creating holding:", error);
      res.status(400).json({ error: "Invalid holding data" });
    }
  });

  app.delete("/api/holdings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get holding to find portfolioId before deletion
      const holding = await storage.getHolding(id);
      if (!holding) {
        return res.status(404).json({ error: "Holding not found" });
      }
      
      const portfolioId = holding.portfolioId;
      const success = await storage.deleteHolding(id);
      
      if (success) {
        // Recalculate portfolio totals after deletion
        await updatePortfolioTotals(portfolioId);

        // Record portfolio history snapshot
        const updatedPortfolio = await storage.getPortfolio(portfolioId);
        if (updatedPortfolio) {
          await storage.createPortfolioHistory({
            portfolioId,
            totalValue: updatedPortfolio.totalValue,
            totalGainLoss: updatedPortfolio.totalGainLoss
          });
        }

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
      
      // Get holdings with their creation dates to build actual timeline
      const holdings = await storage.getHoldingsByPortfolioId(portfolioId);
      const portfolio = await storage.getPortfolio(portfolioId);
      const currentValue = parseFloat(portfolio?.totalValue || "0");
      
      // Calculate time range based on period
      const now = new Date();
      let startDate = new Date();
      let points = 14;
      let intervalMs = 30 * 60 * 1000; // 30 minutes for 1d
      
      switch (period) {
        case "1d":
          startDate.setDate(now.getDate() - 1);
          points = 14;
          intervalMs = 30 * 60 * 1000; // 30 minutes
          break;
        case "1w":
          startDate.setDate(now.getDate() - 7);
          points = 7;
          intervalMs = 24 * 60 * 60 * 1000; // 1 day
          break;
        case "1m":
          startDate.setMonth(now.getMonth() - 1);
          points = 30;
          intervalMs = 24 * 60 * 60 * 1000; // 1 day
          break;
        case "3m":
          startDate.setMonth(now.getMonth() - 3);
          points = 90;
          intervalMs = 24 * 60 * 60 * 1000; // 1 day
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          points = 365;
          intervalMs = 24 * 60 * 60 * 1000; // 1 day
          break;
      }
      
      // Generate timeline based on actual investment dates
      const data = [];
      let portfolioValue = 0;
      
      for (let i = 0; i < points; i++) {
        const timestamp = new Date(now.getTime() - (points - i) * intervalMs);
        
        // Calculate portfolio value at this point in time
        portfolioValue = 0;
        for (const holding of holdings) {
          const holdingCreatedAt = new Date(holding.createdAt || now);
          
          // Only include holdings that existed at this timestamp
          if (holdingCreatedAt <= timestamp) {
            // Use a simplified calculation - actual holding value at that time
            const holdingValue = parseFloat(holding.totalValue || "0");
            portfolioValue += holdingValue;
          }
        }
        
        data.push({
          timestamp,
          value: portfolioValue
        });
      }
      
      // Ensure the final point shows current actual value
      if (data.length > 0) {
        data[data.length - 1].value = currentValue;
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Search stocks - UPDATED TO USE REAL FINNHUB API
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      console.log(`Searching for stocks with query: "${query}"`);
      
      // Use Finnhub symbol lookup API
      const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
      const response = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
      );

      if (!response.ok) {
        console.error(`Finnhub search API error: ${response.status}`);
        return res.status(500).json({ error: "Search service unavailable" });
      }

      const data = await response.json();
      console.log(`Finnhub returned ${data.result?.length || 0} search results`);

      if (data.result && Array.isArray(data.result)) {
        // Filter and format results
        const searchResults = data.result
          .filter((item: any) => 
            item.symbol && 
            item.description && 
            item.type === "Common Stock" &&
            !item.symbol.includes(".") // Remove foreign exchanges
          )
          .slice(0, 20) // Limit to 20 results
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.description
          }));

        console.log(`Returning ${searchResults.length} filtered results`);
        res.json(searchResults);
      } else {
        console.log("No results found or invalid response format");
        res.json([]);
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Stock detail route - NEW ENDPOINT
  app.get("/api/stocks/:symbol/detail", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      
      // Get basic stock data
      const stockData = await getStockData(symbol);
      if (!stockData) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Get company profile from Finnhub
      const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
      const profileResponse = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
      );

      let companyProfile: any = {};
      if (profileResponse.ok) {
        companyProfile = await profileResponse.json();
      }

      // Combine stock data with company profile
      const stockDetail = {
        ...stockData,
        logo: companyProfile.logo || "",
        weburl: companyProfile.weburl || "",
        industry: companyProfile.finnhubIndustry || "",
        exchange: companyProfile.exchange || "",
        marketCapitalization: companyProfile.marketCapitalization || 0,
        shareOutstanding: companyProfile.shareOutstanding || 0,
        country: companyProfile.country || "US"
      };

      res.json(stockDetail);
    } catch (error) {
      console.error("Error fetching stock detail:", error);
      res.status(500).json({ error: "Failed to fetch stock details" });
    }
  });

  // User profile routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Only allow specific profile fields to be updated
      const allowedFields = ['fullName', 'email', 'phone', 'location'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      const updatedUser = await storage.updateUser(userId, filteredUpdates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}