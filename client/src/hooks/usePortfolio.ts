import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Portfolio, Holding } from "@shared/schema";
import type { PerformanceDataPoint } from "@/types";

export function usePortfolio(portfolioId: number = 1) {
  return useQuery<Portfolio>({
    queryKey: ["/api/portfolios", portfolioId],
    queryFn: async () => {
      const response = await fetch(`/api/portfolios/${portfolioId}`);
      if (!response.ok) throw new Error("Failed to fetch portfolio");
      return response.json();
    }
  });
}

export function useHoldings(portfolioId: number = 1) {
  return useQuery<Holding[]>({
    queryKey: ["/api/portfolios", portfolioId, "holdings"],
    queryFn: async () => {
      const response = await fetch(`/api/portfolios/${portfolioId}/holdings`);
      if (!response.ok) throw new Error("Failed to fetch holdings");
      return response.json();
    }
  });
}

export function usePortfolioPerformance(portfolioId: number = 1, period: string = "1d") {
  return useQuery<PerformanceDataPoint[]>({
    queryKey: ["/api/portfolios", portfolioId, "performance", period],
    queryFn: async () => {
      const response = await fetch(`/api/portfolios/${portfolioId}/performance?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch performance data");
      const data = await response.json();
      return data.map((point: any) => ({
        ...point,
        timestamp: new Date(point.timestamp)
      }));
    }
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
