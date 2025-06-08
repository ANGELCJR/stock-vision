import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for session-based authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for session-based users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolios table linked to session users
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull().default("0"),
  totalGainLoss: decimal("total_gain_loss", { precision: 12, scale: 2 }).notNull().default("0"),
  riskScore: decimal("risk_score", { precision: 3, scale: 1 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Holdings table for individual stock positions
export const holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  shares: decimal("shares", { precision: 12, scale: 4 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 12, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 2 }).notNull().default("0"),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull().default("0"),
  gainLoss: decimal("gain_loss", { precision: 12, scale: 2 }).notNull().default("0"),
  gainLossPercent: decimal("gain_loss_percent", { precision: 8, scale: 4 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock prices cache table
export const stockPrices = pgTable("stock_prices", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  change: decimal("change", { precision: 12, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 8, scale: 4 }).notNull(),
  volume: integer("volume").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Analysis insights table
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Market news table
export const marketNews = pgTable("market_news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  sentiment: text("sentiment").notNull(),
  relevantSymbols: text("relevant_symbols").array(),
  source: text("source").notNull(),
  url: text("url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
});

// Portfolio history for performance tracking
export const portfolioHistory = pgTable("portfolio_history", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  totalGainLoss: decimal("total_gain_loss", { precision: 12, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  name: true,
});

export const insertHoldingSchema = createInsertSchema(holdings).pick({
  portfolioId: true,
  symbol: true,
  name: true,
  shares: true,
  avgPrice: true,
});

export const insertStockPriceSchema = createInsertSchema(stockPrices).pick({
  symbol: true,
  price: true,
  change: true,
  changePercent: true,
  volume: true,
});

export const insertAIInsightSchema = createInsertSchema(aiInsights).pick({
  portfolioId: true,
  type: true,
  title: true,
  description: true,
  confidence: true,
});

export const insertMarketNewsSchema = createInsertSchema(marketNews).pick({
  title: true,
  summary: true,
  sentiment: true,
  relevantSymbols: true,
  source: true,
  url: true,
  publishedAt: true,
});

export const insertPortfolioHistorySchema = createInsertSchema(portfolioHistory).pick({
  portfolioId: true,
  totalValue: true,
  totalGainLoss: true,
});

// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;

export type InsertStockPrice = z.infer<typeof insertStockPriceSchema>;
export type StockPrice = typeof stockPrices.$inferSelect;

export type InsertAIInsight = z.infer<typeof insertAIInsightSchema>;
export type AIInsight = typeof aiInsights.$inferSelect;

export type InsertMarketNews = z.infer<typeof insertMarketNewsSchema>;
export type MarketNews = typeof marketNews.$inferSelect;

export type InsertPortfolioHistory = z.infer<typeof insertPortfolioHistorySchema>;
export type PortfolioHistory = typeof portfolioHistory.$inferSelect;