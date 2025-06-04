import { useQuery } from "@tanstack/react-query";
import type { MarketNews } from "@shared/schema";

export function useMarketNews(symbols?: string[], limit: number = 10) {
  const queryParams = new URLSearchParams();
  if (symbols && symbols.length > 0) {
    queryParams.set("symbols", symbols.join(","));
  }
  queryParams.set("limit", limit.toString());
  
  return useQuery<MarketNews[]>({
    queryKey: ["/api/news", symbols, limit],
    queryFn: async () => {
      const response = await fetch(`/api/news?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch market news");
      const data = await response.json();
      return data.map((news: any) => ({
        ...news,
        publishedAt: new Date(news.publishedAt),
        createdAt: new Date(news.createdAt)
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}