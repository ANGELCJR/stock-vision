import { Plus, Scale, Bell, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAddHolding, usePortfolio } from "@/hooks/usePortfolio";
import { useStockSearch } from "@/hooks/useMarketData";
import { useState } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface QuickActionsProps {
  portfolioId?: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  const { toast } = useToast();
  const { data: portfolio } = usePortfolio(portfolioId);
  const addHoldingMutation = useAddHolding();
  const [, setLocation] = useLocation();

  const actualPortfolioId = portfolioId || portfolio?.id;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    symbol: "",
    companyName: "",
    shares: "",
    avgPrice: ""
  });

  // Use the search hook
  const { data: searchResults = [], isLoading: isSearching } = useStockSearch(searchQuery);

  const handleAddStock = async () => {
    try {
      if (!actualPortfolioId) {
        throw new Error("No portfolio ID available");
      }
      await addHoldingMutation.mutateAsync({
        portfolioId: actualPortfolioId,
        symbol: formData.symbol.toUpperCase(),
        name: formData.companyName || formData.symbol.toUpperCase(),
        shares: formData.shares,
        avgPrice: formData.avgPrice
      });
      
      toast({
        title: "Success",
        description: `${formData.symbol.toUpperCase()} added to portfolio successfully.`
      });
      
      setIsDialogOpen(false);
      setFormData({ symbol: "", companyName: "", shares: "", avgPrice: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId, "holdings"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock to portfolio.",
        variant: "destructive"
      });
    }
  };

  const handleStockSelect = (stock: any) => {
    setFormData({
      symbol: stock.symbol,
      companyName: stock.name,
      shares: "",
      avgPrice: ""
    });
    setIsSearchDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available in the next update.`
    });
  };

  const actions = [];

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Search & Buy Stocks Dialog */}
          <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full py-3 transition-colors flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white">
                <Search className="h-4 w-4" />
                <span>Search & Buy Stocks</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-secondary border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search Stocks</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search for stocks</Label>
                  <Input
                    id="search"
                    placeholder="Search by company name or symbol (e.g., Apple, AAPL)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"                  />
                </div>
                
                {/* Search Results */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {isSearching && searchQuery.length >= 2 && (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="text-sm text-gray-400 mt-2">Searching...</p>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400 mb-2">Click on a stock to add to your portfolio:</p>
                      {searchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          onClick={() => handleStockSelect(stock)}
                          className="w-full text-left p-3 bg-dark-tertiary hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-white">{stock.symbol}</span>
                              <p className="text-sm text-gray-300 truncate">{stock.name}</p>
                            </div>
                            <div className="text-xs text-gray-400">
                              Click to add →
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400">No stocks found for "{searchQuery}"</p>
                      <p className="text-xs text-gray-500 mt-1">Try searching with a different term</p>
                    </div>
                  )}
                  
                  {searchQuery.length < 2 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400">Enter at least 2 characters to search</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Stock Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-dark-secondary border-gray-700">
              <DialogHeader>
                <DialogTitle>Add Stock to Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                    className="bg-dark-tertiary border-gray-600"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Apple Inc."
                    className="bg-dark-tertiary border-gray-600"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    step="0.0001"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    placeholder="10"
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="avgPrice">Purchase Price per Share</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    step="0.01"
                    value={formData.avgPrice}
                    onChange={(e) => setFormData({ ...formData, avgPrice: e.target.value })}
                    placeholder="150.00"
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <Button 
                  onClick={handleAddStock} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={addHoldingMutation.isPending || !formData.symbol || !formData.shares || !formData.avgPrice}
                >
                  {addHoldingMutation.isPending ? "Adding..." : "Add to Portfolio"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>
    </Card>
  );
}