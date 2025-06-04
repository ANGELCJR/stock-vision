import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { useHoldings, useAddHolding, useDeleteHolding } from "@/hooks/usePortfolio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface HoldingsTableProps {
  portfolioId: number;
}

export default function HoldingsTable({ portfolioId }: HoldingsTableProps) {
  const { data: holdings = [], isLoading } = useHoldings(portfolioId);
  const addHolding = useAddHolding();
  const deleteHolding = useDeleteHolding();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: "",
    name: "",
    shares: "",
    avgPrice: ""
  });

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addHolding.mutateAsync({
        portfolioId,
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
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-dark-tertiary">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-dark-tertiary">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Sort
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Stock
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-secondary border-gray-700">
                <DialogHeader>
                  <DialogTitle>Add New Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddHolding} className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newHolding.symbol}
                      onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value.toUpperCase() })}
                      placeholder="AAPL"
                      className="bg-dark-tertiary border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      value={newHolding.name}
                      onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                      placeholder="Apple Inc."
                      className="bg-dark-tertiary border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shares">Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      step="0.0001"
                      value={newHolding.shares}
                      onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                      placeholder="100"
                      className="bg-dark-tertiary border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="avgPrice">Average Price</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      step="0.01"
                      value={newHolding.avgPrice}
                      onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                      placeholder="150.00"
                      className="bg-dark-tertiary border-gray-600"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={addHolding.isPending}
                  >
                    {addHolding.isPending ? "Adding..." : "Add Stock"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
              {holdings.map((holding) => {
                const gainLoss = parseFloat(holding.gainLoss);
                const gainLossPercent = parseFloat(holding.gainLossPercent);
                const isPositive = gainLoss >= 0;
                
                return (
                  <tr key={holding.id} className="border-b border-gray-800 hover:bg-dark-tertiary/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getGradientClass(holding.symbol)} rounded-full flex items-center justify-center text-sm font-bold`}>
                          {getCompanyInitial(holding.symbol)}
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
              <p>No holdings found. Add your first stock to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
