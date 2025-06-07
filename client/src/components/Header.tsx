import { useState } from "react";
import { ChartLine, Search, Download, User, Sun, Moon, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStockSearch } from "@/hooks/useMarketData";
import { useDebounce } from "@/hooks/use-mobile";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: searchResults = [], isLoading: isSearching } = useStockSearch(debouncedQuery);
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

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
    <header className="bg-background dark:bg-dark-secondary border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <ChartLine className="text-blue-500 text-xl sm:text-2xl" />
              <h1 className="text-lg sm:text-xl font-bold text-foreground">StockVision Pro</h1>
            </div>
            <nav className="hidden md:flex space-x-4 lg:space-x-6 ml-4 lg:ml-8">
              <Link href="/" className={`pb-4 px-1 transition-colors ${
                location === "/" ? "text-blue-400 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground"
              }`}>
                Dashboard
              </Link>
              <Link href="/portfolio" className={`pb-4 px-1 transition-colors ${
                location === "/portfolio" ? "text-blue-400 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground"
              }`}>
                Portfolio
              </Link>
              <Link href="/analytics" className={`pb-4 px-1 transition-colors ${
                location === "/analytics" ? "text-blue-400 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground"
              }`}>
                Analytics
              </Link>
              <Link href="/news" className={`pb-4 px-1 transition-colors ${
                location === "/news" ? "text-blue-400 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground"
              }`}>
                News
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search stocks, ETFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted dark:bg-dark-tertiary text-foreground pl-10 pr-4 py-2 w-48 lg:w-64 border-border focus:border-primary focus:ring-primary"
              />
              {(searchResults.length > 0 || isSearching) && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 bg-card dark:bg-dark-secondary border border-border rounded-lg mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                  {isSearching && (
                    <div className="px-4 py-3 text-center">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground">Searching...</div>
                    </div>
                  )}
                  
                  {!isSearching && searchResults.length > 0 && (
                    <>
                      <div className="px-4 py-2 border-b border-border">
                        <div className="text-xs text-muted-foreground">Click to view details and purchase:</div>
                      </div>
                      {searchResults.map((result) => (
                        <button
                          key={result.symbol}
                          className="w-full px-4 py-3 hover:bg-muted dark:hover:bg-dark-tertiary cursor-pointer text-left transition-colors border-b border-border last:border-b-0"
                          onClick={() => handleStockClick(result.symbol)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-foreground">{result.symbol}</div>
                              <div className="text-sm text-muted-foreground truncate">{result.name}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Click to buy →
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                    <div className="px-4 py-3 text-center">
                      <div className="text-muted-foreground">No stocks found for "{searchQuery}"</div>
                      <div className="text-xs text-muted-foreground mt-1">Try a different search term</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 hover:bg-muted dark:hover:bg-dark-tertiary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-600" />
              )}
            </Button>

            <Button 
              onClick={handleExport}
              size="sm"
              className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <Download className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Export</span>
            </Button>
            
            <Link href="/profile" className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-colors cursor-pointer">
              <User className="h-4 w-4 text-white" />
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background dark:bg-dark-secondary">
            <div className="px-4 py-2 space-y-1">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-muted dark:bg-dark-tertiary text-foreground pl-10 pr-4 py-2 w-full border-border"
                />
                {(searchResults.length > 0 || isSearching) && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 bg-card dark:bg-dark-secondary border border-border rounded-lg mt-1 max-h-48 overflow-y-auto z-50 shadow-lg">
                    {isSearching && (
                      <div className="px-4 py-3 text-center">
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Searching...</div>
                      </div>
                    )}
                    
                    {!isSearching && searchResults.length > 0 && (
                      searchResults.slice(0, 3).map((result) => (
                        <button
                          key={result.symbol}
                          className="w-full px-4 py-3 hover:bg-muted dark:hover:bg-dark-tertiary cursor-pointer text-left transition-colors border-b border-border last:border-b-0"
                          onClick={() => {
                            handleStockClick(result.symbol);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-foreground text-sm">{result.symbol}</div>
                              <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/portfolio" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/portfolio" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link 
                href="/analytics" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/analytics" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </Link>
              <Link 
                href="/news" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === "/news" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News
              </Link>
              
              {/* Mobile Export Button */}
              <Button 
                onClick={() => {
                  handleExport();
                  setIsMobileMenuOpen(false);
                }}
                size="sm"
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Portfolio
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}