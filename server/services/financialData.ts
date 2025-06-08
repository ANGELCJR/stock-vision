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

export async function getStockData(symbol: string): Promise<StockData | null> {
  try {
    // For demo purposes, return mock data
    return getMockStockData(symbol);
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

export async function getHistoricalData(symbol: string, period: string): Promise<HistoricalDataPoint[]> {
  try {
    return getMockHistoricalData(symbol, period);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

function getMockStockData(symbol: string): StockData {
  const basePrice = 100 + (symbol.charCodeAt(0) - 65) * 10;
  const variation = (Math.random() - 0.5) * 20;
  const price = basePrice + variation;
  const change = variation;
  const changePercent = (change / (price - change)) * 100;

  return {
    symbol,
    name: getCompanyName(symbol),
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
    previousClose: Math.round((price - change) * 100) / 100,
    dayHigh: Math.round((price + Math.random() * 5) * 100) / 100,
    dayLow: Math.round((price - Math.random() * 5) * 100) / 100
  };
}

function getMockHistoricalData(symbol: string, period: string): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  const periods = period === "1d" ? 24 : period === "1w" ? 7 : period === "1m" ? 30 : 365;
  const interval = period === "1d" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  const basePrice = 100 + (symbol.charCodeAt(0) - 65) * 10;

  for (let i = periods; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * interval));
    const variation = Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 2;
    const price = basePrice + variation;
    
    data.push({
      timestamp,
      open: Math.round((price - 1 + Math.random() * 2) * 100) / 100,
      high: Math.round((price + Math.random() * 3) * 100) / 100,
      low: Math.round((price - Math.random() * 3) * 100) / 100,
      close: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 5000000) + 500000
    });
  }

  return data;
}

export function getCompanyName(symbol: string): string {
  const companies: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    'NFLX': 'Netflix Inc.',
    'CRM': 'Salesforce Inc.',
    'ORCL': 'Oracle Corporation'
  };

  return companies[symbol] || `${symbol} Corporation`;
}