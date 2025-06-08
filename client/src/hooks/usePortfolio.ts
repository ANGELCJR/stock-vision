import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Portfolio, Holding } from "@shared/schema";
import type { PerformanceDataPoint } from "@/types";

export function usePortfolio(portfolioId?: number) {
  // If no portfolioId provided, get user's first portfolio
  const portfoliosQuery = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolios"],
    queryFn: async () => {
      const response = await fetch("/api/portfolios");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      return response.json();
    },
    enabled: !portfolioId
  });

  const specificPortfolioQuery = useQuery<Portfolio>({
    queryKey: ["/api/portfolios", portfolioId],
    queryFn: async () => {
      const response = await fetch(`/api/portfolios/${portfolioId}`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return response.json();
    },
    enabled: !!portfolioId
  });

  if (portfolioId) {
    return specificPortfolioQuery;
  }

  // Return the first portfolio from the user's portfolios
  return {
    ...portfoliosQuery,
    data: portfoliosQuery.data?.[0]
  };
}

export function useHoldings(portfolioId?: number) {
  // Get user's portfolio if no specific ID provided
  const portfolioQuery = usePortfolio();
  const actualPortfolioId = portfolioId || portfolioQuery.data?.id;

  return useQuery<Holding[]>({
    queryKey: ["/api/portfolios", actualPortfolioId, "holdings"],
    queryFn: async () => {
      if (!actualPortfolioId) throw new Error("No portfolio ID available");
      const response = await fetch(`/api/portfolios/${actualPortfolioId}/holdings`);
      if (!response.ok) throw new Error("Failed to fetch holdings");
      return response.json();
    },
    enabled: !!actualPortfolioId
  });
}

export function usePortfolioPerformance(portfolioId?: number, period: string = "1d") {
  // Get user's portfolio if no specific ID provided
  const portfolioQuery = usePortfolio();
  const actualPortfolioId = portfolioId || portfolioQuery.data?.id;

  return useQuery<PerformanceDataPoint[]>({
    queryKey: ["/api/portfolios", actualPortfolioId, "performance", period],
    queryFn: async () => {
      if (!actualPortfolioId) throw new Error("No portfolio ID available");
      const response = await fetch(`/api/portfolios/${actualPortfolioId}/performance?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch performance data");
      const data = await response.json();
      return data.map((point: any) => ({
        ...point,
        timestamp: new Date(point.timestamp)
      }));
    },
    enabled: !!actualPortfolioId
  });
}

export function useAddHolding() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { portfolioId: number; symbol: string; name: string; shares: string; avgPrice: string }) => {
      const response = await apiRequest("POST", `/api/portfolios/${data.portfolioId}/holdings`, data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", variables.portfolioId, "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", variables.portfolioId] });
    }
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holdingId: number) => {
      const response = await apiRequest("DELETE", `/api/holdings/${holdingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
    }
  });
}
