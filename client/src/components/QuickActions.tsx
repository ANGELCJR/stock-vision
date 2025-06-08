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
        <CardTitle className="text-xl font-semibold">Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center py-6">
            <p className="text-gray-400">Portfolio tracking and analytics</p>
            <p className="text-sm text-gray-500 mt-2">View your portfolio performance above</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}