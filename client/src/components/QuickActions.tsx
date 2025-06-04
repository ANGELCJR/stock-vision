import { Plus, Scale, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsProps {
  portfolioId: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available in the next update.`
    });
  };

  const actions = [
    {
      icon: Plus,
      label: "Add New Stock",
      onClick: () => handleAction("Add New Stock"),
      className: "bg-blue-600 hover:bg-blue-700 text-white"
    },
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
