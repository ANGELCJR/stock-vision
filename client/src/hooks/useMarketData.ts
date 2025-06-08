import { useQuery } from "@tanstack/react-query";
import type { StockData, HistoricalDataPoint, SearchResult } from "@/types";

export function useStockData(symbol: string) {
  return useQuery<StockData>({
    queryKey: ["/api/stocks", symbol],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStockHistory(symbol: string, period: string = "1d") {
  return useQuery<HistoricalDataPoint[]>({
    queryKey: ["/api/stocks", symbol, "history", period],
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp)
    }))
  });
}

export function useStockSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(query)}`],
    enabled: query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
