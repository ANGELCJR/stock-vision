import { useQuery } from "@tanstack/react-query";

export function useMarketNews(symbols?: string[], limit: number = 10) {
  const symbolsParam = symbols && symbols.length > 0 ? symbols.join(',') : '';
  
  return useQuery({
    queryKey: ["/api/news", symbolsParam, limit],
    queryFn: async () => {
      let url = `/api/news?limit=${limit}`;
      if (symbolsParam) {
        url += `&symbols=${symbolsParam}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch market news");
      return response.json();
    },
  });
}