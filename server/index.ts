export interface PerformanceDataPoint {
  timestamp: Date;
  totalValue: number;
  totalGainLoss: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
}

export interface NewsArticle {
  title: string;
  summary: string;
  sentiment: "bullish" | "bearish" | "neutral";
  relevantSymbols: string[];
  source: string;
  url: string;
  publishedAt: Date;
}

export interface AnalysisInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  confidence: number;
}