import { useState } from "react";
import { ChartLine, Search, Download, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockSearch } from "@/hooks/useMarketData";
import { useDebounce } from "@/hooks/use-mobile";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults = [] } = useStockSearch(debouncedQuery);

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
              <a href="#" className="text-blue-400 border-b-2 border-blue-400 pb-4 px-1">
                Dashboard
              </a>
              <a href="#" className="text-gray-300 hover:text-white pb-4 px-1 transition-colors">
                Portfolio
              </a>
              <a href="#" className="text-gray-300 hover:text-white pb-4 px-1 transition-colors">
                Analytics
              </a>
              <a href="#" className="text-gray-300 hover:text-white pb-4 px-1 transition-colors">
                News
              </a>
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
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-dark-secondary border border-gray-600 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="px-4 py-2 hover:bg-dark-tertiary cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    >
                      <div className="font-medium">{result.symbol}</div>
                      <div className="text-sm text-gray-400">{result.name}</div>
                    </div>
                  ))}
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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
