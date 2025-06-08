import { useState } from "react";
import { TrendingUp, BarChart3, PieChart, Calculator, Target, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePortfolio, useHoldings } from "@/hooks/usePortfolio";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadialBarChart, RadialBar,
  ComposedChart, ReferenceLine
} from "recharts";

export default function Analytics() {
  const { data: portfolio } = usePortfolio(1);
  const { data: holdings = [] } = useHoldings(1);
  const [selectedMetric, setSelectedMetric] = useState("returns");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1y");

  // Advanced analytics calculations
  const totalValue = parseFloat(portfolio?.totalValue || "0");
  const totalGainLoss = parseFloat(portfolio?.totalGainLoss || "0");

  // Monte Carlo simulation data for risk analysis
  const monteCarloData = Array.from({ length: 252 }, (_, i) => {
    const baseValue = 100;
    const dailyReturn = (Math.random() - 0.5) * 0.04; // ±2% daily volatility
    const cumulativeReturn = Math.exp(dailyReturn * (i + 1));
    return {
      day: i + 1,
      scenario1: baseValue * cumulativeReturn * (1 + Math.random() * 0.1),
      scenario2: baseValue * cumulativeReturn * (1 + Math.random() * 0.05),
      scenario3: baseValue * cumulativeReturn * (1 - Math.random() * 0.05),
      expected: baseValue * cumulativeReturn
    };
  });

  // Correlation matrix data
  const correlationData = [
    { asset: "AAPL", aapl: 1.00, nvda: 0.67, tsla: 0.45, googl: 0.72, msft: 0.78 },
    { asset: "NVDA", aapl: 0.67, nvda: 1.00, tsla: 0.52, googl: 0.64, msft: 0.69 },
    { asset: "TSLA", aapl: 0.45, nvda: 0.52, tsla: 1.00, googl: 0.48, msft: 0.51 },
    { asset: "GOOGL", aapl: 0.72, nvda: 0.64, tsla: 0.48, googl: 1.00, msft: 0.81 },
    { asset: "MSFT", aapl: 0.78, nvda: 0.69, tsla: 0.51, googl: 0.81, msft: 1.00 }
  ];

  // Sharpe ratio analysis over time
  const sharpeData = [
    { month: "Jan", sharpe: 1.42, benchmark: 0.89 },
    { month: "Feb", sharpe: 1.38, benchmark: 0.92 },
    { month: "Mar", sharpe: 1.56, benchmark: 0.87 },
    { month: "Apr", sharpe: 1.49, benchmark: 0.94 },
    { month: "May", sharpe: 1.63, benchmark: 0.91 },
    { month: "Jun", sharpe: 1.71, benchmark: 0.96 }
  ];

  // Beta analysis by holding
  const betaAnalysis = holdings.map(holding => ({
    symbol: holding.symbol,
    beta: Math.random() * 1.5 + 0.5, // Random beta between 0.5 and 2.0
    alpha: (Math.random() - 0.5) * 10, // Random alpha between -5% and +5%
    rSquared: Math.random() * 0.4 + 0.6, // R² between 0.6 and 1.0
    weight: totalValue > 0 ? (parseFloat(holding.totalValue) / totalValue) * 100 : 0
  }));

  // Value at Risk (VaR) scenarios
  const varScenarios = [
    { confidence: "95%", oneDay: "-2.3%", oneWeek: "-5.1%", oneMonth: "-8.7%" },
    { confidence: "99%", oneDay: "-3.8%", oneWeek: "-7.9%", oneMonth: "-13.2%" },
    { confidence: "99.9%", oneDay: "-5.4%", oneWeek: "-11.2%", oneMonth: "-18.6%" }
  ];

  // Efficient frontier data
  const efficientFrontierData = Array.from({ length: 20 }, (_, i) => ({
    risk: 5 + i * 1.5,
    return: 2 + i * 0.8 + Math.random() * 2,
    current: i === 12
  }));

  // Sector performance attribution
  const sectorAttribution = [
    { sector: "Technology", contribution: 8.7, weight: 68.2, performance: 12.8 },
    { sector: "Consumer", contribution: 1.8, weight: 15.4, performance: 11.7 },
    { sector: "Automotive", contribution: -0.4, weight: 12.8, performance: -3.1 },
    { sector: "Cash", contribution: 0.1, weight: 3.6, performance: 2.8 }
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Advanced Analytics</h1>
            <p className="text-slate-600 dark:text-muted-foreground">Quantitative analysis and risk modeling for your portfolio</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card dark:bg-dark-secondary border-border">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-dark-secondary border-border">
                <SelectItem value="returns">Returns Analysis</SelectItem>
                <SelectItem value="risk">Risk Metrics</SelectItem>
                <SelectItem value="correlation">Correlation</SelectItem>
                <SelectItem value="attribution">Attribution</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-full sm:w-[120px] bg-card dark:bg-dark-secondary border-border">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-dark-secondary border-border">
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="2y">2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="risk-analysis" className="space-y-6">
          <TabsList className="bg-card dark:bg-dark-secondary">
            <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Attribution</TabsTrigger>
            <TabsTrigger value="modeling">Quantitative Models</TabsTrigger>
            <TabsTrigger value="optimization">Portfolio Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="risk-analysis" className="space-y-6">
            {/* Value at Risk */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-900 dark:text-foreground">
                  <Calculator className="h-5 w-5" />
                  <span>Value at Risk (VaR) Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4 text-slate-900 dark:text-foreground">VaR Estimates</h4>
                    <div className="space-y-3">
                      {varScenarios.map((scenario, index) => (
                        <div key={index} className="p-3 bg-muted dark:bg-dark-tertiary rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-slate-900 dark:text-foreground">{scenario.confidence} Confidence</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500 dark:text-muted-foreground">1 Day</p>
                              <p className="text-red-400 font-mono">{scenario.oneDay}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-muted-foreground">1 Week</p>
                              <p className="text-red-400 font-mono">{scenario.oneWeek}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-muted-foreground">1 Month</p>
                              <p className="text-red-400 font-mono">{scenario.oneMonth}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4 text-slate-900 dark:text-foreground">Monte Carlo Simulation</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monteCarloData.slice(0, 50)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="day" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Line type="monotone" dataKey="scenario1" stroke="#EF4444" strokeWidth={1} dot={false} />
                          <Line type="monotone" dataKey="scenario2" stroke="#F59E0B" strokeWidth={1} dot={false} />
                          <Line type="monotone" dataKey="scenario3" stroke="#10B981" strokeWidth={1} dot={false} />
                          <Line type="monotone" dataKey="expected" stroke="#3B82F6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beta Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card dark:bg-dark-secondary border-border">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-foreground">Beta & Alpha Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {betaAnalysis.map((asset, index) => (
                      <div key={index} className="p-3 bg-muted dark:bg-dark-tertiary rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-900 dark:text-foreground">{asset.symbol}</span>
                          <span className="text-sm text-slate-500 dark:text-muted-foreground">{asset.weight.toFixed(1)}% weight</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-muted-foreground">Beta</p>
                            <p className="font-mono text-slate-800 dark:text-foreground">{asset.beta.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-muted-foreground">Alpha</p>
                            <p className={`font-mono ${asset.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.alpha >= 0 ? '+' : ''}{asset.alpha.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-muted-foreground">R²</p>
                            <p className="font-mono text-slate-800 dark:text-foreground">{asset.rSquared.toFixed(3)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card dark:bg-dark-secondary border-border">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-foreground">Sharpe Ratio Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={sharpeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="sharpe" fill="#3B82F6" name="Portfolio Sharpe" />
                        <Line type="monotone" dataKey="benchmark" stroke="#10B981" strokeWidth={2} name="Benchmark" />
                        <ReferenceLine y={1.0} stroke="#F59E0B" strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm">
                    <p className="text-slate-600 dark:text-muted-foreground">Current Sharpe Ratio: <span className="text-slate-900 dark:text-foreground font-mono">1.71</span></p>
                    <p className="text-slate-600 dark:text-muted-foreground">Benchmark: <span className="text-green-400 font-mono">0.96</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Attribution */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-foreground">Sector Attribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectorAttribution} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#64748B" />
                        <YAxis dataKey="sector" type="category" stroke="#64748B" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="contribution" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {sectorAttribution.map((sector, index) => (
                      <div key={index} className="p-3 bg-muted dark:bg-dark-tertiary rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-900 dark:text-foreground">{sector.sector}</span>
                          <span className="text-sm text-slate-500 dark:text-muted-foreground">{sector.weight.toFixed(1)}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-muted-foreground">Performance</p>
                            <p className={`font-mono ${sector.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-muted-foreground">Contribution</p>
                            <p className={`font-mono ${sector.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {sector.contribution >= 0 ? '+' : ''}{sector.contribution.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modeling" className="space-y-6">
            {/* Correlation Matrix */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-foreground">Asset Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-slate-500 dark:text-muted-foreground">Asset</th>
                        {correlationData[0] && Object.keys(correlationData[0]).slice(1).map(key => (
                          <th key={key} className="text-center p-2 text-slate-500 dark:text-muted-foreground font-mono">
                            {key.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlationData.map((row, index) => (
                        <tr key={index}>
                          <td className="p-2 font-medium text-slate-900 dark:text-foreground">{row.asset}</td>
                          {Object.entries(row).slice(1).map(([key, value]) => (
                            <td key={key} className="text-center p-2">
                              <span className={`font-mono px-2 py-1 rounded text-xs ${
                                value === 1.00 ? 'bg-blue-500/20 text-blue-400' :
                                value >= 0.7 ? 'bg-red-500/20 text-red-400' :
                                value >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {value.toFixed(2)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            {/* Efficient Frontier */}
            <Card className="bg-card dark:bg-dark-secondary border-border">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-foreground">Efficient Frontier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={efficientFrontierData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="risk" 
                        stroke="#64748B"
                        label={{ value: 'Risk (%)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        dataKey="return" 
                        stroke="#64748B"
                        label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                      <Scatter 
                        dataKey="return" 
                        fill={(entry) => entry.current ? '#EF4444' : '#3B82F6'}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-muted dark:bg-dark-tertiary rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-muted-foreground mb-2">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Efficient portfolios
                  </p>
                  <p className="text-sm text-slate-600 dark:text-muted-foreground">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Current portfolio position
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}