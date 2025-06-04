import { Brain, Lightbulb, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIInsights, useGenerateAIInsights } from "@/hooks/useAIInsights";

interface AIInsightsProps {
  portfolioId: number;
}

export default function AIInsights({ portfolioId }: AIInsightsProps) {
  const { data: insights = [], isLoading } = useAIInsights(portfolioId);
  const generateInsights = useGenerateAIInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return Lightbulb;
      case 'risk':
        return AlertTriangle;
      case 'trend':
        return TrendingUp;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return { text: 'text-yellow-400', bg: 'bg-dark-tertiary' };
      case 'risk':
        return { text: 'text-orange-400', bg: 'bg-dark-tertiary' };
      case 'trend':
        return { text: 'text-green-400', bg: 'bg-dark-tertiary' };
      default:
        return { text: 'text-blue-400', bg: 'bg-dark-tertiary' };
    }
  };

  const handleGenerateReport = () => {
    generateInsights.mutate(portfolioId);
  };

  if (isLoading) {
    return (
      <Card className="bg-dark-secondary border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="text-purple-400" />
            <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">BETA</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-secondary border-gray-700 animate-fade-in">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-6">
          <Brain className="text-purple-400" />
          <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">BETA</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              const colors = getInsightColor(insight.type);
              
              return (
                <div key={insight.id} className={`${colors.bg} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`${colors.text} text-sm`} />
                    <span className={`${colors.text} font-medium text-sm capitalize`}>
                      {insight.type}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(parseFloat(insight.confidence) * 100)}%
                    </Badge>
                  </div>
                  <h4 className="font-medium text-white text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-300">{insight.description}</p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="mb-4">No AI insights available yet.</p>
              <Button
                onClick={handleGenerateReport}
                disabled={generateInsights.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateInsights.isPending ? (
                  <>
                    <div className="loading-spinner mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {insights.length > 0 && (
          <Button 
            onClick={handleGenerateReport}
            disabled={generateInsights.isPending}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            {generateInsights.isPending ? (
              <>
                <div className="loading-spinner mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Full Report
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
