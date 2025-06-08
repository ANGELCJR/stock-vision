import { useQuery } from "@tanstack/react-query";

export function useStockData(symbol: string) {
  return useQuery({
    queryKey: ["/api/stocks", symbol],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch stock data");
      return response.json();
    },
    enabled: !!symbol,
  });
}

export function useStockHistory(symbol: string, period: string = "1d") {
  return useQuery({
    queryKey: ["/api/stocks", symbol, "history", period],
    queryFn: async () => {
      const response = await fetch(`/api/stocks/${symbol}/history?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch stock history");
      return response.json();
    },
    enabled: !!symbol,
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ["/api/search/stocks", query],
    queryFn: async () => {
      if (!query || query.length < 1) return [];
      const response = await fetch(`/api/search/stocks?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search stocks");
      return response.json();
    },
    enabled: query.length > 0,
  });
}