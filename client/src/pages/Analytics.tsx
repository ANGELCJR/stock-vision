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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
            <p className="text-gray-400">Quantitative analysis and risk modeling for your portfolio</p>
          </div>
          <div className="flex space-x-4">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[180px] bg-dark-secondary border-gray-700">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-gray-700">
                <SelectItem value="returns">Returns Analysis</SelectItem>
                <SelectItem value="risk">Risk Metrics</SelectItem>
                <SelectItem value="correlation">Correlation</SelectItem>
                <SelectItem value="attribution">Attribution</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[120px] bg-dark-secondary border-gray-700">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-dark-secondary border-gray-700">
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
          <TabsList className="bg-dark-secondary">
            <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Attribution</TabsTrigger>
            <TabsTrigger value="modeling">Quantitative Models</TabsTrigger>
            <TabsTrigger value="optimization">Portfolio Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="risk-analysis" className="space-y-6">
            {/* Value at Risk */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Value at Risk (VaR) Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">VaR Estimates</h4>
                    <div className="space-y-3">
                      {varScenarios.map((scenario, index) => (
                        <div key={index} className="p-3 bg-dark-tertiary rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{scenario.confidence} Confidence</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">1 Day</p>
                              <p className="text-red-400 font-mono">{scenario.oneDay}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">1 Week</p>
                              <p className="text-red-400 font-mono">{scenario.oneWeek}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">1 Month</p>
                              <p className="text-red-400 font-mono">{scenario.oneMonth}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Monte Carlo Simulation</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monteCarloData.slice(0, 50)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="day" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1F2937',
                              border: '1px solid #374151',
                              borderRadius: '8px'
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
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Beta & Alpha Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {betaAnalysis.map((asset, index) => (
                      <div key={index} className="p-3 bg-dark-tertiary rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{asset.symbol}</span>
                          <span className="text-sm text-gray-400">{asset.weight.toFixed(1)}% weight</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Beta</p>
                            <p className="font-mono">{asset.beta.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Alpha</p>
                            <p className={`font-mono ${asset.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.alpha >= 0 ? '+' : ''}{asset.alpha.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">R²</p>
                            <p className="font-mono">{asset.rSquared.toFixed(3)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Sharpe Ratio Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={sharpeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="sharpe" fill="#3B82F6" name="Portfolio Sharpe" />
                        <Line type="monotone" dataKey="benchmark" stroke="#10B981" strokeWidth={2} name="Benchmark" />
                        <ReferenceLine y={1.0} stroke="#F59E0B" strokeDasharray="5 5" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    <p>Current Sharpe Ratio: <span className="text-white font-mono">1.71</span></p>
                    <p>Benchmark: <span className="text-green-400 font-mono">0.96</span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Attribution */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Sector Attribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectorAttribution} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9CA3AF" />
                        <YAxis dataKey="sector" type="category" stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="contribution" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {sectorAttribution.map((sector, index) => (
                      <div key={index} className="p-3 bg-dark-tertiary rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{sector.sector}</span>
                          <span className={`font-mono ${sector.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sector.contribution >= 0 ? '+' : ''}{sector.contribution.toFixed(2)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Weight: {sector.weight.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Performance: {sector.performance.toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rolling Returns */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Rolling Returns Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: "Jan", rolling12m: 28.5, rolling6m: 15.2, rolling3m: 8.7 },
                      { month: "Feb", rolling12m: 31.2, rolling6m: 18.4, rolling3m: 12.1 },
                      { month: "Mar", rolling12m: 29.8, rolling6m: 16.7, rolling3m: 9.8 },
                      { month: "Apr", rolling12m: 33.1, rolling6m: 21.3, rolling3m: 14.5 },
                      { month: "May", rolling12m: 35.7, rolling6m: 23.8, rolling3m: 16.9 },
                      { month: "Jun", rolling12m: 34.5, rolling6m: 22.4, rolling3m: 15.2 }
                    ]}>
                      <defs>
                        <linearGradient id="rolling12m" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="rolling6m" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="rolling12m" stroke="#3B82F6" fill="url(#rolling12m)" />
                      <Area type="monotone" dataKey="rolling6m" stroke="#10B981" fill="url(#rolling6m)" />
                      <Line type="monotone" dataKey="rolling3m" stroke="#F59E0B" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modeling" className="space-y-6">
            {/* Correlation Matrix */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Asset Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-gray-400">Asset</th>
                        {holdings.slice(0, 5).map(holding => (
                          <th key={holding.symbol} className="text-center p-2 text-gray-400">{holding.symbol}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlationData.map((row, i) => (
                        <tr key={i} className="border-t border-gray-700">
                          <td className="p-2 font-medium">{row.asset}</td>
                          <td className="p-2 text-center font-mono">{row.aapl.toFixed(2)}</td>
                          <td className="p-2 text-center font-mono">{row.nvda.toFixed(2)}</td>
                          <td className="p-2 text-center font-mono">{row.tsla.toFixed(2)}</td>
                          <td className="p-2 text-center font-mono">{row.googl.toFixed(2)}</td>
                          <td className="p-2 text-center font-mono">{row.msft.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Factor Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Factor Exposure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Market Factor</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="font-mono text-sm">0.85</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Size Factor (SMB)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="font-mono text-sm">-0.35</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Value Factor (HML)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="font-mono text-sm">-0.60</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Momentum Factor</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="font-mono text-sm">0.75</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-secondary border-gray-700">
                <CardHeader>
                  <CardTitle>Regression Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">R-Squared:</span>
                    <span className="font-mono">0.847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Adjusted R-Squared:</span>
                    <span className="font-mono">0.832</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Standard Error:</span>
                    <span className="font-mono">3.24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Information Ratio:</span>
                    <span className="font-mono text-green-400">1.89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tracking Error:</span>
                    <span className="font-mono">4.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treynor Ratio:</span>
                    <span className="font-mono text-green-400">18.3</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            {/* Efficient Frontier */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Efficient Frontier Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={efficientFrontierData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="risk" stroke="#9CA3AF" name="Risk (%)" />
                        <YAxis dataKey="return" stroke="#9CA3AF" name="Return (%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Scatter data={efficientFrontierData.filter(d => !d.current)} fill="#3B82F6" />
                        <Scatter data={efficientFrontierData.filter(d => d.current)} fill="#F59E0B" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">Current Portfolio</h4>
                      <div className="space-y-1 text-sm">
                        <p>Expected Return: <span className="font-mono">22.8%</span></p>
                        <p>Volatility: <span className="font-mono">18.7%</span></p>
                        <p>Sharpe Ratio: <span className="font-mono">1.71</span></p>
                      </div>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Optimal Portfolio</h4>
                      <div className="space-y-1 text-sm">
                        <p>Expected Return: <span className="font-mono">24.1%</span></p>
                        <p>Volatility: <span className="font-mono">16.2%</span></p>
                        <p>Sharpe Ratio: <span className="font-mono">2.03</span></p>
                      </div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Optimize Portfolio
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rebalancing Recommendations */}
            <Card className="bg-dark-secondary border-gray-700">
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Current vs Optimal Allocation</h4>
                    <div className="space-y-3">
                      {holdings.map((holding, index) => {
                        const currentWeight = totalValue > 0 ? (parseFloat(holding.totalValue) / totalValue) * 100 : 0;
                        const optimalWeight = currentWeight * (0.8 + Math.random() * 0.4); // Simulated optimal
                        const difference = optimalWeight - currentWeight;
                        
                        return (
                          <div key={index} className="p-3 bg-dark-tertiary rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{holding.symbol}</span>
                              <span className={`text-sm ${difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Current: {currentWeight.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Optimal: {optimalWeight.toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Risk-Return Optimization</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <h5 className="text-yellow-400 font-medium text-sm mb-1">Reduce Concentration</h5>
                        <p className="text-xs text-gray-300">Decrease NVDA position from 31% to 20% to reduce single-stock risk</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <h5 className="text-blue-400 font-medium text-sm mb-1">Add Defensive Assets</h5>
                        <p className="text-xs text-gray-300">Include 15% bonds or REITs to improve risk-adjusted returns</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <h5 className="text-green-400 font-medium text-sm mb-1">Sector Diversification</h5>
                        <p className="text-xs text-gray-300">Add healthcare and energy exposure to reduce correlation</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Optimization
                    </Button>
                  </div>
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