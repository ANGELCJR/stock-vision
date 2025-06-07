import { useState } from "react";
import { ChartLine, Search, Download, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockSearch } from "@/hooks/useMarketData";
import { useDebounce } from "@/hooks/use-mobile";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults = [], isLoading: isSearching } = useStockSearch(debouncedQuery);
  const [location, setLocation] = useLocation();

  const handleStockClick = (symbol: string) => {
    setLocation(`/stock/${symbol}`);
    setSearchQuery("");
  };

  const handleExport = () => {
    // Create CSV export functionality
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Symbol,Name,Shares,Price,Value,Gain/Loss\n"
      + "AAPL,Apple Inc.,50,$178.91,$8945.50,+$1234.78\n"
      + "NVDA,NVIDIA Corporation,25,$891.23,$22280.75,+$8945.30\n"
      + "TSLA,Tesla Inc.,15,$243.84,$3657.60,-$892.45\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-dark-secondary border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChartLine className="text-blue-500 text-2xl" />
              <h1 className="text-xl font-bold">StockVision Pro</h1>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <Link href="/" className={`pb-4 px-1 transition-colors ${
                location === "/" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
              }`}>
                Dashboard
              </Link>
              <Link href="/portfolio" className={`pb-4 px-1 transition-colors ${
                location === "/portfolio" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
              }`}>
                Portfolio
              </Link>
              <Link href="/analytics" className={`pb-4 px-1 transition-colors ${
                location === "/analytics" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
              }`}>
                Analytics
              </Link>
              <Link href="/news" className={`pb-4 px-1 transition-colors ${
                location === "/news" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
              }`}>
                News
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search stocks, ETFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-tertiary text-white pl-10 pr-4 py-2 w-64 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              />
              {(searchResults.length > 0 || isSearching) && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 bg-dark-secondary border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                  {isSearching && (
                    <div className="px-4 py-3 text-center">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                      <div className="text-sm text-gray-400">Searching...</div>
                    </div>
                  )}
                  
                  {!isSearching && searchResults.length > 0 && (
                    <>
                      <div className="px-4 py-2 border-b border-gray-600">
                        <div className="text-xs text-gray-400">Click to view details and purchase:</div>
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          className="w-full px-4 py-3 hover:bg-dark-tertiary cursor-pointer text-left transition-colors border-b border-gray-700 last:border-b-0"
                          onClick={() => handleStockClick(result.symbol)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-white">{result.symbol}</div>
                              <div className="text-sm text-gray-300 truncate">{result.name}</div>
                            </div>
                            <div className="text-xs text-gray-400">
                              Click to buy →
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="px-4 py-3 text-center">
                      <div className="text-gray-400">No stocks found for "{searchQuery}"</div>
                      <div className="text-xs text-gray-500 mt-1">Try a different search term</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/profile" className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-colors cursor-pointer">
              <User className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}