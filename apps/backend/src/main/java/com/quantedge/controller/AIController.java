package com.quantedge.controller;

import com.quantedge.service.AIService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI Controller — exposes AI-powered financial insights.
 * Base path: /api/v1/ai
 * Per TECH_SPEC.md §11 — AI Integration.
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Insights", description = "AI-powered financial analysis and insights")
public class AIController {

    private final AIService aiService;

    /** POST /ai/ask — general financial Q&A */
    @PostMapping("/ask")
    @Operation(summary = "Ask the AI a financial question")
    public ResponseEntity<ApiResponse<String>> askQuestion(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails user) {
        String question = body.getOrDefault("question", "").trim();
        if (question.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Question cannot be empty"));
        }
        if (question.length() > 1000) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Question too long (max 1000 chars)"));
        }
        String answer = aiService.askFinancialQuestion(question);
        return ResponseEntity.ok(ApiResponse.success(answer));
    }

    /** POST /ai/analyse/portfolio — portfolio AI analysis */
    @PostMapping("/analyse/portfolio")
    @Operation(summary = "Get AI analysis of a portfolio")
    public ResponseEntity<ApiResponse<String>> analysePortfolio(
            @RequestBody Map<String, Object> portfolioData,
            @AuthenticationPrincipal UserDetails user) {
        String analysis = aiService.analysePortfolio(portfolioData);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }

    /** POST /ai/analyse/stock/{symbol} — stock AI analysis */
    @PostMapping("/analyse/stock/{symbol}")
    @Operation(summary = "Get AI analysis of a stock")
    public ResponseEntity<ApiResponse<String>> analyseStock(
            @PathVariable String symbol,
            @RequestBody(required = false) Map<String, Object> quoteData,
            @AuthenticationPrincipal UserDetails user) {
        Map<String, Object> data = quoteData != null ? quoteData : Map.of();
        String analysis = aiService.analyseStock(symbol.toUpperCase(), data);
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }

    /** POST /ai/explain/strategy — explain a trading strategy */
    @PostMapping("/explain/strategy")
    @Operation(summary = "Get AI explanation of a trading strategy")
    public ResponseEntity<ApiResponse<String>> explainStrategy(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails user) {
        String type = String.valueOf(body.getOrDefault("type", "BUY_AND_HOLD"));
        @SuppressWarnings("unchecked")
        Map<String, Object> config = (Map<String, Object>) body.getOrDefault("config", Map.of());
        String explanation = aiService.explainStrategy(type, config);
        return ResponseEntity.ok(ApiResponse.success(explanation));
    }

    /** POST /ai/interpret/backtest — interpret backtest results */
    @PostMapping("/interpret/backtest")
    @Operation(summary = "Get AI interpretation of backtest results")
    public ResponseEntity<ApiResponse<String>> interpretBacktest(
            @RequestBody Map<String, Object> backtestResults,
            @AuthenticationPrincipal UserDetails user) {
        String interpretation = aiService.interpretBacktest(backtestResults);
        return ResponseEntity.ok(ApiResponse.success(interpretation));
    }
}
