import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  portfolioId: number;
}

export default function QuickActions({ portfolioId }: QuickActionsProps) {
  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-400 text-center py-8">
            Portfolio management features coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}