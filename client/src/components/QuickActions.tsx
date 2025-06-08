import { Scale, Bell, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStockSearch } from "@/hooks/useMarketData";
import { useState } from "react";
import { useLocation } from "wouter";

interface QuickActionsProps {
  portfolioId?: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  const { toast } = useToast();
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

  const quickActions = [
    {
      title: "Search Stocks",
      description: "Search from 50,000+ stocks",
      icon: Search,
      action: () => setIsSearchDialogOpen(true),
      color: "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700"
    },
    {
      title: "Portfolio Analysis",
      description: "View detailed analytics",
      icon: Scale,
      action: () => setLocation("/analytics"),
      color: "from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700"
    },
    {
      title: "Market News",
      description: "Latest market updates",
      icon: FileText,
      action: () => setLocation("/news"),
      color: "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700"
    }
  ];

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="relative overflow-hidden h-auto p-4 justify-start bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                onClick={action.action}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-5`} />
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stock Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Search Stocks</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks by symbol or company name..."
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            {isSearching ? (
              <p className="text-gray-500 dark:text-gray-400">Searching...</p>
            ) : searchResults.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2">
                <p className="text-sm text-gray-400 mb-2">Click on a stock to view details and purchase:</p>
                {searchResults.map((stock: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleStockClick(stock.symbol)}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">Click to buy →</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No stocks found</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}