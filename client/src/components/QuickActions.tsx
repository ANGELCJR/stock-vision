import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStockSearch } from "@/hooks/useMarketData";
import { useState } from "react";
import { useLocation } from "wouter";

interface QuickActionsProps {
  portfolioId: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  const [, setLocation] = useLocation();
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use the search hook
  const { data: searchResults = [], isLoading: isSearching } = useStockSearch(searchQuery);

  const handleStockClick = (symbol: string) => {
    setLocation(`/stock/${symbol}`);
    setIsSearchDialogOpen(false);
    setSearchQuery("");
  };

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
                    className="bg-dark-tertiary border-gray-600"
                  />
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
                      <p className="text-sm text-gray-400 mb-2">Click on a stock to view details and purchase:</p>
                      {searchResults.map((stock) => (
                        <button
                          key={stock.symbol}
                          onClick={() => handleStockClick(stock.symbol)}
                          className="w-full text-left p-3 bg-dark-tertiary hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-white">{stock.symbol}</span>
                              <p className="text-sm text-gray-300 truncate">{stock.name}</p>
                            </div>
                            <div className="text-xs text-gray-400">
                              Click to buy →
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
        </div>
      </CardContent>
    </Card>
  );
}