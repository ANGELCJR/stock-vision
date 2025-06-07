import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingUp, TrendingDown, Building, Globe, DollarSign } from "lucide-react";

interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  previousClose?: number;
  dayHigh?: number;
  dayLow?: number;
  logo?: string;
  weburl?: string;
  industry?: string;
  exchange?: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
  country?: string;
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [shares, setShares] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  // Fetch stock detail data
  const { data: stockDetail, isLoading, error } = useQuery<StockDetail>({
    queryKey: ["/api/stocks", symbol, "detail"],
    queryFn: () => apiRequest("GET", `/api/stocks/${symbol}/detail`).then(res => res.json()),
    enabled: !!symbol
  });

  // Auto-populate average price with current price
  useEffect(() => {
    if (stockDetail && !avgPrice) {
      setAvgPrice(stockDetail.price.toString());
    }
  }, [stockDetail, avgPrice]);

  // Add stock to portfolio mutation
  const addStockMutation = useMutation({
    mutationFn: async (data: { symbol: string; name: string; shares: string; avgPrice: string }) => {
      const response = await apiRequest("POST", "/api/portfolios/1/holdings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stock Added Successfully",
        description: `Added ${shares} shares of ${stockDetail?.symbol} to your portfolio`,
      });
      
      // Invalidate portfolio queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", 1, "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", 1] });
      
      // Navigate back to portfolio
      setLocation("/portfolio");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Stock",
        description: error.message || "There was an error adding the stock to your portfolio",
        variant: "destructive",
      });
    }
  });

  const handleAddStock = () => {
    if (!shares || !avgPrice || !stockDetail) {
      toast({
        title: "Missing Information",
        description: "Please enter both shares and average price",
        variant: "destructive",
      });
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(avgPrice);

    if (sharesNum <= 0 || priceNum <= 0) {
      toast({
        title: "Invalid Values",
        description: "Shares and price must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    addStockMutation.mutate({
      symbol: stockDetail.symbol,
      name: stockDetail.name,
      shares: shares,
      avgPrice: avgPrice
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !stockDetail) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Stock Not Found</h1>
          <p className="text-gray-600 mb-4">Unable to find information for symbol: {symbol}</p>
          <Button onClick={() => setLocation("/portfolio")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  const totalCost = shares && avgPrice ? parseFloat(shares) * parseFloat(avgPrice) : 0;
  const isPositive = stockDetail.change >= 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => setLocation("/portfolio")} 
          variant="outline" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Stock Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Stock Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                {stockDetail.logo && (
                  <img 
                    src={stockDetail.logo} 
                    alt={`${stockDetail.name} logo`}
                    className="w-12 h-12 rounded-lg"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-2xl">{stockDetail.symbol}</CardTitle>
                  <p className="text-lg text-gray-600">{stockDetail.name}</p>
                  {stockDetail.exchange && (
                    <Badge variant="secondary" className="mt-1">
                      {stockDetail.exchange}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Current Price</Label>
                  <p className="text-2xl font-bold">{formatCurrency(stockDetail.price)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Change</Label>
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-lg font-semibold">
                      {formatCurrency(stockDetail.change)} ({stockDetail.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Volume</Label>
                  <p className="text-lg font-semibold">{formatNumber(stockDetail.volume)}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Previous Close</Label>
                  <p className="text-lg font-semibold">{formatCurrency(stockDetail.previousClose || 0)}</p>
                </div>
              </div>

              {(stockDetail.dayHigh || stockDetail.dayLow) && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Day High</Label>
                      <p className="text-lg font-semibold">{formatCurrency(stockDetail.dayHigh || 0)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Day Low</Label>
                      <p className="text-lg font-semibold">{formatCurrency(stockDetail.dayLow || 0)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stockDetail.industry && (
                <div>
                  <Label className="text-sm text-gray-500">Industry</Label>
                  <p className="font-semibold">{stockDetail.industry}</p>
                </div>
              )}
              
              {stockDetail.marketCapitalization && (
                <div>
                  <Label className="text-sm text-gray-500">Market Cap</Label>
                  <p className="font-semibold">{formatCurrency(stockDetail.marketCapitalization * 1000000)}</p>
                </div>
              )}

              {stockDetail.shareOutstanding && (
                <div>
                  <Label className="text-sm text-gray-500">Shares Outstanding</Label>
                  <p className="font-semibold">{formatNumber(stockDetail.shareOutstanding * 1000000)}</p>
                </div>
              )}

              {stockDetail.weburl && (
                <div>
                  <Label className="text-sm text-gray-500">Website</Label>
                  <a 
                    href={stockDetail.weburl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Company Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Purchase Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Add to Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shares">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="e.g., 10"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  min="0.0001"
                  step="0.0001"
                />
              </div>

              <div>
                <Label htmlFor="avgPrice">Average Price per Share</Label>
                <Input
                  id="avgPrice"
                  type="number"
                  placeholder="e.g., 150.00"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current price: {formatCurrency(stockDetail.price)}
                </p>
              </div>

              {totalCost > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-500">Total Cost</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
              )}

              <Button 
                onClick={handleAddStock}
                disabled={addStockMutation.isPending || !shares || !avgPrice}
                className="w-full"
              >
                {addStockMutation.isPending ? "Adding..." : "Add to Portfolio"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                This will add the stock to your main portfolio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}