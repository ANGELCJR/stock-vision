import { Portfolio, Holding } from "@shared/schema";

interface AIInsightResponse {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  confidence: number;
}

export async function generateAIInsights(
  portfolio: Portfolio, 
  holdings: Holding[]
): Promise<AIInsightResponse[]> {
  try {
    return getMockInsights(portfolio, holdings);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const rating = Math.floor(Math.random() * 5) + 1;
    const confidence = Math.random() * 0.5 + 0.5;
    
    return { rating, confidence };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

export async function generateMarketSummary(
  marketData: any[]
): Promise<string> {
  try {
    return "Market showing mixed signals with technology stocks leading gains while energy sector faces headwinds. Overall sentiment remains cautiously optimistic.";
  } catch (error) {
    console.error("Error generating market summary:", error);
    return "Market analysis unavailable at this time.";
  }
}

function getMockInsights(portfolio: Portfolio, holdings: Holding[]): AIInsightResponse[] {
  const insights: AIInsightResponse[] = [];
  
  if (holdings.length === 0) {
    insights.push({
      type: 'opportunity',
      title: 'Start Building Your Portfolio',
      description: 'Consider adding diversified stocks across different sectors to begin your investment journey.',
      confidence: 0.9
    });
    return insights;
  }

  const totalValue = parseFloat(portfolio.totalValue.toString());
  const totalGainLoss = parseFloat(portfolio.totalGainLoss.toString());
  
  if (holdings.length < 5) {
    insights.push({
      type: 'risk',
      title: 'Consider Diversification',
      description: 'Your portfolio has limited diversification. Consider adding stocks from different sectors to reduce risk.',
      confidence: 0.8
    });
  }
  
  if (totalGainLoss > 0) {
    insights.push({
      type: 'trend',
      title: 'Portfolio Performing Well',
      description: `Your portfolio is showing positive returns of $${totalGainLoss.toFixed(2)}. Consider maintaining your current strategy.`,
      confidence: 0.7
    });
  } else if (totalGainLoss < 0) {
    insights.push({
      type: 'opportunity',
      title: 'Review Underperforming Positions',
      description: 'Some positions may benefit from review. Consider rebalancing or researching recent developments.',
      confidence: 0.6
    });
  }
  
  insights.push({
    type: 'opportunity',
    title: 'Growth Potential',
    description: 'Consider researching emerging technology and healthcare sectors for potential growth opportunities.',
    confidence: 0.65
  });

  return insights;
}