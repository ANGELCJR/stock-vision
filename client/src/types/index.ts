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

export interface HistoricalDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  value: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
}

export interface AIInsightData {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  confidence: number;
}
