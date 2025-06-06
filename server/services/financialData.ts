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
    // Use Finnhub for stock quotes
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.c && data.c > 0) { // 'c' is current price
      const currentPrice = data.c;
      const previousClose = data.pc;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
        symbol: symbol.toUpperCase(),
        name: getCompanyName(symbol), // Use existing function for company name
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: 0, // Finnhub quote doesn't include volume
        previousClose: previousClose,
        dayHigh: data.h,
        dayLow: data.l
      };
    }
    
    // Fallback to mock data if API fails or returns empty
    return getMockStockData(symbol);
    
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return getMockStockData(symbol);
  }
}

export async function getHistoricalData(symbol: string, period: string): Promise<HistoricalDataPoint[]> {
  try {
    // Finnhub provides historical data with different endpoints
    // For now, return mock historical data since Finnhub requires different endpoints for historical data
    console.log(`Generating historical data for ${symbol} (${period})`);
    return getMockHistoricalData(symbol, period);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return getMockHistoricalData(symbol, period);
  }
}

// Mock data for demonstration when API is unavailable
function getMockStockData(symbol: string): StockData {
  const mockData: Record<string, StockData> = {
    "AAPL": {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 178.91,
      change: 2.34,
      changePercent: 1.32,
      volume: 45628000,
      marketCap: 2800000000000,
      previousClose: 176.57,
      dayHigh: 179.45,
      dayLow: 176.23
    },
    "NVDA": {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      price: 891.23,
      change: 15.67,
      changePercent: 1.79,
      volume: 32451000,
      marketCap: 2200000000000,
      previousClose: 875.56,
      dayHigh: 895.78,
      dayLow: 887.12
    },
    "TSLA": {
      symbol: "TSLA",
      name: "Tesla, Inc.",
      price: 243.84,
      change: -5.22,
      changePercent: -2.10,
      volume: 67892000,
      marketCap: 775000000000,
      previousClose: 249.06,
      dayHigh: 248.91,
      dayLow: 242.15
    },
    "GOOGL": {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 139.47,
      change: 1.82,
      changePercent: 1.32,
      volume: 28934000,
      marketCap: 1750000000000,
      previousClose: 137.65,
      dayHigh: 140.12,
      dayLow: 138.23
    },
    "MSFT": {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      price: 415.23,
      change: 3.45,
      changePercent: 0.84,
      volume: 19876000,
      marketCap: 3100000000000,
      previousClose: 411.78,
      dayHigh: 416.89,
      dayLow: 413.12
    }
  };

  return mockData[symbol] || {
    symbol,
    name: `${symbol} Corporation`,
    price: Math.random() * 200 + 50,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 50000000) + 1000000
  };
}

function getMockHistoricalData(symbol: string, period: string): HistoricalDataPoint[] {
  const basePrice = getMockStockData(symbol).price;
  const points = period === "1d" ? 78 : period === "1w" ? 7 : period === "1m" ? 30 : period === "3m" ? 90 : 365;
  const intervalMs = period === "1d" ? 5 * 60 * 1000 : 24 * 60 * 60 * 1000;
  
  const data: HistoricalDataPoint[] = [];
  let currentPrice = basePrice * 0.95; // Start slightly lower
  
  for (let i = 0; i < points; i++) {
    const variance = (Math.random() - 0.5) * 0.03; // 3% variance
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

// Company name lookup
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
