import OpenAI from "openai";
import type { Portfolio, Holding } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

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
    // Calculate portfolio metrics for context
    const totalValue = parseFloat(portfolio.totalValue);
    const totalGainLoss = parseFloat(portfolio.totalGainLoss);
    const portfolioReturn = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
    
    // Analyze holdings distribution
    const holdingsAnalysis = holdings.map(holding => ({
      symbol: holding.symbol,
      name: holding.name,
      shares: parseFloat(holding.shares),
      currentPrice: parseFloat(holding.currentPrice),
      totalValue: parseFloat(holding.totalValue),
      gainLoss: parseFloat(holding.gainLoss),
      gainLossPercent: parseFloat(holding.gainLossPercent),
      portfolioWeight: totalValue > 0 ? (parseFloat(holding.totalValue) / totalValue) * 100 : 0
    }));

    // Find largest positions
    const largestPosition = holdingsAnalysis.reduce((max, holding) => 
      holding.portfolioWeight > max.portfolioWeight ? holding : max, holdingsAnalysis[0]);
    
    // Count sectors (simplified categorization)
    const techSymbols = ['AAPL', 'NVDA', 'GOOGL', 'MSFT', 'META', 'AMZN', 'NFLX', 'AMD', 'INTC'];
    const techHoldings = holdingsAnalysis.filter(h => techSymbols.includes(h.symbol));
    const techWeight = techHoldings.reduce((sum, h) => sum + h.portfolioWeight, 0);

    const prompt = `You are an expert financial advisor analyzing a stock portfolio. Based on the following portfolio data, generate 3 actionable insights.

Portfolio Overview:
- Total Value: $${totalValue.toLocaleString()}
- Total Return: ${portfolioReturn.toFixed(2)}%
- Number of Holdings: ${holdings.length}
- Risk Score: ${portfolio.riskScore}/10

Holdings Analysis:
${holdingsAnalysis.map(h => 
  `- ${h.symbol} (${h.name}): ${h.portfolioWeight.toFixed(1)}% of portfolio, ${h.gainLossPercent.toFixed(2)}% return, $${h.totalValue.toLocaleString()} value`
).join('\n')}

Key Metrics:
- Largest Position: ${largestPosition?.symbol} at ${largestPosition?.portfolioWeight.toFixed(1)}% of portfolio
- Technology Sector Weight: ${techWeight.toFixed(1)}%
- Best Performer: ${holdingsAnalysis.reduce((best, h) => h.gainLossPercent > best.gainLossPercent ? h : best, holdingsAnalysis[0])?.symbol} (+${holdingsAnalysis.reduce((best, h) => h.gainLossPercent > best.gainLossPercent ? h : best, holdingsAnalysis[0])?.gainLossPercent.toFixed(2)}%)
- Worst Performer: ${holdingsAnalysis.reduce((worst, h) => h.gainLossPercent < worst.gainLossPercent ? h : worst, holdingsAnalysis[0])?.symbol} (${holdingsAnalysis.reduce((worst, h) => h.gainLossPercent < worst.gainLossPercent ? h : worst, holdingsAnalysis[0])?.gainLossPercent.toFixed(2)}%)

Generate exactly 3 insights in JSON format. Each insight should be one of these types: "opportunity", "risk", or "trend". Provide actionable advice based on portfolio concentration, sector allocation, performance, and risk management. Focus on diversification, rebalancing, and risk management recommendations.

Response format:
{
  "insights": [
    {
      "type": "opportunity|risk|trend",
      "title": "Brief insight title (max 50 characters)",
      "description": "Detailed actionable recommendation (max 150 characters)",
      "confidence": 0.85
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional financial advisor providing portfolio analysis. Always respond with valid JSON containing exactly 3 insights. Confidence should be between 0.7 and 0.95. Focus on actionable, specific recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    
    if (!result.insights || !Array.isArray(result.insights)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate and format insights
    const validInsights = result.insights
      .slice(0, 3) // Ensure max 3 insights
      .map((insight: any) => ({
        type: ['opportunity', 'risk', 'trend'].includes(insight.type) ? insight.type : 'opportunity',
        title: (insight.title || 'Portfolio Recommendation').substring(0, 50),
        description: (insight.description || 'Consider reviewing your portfolio allocation.').substring(0, 150),
        confidence: Math.max(0.7, Math.min(0.95, insight.confidence || 0.8))
      }));

    // Ensure we always return exactly 3 insights
    while (validInsights.length < 3) {
      const fallbackInsights = [
        {
          type: 'risk' as const,
          title: 'Portfolio Concentration Risk',
          description: `Your largest position (${largestPosition?.symbol}) represents ${largestPosition?.portfolioWeight.toFixed(1)}% of your portfolio. Consider reducing concentration risk.`,
          confidence: 0.85
        },
        {
          type: 'opportunity' as const,
          title: 'Diversification Opportunity',
          description: `Technology stocks make up ${techWeight.toFixed(1)}% of your portfolio. Consider diversifying into other sectors for better risk distribution.`,
          confidence: 0.8
        },
        {
          type: 'trend' as const,
          title: 'Performance Analysis',
          description: `Your portfolio has generated a ${portfolioReturn.toFixed(2)}% return. Monitor market trends for rebalancing opportunities.`,
          confidence: 0.75
        }
      ];
      
      validInsights.push(fallbackInsights[validInsights.length]);
    }

    return validInsights.slice(0, 3);

  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Return fallback insights if OpenAI fails
    const fallbackInsights: AIInsightResponse[] = [
      {
        type: 'opportunity',
        title: 'Diversification Review',
        description: 'Consider reviewing your portfolio allocation across different sectors and asset classes for optimal diversification.',
        confidence: 0.8
      },
      {
        type: 'risk',
        title: 'Position Size Management',
        description: 'Monitor your largest positions to ensure no single holding exceeds 15-20% of your total portfolio value.',
        confidence: 0.85
      },
      {
        type: 'trend',
        title: 'Regular Rebalancing',
        description: 'Consider periodic rebalancing to maintain your target asset allocation and take advantage of market movements.',
        confidence: 0.75
      }
    ];

    return fallbackInsights;
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 100
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rating": 3, "confidence": 0.5}');

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    return {
      rating: 3,
      confidence: 0.5
    };
  }
}

export async function generateMarketSummary(
  holdings: Holding[],
  marketNews: any[]
): Promise<string> {
  try {
    const symbols = holdings.map(h => h.symbol).join(', ');
    const newsHeadlines = marketNews.slice(0, 5).map(news => news.title).join('\n- ');

    const prompt = `Based on the following information, provide a brief market summary for a portfolio containing: ${symbols}

Recent Market News:
- ${newsHeadlines}

Portfolio Context:
${holdings.map(h => `${h.symbol}: ${parseFloat(h.gainLossPercent).toFixed(2)}% return`).join(', ')}

Provide a concise 2-3 sentence market summary focusing on how current events might impact this specific portfolio. Keep it under 200 characters.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst providing concise market summaries. Keep responses under 200 characters and focus on portfolio-relevant insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    return response.choices[0].message.content?.substring(0, 200) || 
      "Market conditions remain dynamic. Monitor your positions and consider rebalancing opportunities based on current trends.";

  } catch (error) {
    console.error("Error generating market summary:", error);
    return "Market analysis unavailable. Please review your portfolio performance and consider consulting recent market trends.";
  }
}
