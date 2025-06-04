import { useState } from "react";
import { TrendingUp, PieChart, BarChart3, Target, DollarSign, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePortfolio, useHoldings } from "@/hooks/usePortfolio";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, AreaChart } from "recharts";

export default function Portfolio() {
  const { data: portfolio } = usePortfolio(1);
  const { data: holdings = [] } = useHoldings(1);
  const [selectedPeriod, setSelectedPeriod] = useState("1m");

  // Calculate portfolio metrics
  const totalValue = parseFloat(portfolio?.totalValue || "0");
  const totalGainLoss = parseFloat(portfolio?.totalGainLoss || "0");
  const portfolioReturn = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Prepare data for charts
  const sectorData = [
    { name: "Technology", value: 68.2, color: "#3B82F6" },
    { name: "Consumer", value: 15.4, color: "#10B981" },
    { name: "Automotive", value: 12.8, color: "#F59E0B" },
    { name: "Cash", value: 3.6, color: "#6B7280" }
  ];

  const holdingsData = holdings.map(holding => ({
    symbol: holding.symbol,
    value: parseFloat(holding.totalValue),
    percentage: totalValue > 0 ? (parseFloat(holding.totalValue) / totalValue) * 100 : 0,
    gainLoss: parseFloat(holding.gainLoss),
    gainLossPercent: parseFloat(holding.gainLossPercent)
  }));

  const performanceData = [
    { period: "1W", return: 2.3 },
    { period: "1M", return: 8.7 },
    { period: "3M", return: 15.2 },
    { period: "6M", return: 22.8 },
    { period: "1Y", return: 34.5 },
    { period: "2Y", return: 67.3 }
  ];

  const riskMetrics = [
    { metric: "Beta", value: "1.15", description: "Portfolio volatility vs market" },
    { metric: "Sharpe Ratio", value: "1.42", description: "Risk-adjusted returns" },
    { metric: "Max Drawdown", value: "-8.3%", description: "Largest peak-to-trough decline" },
    { metric: "Volatility", value: "18.7%", description: "Annual standard deviation" }
  ];

  const diversificationScore = 75;
  const concentrationRisk = holdings.length > 0 ? Math.max(...holdingsData.map(h => h.percentage)) : 0;

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio Analytics</h1>
            <p className="text-gray-400">Comprehensive analysis and insights for your investments</p>
          </div>
          <div className="flex space-x-2">
            {["1W", "1M", "3M", "6M", "1Y"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? "bg-blue-600" : "text-gray-400"}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-dark-secondary">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-dark-secondary border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Value</p>
                      <p className="text-2xl font-bold font-mono">${totalValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-green-400 text-sm mt-2">+${totalGainLoss.toLocaleString()} ({portfolioReturn.toFixed(2)}%)</p>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Holdings</p>
                      <p className="text-2xl font-bold">{holdings.length}</p>
                    </div>
                    <PieChart className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Across {sectorData.length} sectors</p>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Diversification</p>
                      <p className="text-2xl font-bold">{diversificationScore}%</p>
                    </div>
                    <Target className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="mt-2">
                    <Progress value={diversificationScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Risk Score</p>
                      <p className="text-2xl font-bold">{portfolio?.riskScore || "0.0"}/10</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-yellow-400 text-sm mt-2">Moderate Risk</p>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Top Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdingsData.slice(0, 5).map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-dark-tertiary rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {holding.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{holding.symbol}</p>
                            <p className="text-sm text-gray-400">{holding.percentage.toFixed(1)}% of portfolio</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">${holding.value.toLocaleString()}</p>
                          <p className={`text-sm ${holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="return" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Allocation */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Sector Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {sectorData.map((sector, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
                          <span className="text-sm">{sector.name}</span>
                        </div>
                        <span className="text-sm font-mono">{sector.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Asset Allocation Recommendations */}
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Allocation Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-orange-400 font-medium">High Concentration Risk</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Your largest position represents {concentrationRisk.toFixed(1)}% of your portfolio. 
                      Consider reducing exposure to maintain proper diversification.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 font-medium">Sector Overweight</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Technology allocation (68.2%) exceeds recommended range. 
                      Consider diversifying into healthcare, energy, or financial sectors.
                    </p>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-medium">Strong Performance</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Your portfolio has outperformed the S&P 500 by 8.3% this year. 
                      Consider taking some profits in top performers.
                    </p>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Get Rebalancing Recommendations
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Chart */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Portfolio Performance vs Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { date: "Jan", portfolio: 100, sp500: 100, nasdaq: 100 },
                      { date: "Feb", portfolio: 105, sp500: 102, nasdaq: 104 },
                      { date: "Mar", portfolio: 112, sp500: 108, nasdaq: 110 },
                      { date: "Apr", portfolio: 118, sp500: 111, nasdaq: 115 },
                      { date: "May", portfolio: 125, sp500: 114, nasdaq: 118 },
                      { date: "Jun", portfolio: 134, sp500: 117, nasdaq: 122 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="portfolio" stroke="#3B82F6" strokeWidth={2} name="Your Portfolio" />
                      <Line type="monotone" dataKey="sp500" stroke="#10B981" strokeWidth={2} name="S&P 500" />
                      <Line type="monotone" dataKey="nasdaq" stroke="#F59E0B" strokeWidth={2} name="NASDAQ" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Returns Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">1 Month:</span>
                    <span className="text-green-400 font-mono">+8.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">3 Months:</span>
                    <span className="text-green-400 font-mono">+15.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">1 Year:</span>
                    <span className="text-green-400 font-mono">+34.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annualized:</span>
                    <span className="text-green-400 font-mono">+28.3%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">vs S&P 500:</span>
                    <span className="text-green-400 font-mono">+8.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">vs NASDAQ:</span>
                    <span className="text-green-400 font-mono">+5.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">vs Russell 2000:</span>
                    <span className="text-green-400 font-mono">+12.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alpha:</span>
                    <span className="text-blue-400 font-mono">6.8%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Winning Days:</span>
                    <span className="text-green-400 font-mono">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Day:</span>
                    <span className="text-green-400 font-mono">+4.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Worst Day:</span>
                    <span className="text-red-400 font-mono">-3.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Daily:</span>
                    <span className="text-green-400 font-mono">+0.14%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6">
            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="bg-dark-secondary border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">{metric.metric}</p>
                      <p className="text-2xl font-bold font-mono mt-1">{metric.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Market Risk</span>
                        <span className="text-sm">High</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Concentration Risk</span>
                        <span className="text-sm">Medium</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Sector Risk</span>
                        <span className="text-sm">High</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Liquidity Risk</span>
                        <span className="text-sm">Low</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Risk Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-medium text-sm mb-1">High Priority</h4>
                    <p className="text-xs text-gray-300">Reduce technology sector exposure to below 50% of portfolio</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="text-orange-400 font-medium text-sm mb-1">Medium Priority</h4>
                    <p className="text-xs text-gray-300">Consider adding defensive positions or bonds to reduce volatility</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-blue-400 font-medium text-sm mb-1">Low Priority</h4>
                    <p className="text-xs text-gray-300">Monitor correlation between holdings to avoid clustering</p>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                    Generate Risk Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}