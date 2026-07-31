package com.quantedge.service;

import com.quantedge.provider.GeminiProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * AI Service â€” uses GeminiProvider (Google Gemini free tier, 15 req/min, â‚¹0 cost).
 * Provides financial insights, portfolio analysis, and educational explanations.
 *
 * Per TECH_SPEC.md Â§11 â€” AI Integration.
 * Gemini free tier: https://aistudio.google.com/app/apikey
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final GeminiProvider geminiProvider;

    private static final String SYSTEM_PROMPT = """
        You are QuantEdge AI, a professional financial analyst and investment education assistant.
        You help users understand their portfolios, analyse stocks, and learn about investing strategies.
        
        IMPORTANT RULES:
        1. This is an EDUCATIONAL, paper trading platform. No real money is involved.
        2. Always add a disclaimer that your insights are for educational purposes only.
        3. Provide concise, structured responses. Use bullet points when listing items.
        4. Focus on educational value â€” explain WHY, not just WHAT.
        5. Never recommend specific investments for real money.
        6. Be data-driven when portfolio data is provided.
        
        Format responses in clean markdown with headers and bullets for readability.
        """;

    /**
     * General financial Q&A â€” cached by question hash.
     */
    @Cacheable(value = "ai-insights", key = "#question.hashCode()")
    public String askFinancialQuestion(String question) {
        log.info("[AI] Processing question: {}", question.substring(0, Math.min(question.length(), 80)));
        return geminiProvider.generate(SYSTEM_PROMPT, question).block();
    }

    /**
     * Portfolio analysis â€” analyses a user's portfolio and provides AI insights.
     */
    public String analysePortfolio(Map<String, Object> portfolioData) {
        String userPrompt = """
            Analyse this paper trading portfolio and provide:
            1. Overall portfolio health assessment
            2. Diversification analysis
            3. Risk assessment (based on holdings mix)
            4. 3 actionable suggestions for improvement
            5. Educational insight relevant to this portfolio
            
            Portfolio data:
            - Total value: %s
            - Cash balance: %s
            - Total return: %s%%
            - Holdings: %s
            
            Remember: This is educational/simulated trading only.
            """.formatted(
                portfolioData.getOrDefault("totalValue", "N/A"),
                portfolioData.getOrDefault("cashBalance", "N/A"),
                portfolioData.getOrDefault("totalReturnPct", "N/A"),
                portfolioData.getOrDefault("holdings", "N/A")
        );
        return geminiProvider.generate(SYSTEM_PROMPT, userPrompt).block();
    }

    /**
     * Stock analysis â€” explains a stock's fundamentals.
     */
    @Cacheable(value = "ai-stock-analysis", key = "#symbol")
    public String analyseStock(String symbol, Map<String, Object> quoteData) {
        String userPrompt = """
            Provide a comprehensive educational analysis of %s stock:
            
            Current data:
            - Price: %s
            - Change: %s%%
            - Volume: %s
            
            Cover:
            1. Brief company overview (2-3 sentences)
            2. What drives this stock's price (key factors)
            3. How to interpret today's price movement
            4. Key metrics investors typically look at for this type of stock
            5. Educational takeaway for a beginner investor
            
            Educational purposes only â€” not financial advice.
            """.formatted(
                symbol,
                quoteData.getOrDefault("price", "N/A"),
                quoteData.getOrDefault("changePercent", "N/A"),
                quoteData.getOrDefault("volume", "N/A")
        );
        return geminiProvider.generate(SYSTEM_PROMPT, userPrompt).block();
    }

    /**
     * Strategy explanation â€” explains what a trading strategy does.
     */
    @Cacheable(value = "ai-strategy", key = "#strategyType")
    public String explainStrategy(String strategyType, Map<String, Object> config) {
        String userPrompt = """
            Explain the '%s' trading strategy in educational terms:
            Configuration: %s
            
            Cover:
            1. How this strategy works (step by step)
            2. The mathematical/technical concept behind it
            3. Market conditions where it performs best
            4. Common risks and limitations
            5. Historical context or famous use cases
            
            Make it understandable for someone learning to invest.
            """.formatted(strategyType, config);
        return geminiProvider.generate(SYSTEM_PROMPT, userPrompt).block();
    }

    /**
     * Backtest result interpretation â€” explains what the backtest results mean.
     */
    public String interpretBacktest(Map<String, Object> backtestResults) {
        String userPrompt = """
            Interpret these paper trading backtest results and teach the user what they mean:
            
            Results:
            - Strategy: %s
            - Symbol: %s
            - Period: %s to %s
            - Initial Capital: %s
            - Total Return: %s%%
            - Win Rate: %s%%
            - Total Trades: %s
            - Sharpe Ratio: %s
            
            Explain:
            1. What these results tell us about the strategy's performance
            2. Whether this is a "good" result (with context)
            3. Key metrics to focus on and why
            4. What the strategy's weaknesses appear to be
            5. How to improve or validate this strategy further
            """.formatted(
                backtestResults.getOrDefault("strategy", "N/A"),
                backtestResults.getOrDefault("symbol", "N/A"),
                backtestResults.getOrDefault("startDate", "N/A"),
                backtestResults.getOrDefault("endDate", "N/A"),
                backtestResults.getOrDefault("initialCapital", "N/A"),
                backtestResults.getOrDefault("totalReturnPct", "N/A"),
                backtestResults.getOrDefault("winRate", "N/A"),
                backtestResults.getOrDefault("totalTrades", "N/A"),
                backtestResults.getOrDefault("sharpeRatio", "N/A")
        );
        return geminiProvider.generate(SYSTEM_PROMPT, userPrompt).block();
    }
}
