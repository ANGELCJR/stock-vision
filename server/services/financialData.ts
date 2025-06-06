interface StockData {
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

interface HistoricalDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Finnhub API integration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "demo";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

export async function getStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.c && data.c > 0) {
      const currentPrice = data.c;
      const previousClose = data.pc;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol: symbol.toUpperCase(),
        name: getCompanyName(symbol),
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: 0,
        previousClose: previousClose,
        dayHigh: data.h,
        dayLow: data.l
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

export async function getHistoricalData(symbol: string, period: string): Promise<HistoricalDataPoint[]> {
  return getMockHistoricalData(symbol, period);
}

function getMockHistoricalData(symbol: string, period: string): HistoricalDataPoint[] {
  const basePrice = 150;
  const points = period === "1d" ? 78 : period === "1w" ? 7 : period === "1m" ? 30 : 365;
  const intervalMs = period === "1d" ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
  
  const data: HistoricalDataPoint[] = [];
  let currentPrice = basePrice * 0.95;
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 0.03;
    const open = currentPrice;
    const close = currentPrice * (1 + variance);
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    
    data.push({
      timestamp: new Date(Date.now() - (points - i) * intervalMs),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
    
    currentPrice = close;
  }
  
  return data;
}

export function getCompanyName(symbol: string): string {
  const companyNames: Record<string, string> = {
    "AAPL": "Apple Inc.",
    "NVDA": "NVIDIA Corporation",
    "TSLA": "Tesla, Inc.",
    "GOOGL": "Alphabet Inc.",
    "MSFT": "Microsoft Corporation",
    "AMZN": "Amazon.com Inc.",
    "META": "Meta Platforms Inc.",
    "NFLX": "Netflix Inc.",
    "AMD": "Advanced Micro Devices Inc.",
    "INTC": "Intel Corporation"
  };
  
  return companyNames[symbol] || `${symbol} Corporation`;
}