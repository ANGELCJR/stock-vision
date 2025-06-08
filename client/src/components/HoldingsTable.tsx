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

  const handleDeleteHolding = async (holdingId: number) => {
    try {
      await deleteHolding.mutateAsync(holdingId);
      toast({
        title: "Success",
        description: "Stock removed from portfolio"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove stock from portfolio",
        variant: "destructive"
      });
    }
  };

  const sortedHoldings = [...holdings].sort((a, b) => {
    const valueA = a.totalValue;
    const valueB = b.totalValue;
    return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-gray-900 dark:text-white">Portfolio Holdings</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Add New Stock</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <Label htmlFor="symbol" className="text-gray-700 dark:text-gray-300">Stock Symbol</Label>
                <Input
                  id="symbol"
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
                  placeholder="AAPL"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Company Name</Label>
                <Input
                  id="name"
                  value={newHolding.name}
                  onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                  placeholder="Apple Inc."
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="shares" className="text-gray-700 dark:text-gray-300">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  step="0.0001"
                  value={newHolding.shares}
                  onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                  placeholder="10"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="avgPrice" className="text-gray-700 dark:text-gray-300">Average Price</Label>
                <Input
                  id="avgPrice"
                  type="number"
                  step="0.01"
                  value={newHolding.avgPrice}
                  onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                  placeholder="150.00"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Add Stock
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {holdings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No stocks in your portfolio yet</p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Stock
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Stock</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Shares</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Current Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
                    <div className="flex items-center justify-end">
                      Total Value
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Gain/Loss</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.map((holding) => (
                  <tr key={holding.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{holding.symbol}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</div>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 text-gray-900 dark:text-white">{holding.shares}</td>
                    <td className="text-right py-4 px-4 text-gray-900 dark:text-white">${holding.avgPrice.toFixed(2)}</td>
                    <td className="text-right py-4 px-4 text-gray-900 dark:text-white">${holding.currentPrice.toFixed(2)}</td>
                    <td className="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white">${holding.totalValue.toFixed(2)}</td>
                    <td className="text-right py-4 px-4">
                      <div className="flex flex-col items-end">
                        <span className={`font-semibold ${holding.gainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
                        </span>
                        <Badge variant={holding.gainLoss >= 0 ? "default" : "destructive"} className="text-xs">
                          {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </td>
                    <td className="text-right py-4 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHolding(holding.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}