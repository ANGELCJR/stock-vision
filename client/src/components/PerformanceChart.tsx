import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioPerformance, useHoldings } from "@/hooks/usePortfolio";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

interface PerformanceChartProps {
  portfolioId?: number;
}

const timePeriods = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "1Y", value: "1y" }
];

export default function PerformanceChart({ portfolioId }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1d");
  const [chartType, setChartType] = useState<"line" | "area">("area");
  
  const { data: performanceData = [], isLoading } = usePortfolioPerformance(portfolioId, selectedPeriod);
  const { data: holdings = [] } = useHoldings(portfolioId);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  const formatTooltipValue = (value: number, name: string) => {
    if (name === "totalValue") {
      return [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Portfolio Value"];
    }
    if (name === "totalGainLoss") {
      return [`${value >= 0 ? '+' : ''}$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Gain/Loss"];
    }
    return [value, name];
  };

  const formatXAxisTick = (timestamp: string) => {
    const date = new Date(timestamp);
    if (selectedPeriod === "1d") {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-gray-900 dark:text-white">Portfolio Performance</CardTitle>
        <div className="flex space-x-2">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
            {timePeriods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 text-sm ${
                  selectedPeriod === period.value
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {period.label}
              </Button>
            ))}
          </div>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-50 dark:bg-gray-700">
            <Button
              variant={chartType === "area" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("area")}
              className={`px-3 py-1 text-sm ${
                chartType === "area"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Area
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-sm ${
                chartType === "line"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              Line
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <p className="text-gray-500 dark:text-gray-400">Add stocks to your portfolio to see performance data</p>
          </div>
        ) : performanceData.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-600" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisTick}
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                  />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalValue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#portfolioGradient)"
                  />
                </AreaChart>
              ) : (
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-600" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatXAxisTick}
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                  />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalValue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalGainLoss"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}