import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { useHoldings, useAddHolding, useDeleteHolding, usePortfolio } from "@/hooks/usePortfolio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface HoldingsTableProps {
  portfolioId?: number;
}

export default function HoldingsTable({ portfolioId }: HoldingsTableProps) {
  const { data: holdings = [], isLoading } = useHoldings(portfolioId);
  const { data: portfolio } = usePortfolio(portfolioId);
  const addHolding = useAddHolding();
  const deleteHolding = useDeleteHolding();
  const { toast } = useToast();

  const actualPortfolioId = portfolioId || portfolio?.id;
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    name: "",
    shares: "",
    avgPrice: ""
  });

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!actualPortfolioId) {
        throw new Error("No portfolio ID available");
      }
      await addHolding.mutateAsync({
        portfolioId: actualPortfolioId,
        ...newHolding
      });
      setIsAddDialogOpen(false);
      setNewHolding({ symbol: "", name: "", shares: "", avgPrice: "" });
      toast({
        title: "Success",
        description: "Stock added to portfolio successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock to portfolio",
        variant: "destructive"
      });
    }
  };

  const handleDeleteHolding = async (holdingId: number, symbol: string) => {
    try {
      await deleteHolding.mutateAsync(holdingId);
      toast({
        title: "Success",
        description: `${symbol} removed from portfolio`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove stock from portfolio",
        variant: "destructive"
      });
    }
  };

  const getCompanyLogo = (symbol: string) => {
    // Using real company logo URLs for major companies
    const logoMap: { [key: string]: string } = {
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'GOOG': 'https://logo.clearbit.com/google.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'NFLX': 'https://logo.clearbit.com/netflix.com',
      'SPOT': 'https://logo.clearbit.com/spotify.com',
      'GME': 'https://logo.clearbit.com/gamestop.com',
      'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
      'NKE': 'https://logo.clearbit.com/nike.com',
      'V': 'https://logo.clearbit.com/visa.com',
      'MA': 'https://logo.clearbit.com/mastercard.com',
      'DIS': 'https://logo.clearbit.com/disney.com',
      'PYPL': 'https://logo.clearbit.com/paypal.com',
      'ADBE': 'https://logo.clearbit.com/adobe.com',
      'CRM': 'https://logo.clearbit.com/salesforce.com',
      'INTC': 'https://logo.clearbit.com/intel.com',
      'AMD': 'https://logo.clearbit.com/amd.com',
      'COIN': 'https://logo.clearbit.com/coinbase.com',
      'SQ': 'https://logo.clearbit.com/squareup.com',
      'UBER': 'https://logo.clearbit.com/uber.com',
      'LYFT': 'https://logo.clearbit.com/lyft.com',
      'TWTR': 'https://logo.clearbit.com/twitter.com',
      'SNAP': 'https://logo.clearbit.com/snap.com',
      'PINS': 'https://logo.clearbit.com/pinterest.com',
      'ROKU': 'https://logo.clearbit.com/roku.com',
      'ZM': 'https://logo.clearbit.com/zoom.us',
      'SHOP': 'https://logo.clearbit.com/shopify.com',
      'DDOG': 'https://logo.clearbit.com/datadoghq.com',
      'SNOW': 'https://logo.clearbit.com/snowflake.com',
      'PLTR': 'https://logo.clearbit.com/palantir.com',
      'RBLX': 'https://logo.clearbit.com/roblox.com',
      'HOOD': 'https://logo.clearbit.com/robinhood.com',
      'PATH': 'https://logo.clearbit.com/uipath.com',
      'DOCU': 'https://logo.clearbit.com/docusign.com',
      'OKTA': 'https://logo.clearbit.com/okta.com',
      'CRWD': 'https://logo.clearbit.com/crowdstrike.com'
    };
    
    return logoMap[symbol.toUpperCase()] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
  };

  const getCompanyInitial = (symbol: string) => {
    return symbol.charAt(0).toUpperCase();
  };

  const getGradientClass = (symbol: string) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600", 
      "from-red-500 to-pink-600",
      "from-yellow-500 to-orange-600",
      "from-purple-500 to-indigo-600"
    ];
    const index = symbol.length % gradients.length;
    return gradients[index];
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    const aValue = parseFloat(a.totalValue);
    const bValue = parseFloat(b.totalValue);
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Your Holdings</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-300 hover:text-white hover:bg-dark-tertiary"
            onClick={toggleSort}
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            Sort {sortOrder === 'desc' ? '(High to Low)' : '(Low to High)'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Symbol</th>
                <th className="text-left py-3 text-gray-400 font-medium">Shares</th>
                <th className="text-left py-3 text-gray-400 font-medium">Price</th>
                <th className="text-left py-3 text-gray-400 font-medium">Change</th>
                <th className="text-left py-3 text-gray-400 font-medium">Value</th>
                <th className="text-left py-3 text-gray-400 font-medium">P&L</th>
                <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => {
                const gainLoss = parseFloat(holding.gainLoss);
                const gainLossPercent = parseFloat(holding.gainLossPercent);
                const isPositive = gainLoss >= 0;
                
                return (
                  <tr key={holding.id} className="border-b border-gray-800 hover:bg-dark-tertiary/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
                          <img 
                            src={getCompanyLogo(holding.symbol)} 
                            alt={`${holding.symbol} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to gradient background with initial
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.className = `w-8 h-8 bg-gradient-to-r ${getGradientClass(holding.symbol)} rounded-full flex items-center justify-center text-sm font-bold`;
                                parent.innerHTML = getCompanyInitial(holding.symbol);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{holding.symbol}</p>
                          <p className="text-gray-400 text-sm">{holding.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono">{parseFloat(holding.shares).toFixed(4)}</td>
                    <td className="py-4 font-mono">${parseFloat(holding.currentPrice).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}${gainLoss.toFixed(2)} ({gainLossPercent.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-4 font-mono">${parseFloat(holding.totalValue).toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}${gainLoss.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHolding(holding.id, holding.symbol)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        disabled={deleteHolding.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {holdings.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No holdings found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}