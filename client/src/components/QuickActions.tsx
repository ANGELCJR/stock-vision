import { Plus, Scale, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAddHolding } from "@/hooks/usePortfolio";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

interface QuickActionsProps {
  portfolioId: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  const { toast } = useToast();
  const addHoldingMutation = useAddHolding();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    companyName: "",
    shares: "",
    avgPrice: ""
  });

  const handleAddStock = async () => {
    try {
      await addHoldingMutation.mutateAsync({
        portfolioId,
        symbol: formData.symbol.toUpperCase(),
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

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available in the next update.`
    });
  };

  const actions = [
    {
      icon: Scale,
      label: "Rebalance Portfolio",
      onClick: () => handleAction("Rebalance Portfolio"),
      className: "bg-dark-tertiary hover:bg-gray-600 text-white"
    },
    {
      icon: Bell,
      label: "Set Price Alerts",
      onClick: () => handleAction("Set Price Alerts"),
      className: "bg-dark-tertiary hover:bg-gray-600 text-white"
    },
    {
      icon: FileText,
      label: "Generate Tax Report",
      onClick: () => handleAction("Generate Tax Report"),
      className: "bg-dark-tertiary hover:bg-gray-600 text-white"
    }
  ];

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full py-3 transition-colors flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                <span>Add New Stock</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-secondary border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={formData.symbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Apple Inc."
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="shares">Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    placeholder="10"
                    value={formData.shares}
                    onChange={(e) => setFormData(prev => ({ ...prev, shares: e.target.value }))}
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <div>
                  <Label htmlFor="avgPrice">Average Price</Label>
                  <Input
                    id="avgPrice"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.avgPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, avgPrice: e.target.value }))}
                    className="bg-dark-tertiary border-gray-600"
                  />
                </div>
                <Button 
                  onClick={handleAddStock} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={addHoldingMutation.isPending || !formData.symbol || !formData.shares || !formData.avgPrice}
                >
                  {addHoldingMutation.isPending ? "Adding..." : "Add Stock"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className={`w-full py-3 transition-colors flex items-center justify-center space-x-2 ${action.className}`}
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
