import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioPerformance } from "@/hooks/usePortfolio";
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
  portfolioId: number;
}

const timePeriods = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" }
];

export default function PerformanceChart({ portfolioId }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("1d");
  const { data: performanceData = [], isLoading } = usePortfolioPerformance(portfolioId, selectedPeriod);

  const formatTooltipValue = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    if (selectedPeriod === "1d") {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Portfolio Performance</CardTitle>
            <p className="text-gray-400 text-sm">Real-time portfolio tracking</p>
          </div>
          <div className="flex space-x-2">
            {timePeriods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className={
                  selectedPeriod === period.value
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-400 hover:text-white hover:bg-dark-tertiary"
                }
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxisLabel}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [formatTooltipValue(value), 'Portfolio Value']}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
