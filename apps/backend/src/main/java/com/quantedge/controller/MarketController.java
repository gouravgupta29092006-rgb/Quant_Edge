package com.quantedge.controller;

import com.quantedge.dto.response.StockQuoteResponse;
import com.quantedge.entity.Stock;
import com.quantedge.entity.StockQuote;
import com.quantedge.service.MarketDataService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Market Data REST Controller.
 * All endpoints are authenticated (set in SecurityConfig).
 *
 * Base path: /api/v1/market
 * Per APPFLOW.md — Market Intelligence module.
 */
@RestController
@RequestMapping("/market")
@RequiredArgsConstructor
@Validated
@Tag(name = "Market Data", description = "Real-time quotes, company info, stock search, market movers")
public class MarketController {

    private final MarketDataService marketDataService;

    /**
     * GET /market/quote/{symbol}
     * Real-time quote for a single symbol.
     * Cache: 15 seconds (Caffeine + Redis)
     */
    @GetMapping("/quote/{symbol}")
    @Operation(summary = "Get real-time stock quote")
    public ResponseEntity<ApiResponse<StockQuoteResponse>> getQuote(
            @PathVariable String symbol) {

        StockQuote quote = marketDataService.getQuote(symbol.toUpperCase());
        Stock stock = null;
        try {
            stock = marketDataService.getCompanyProfile(symbol.toUpperCase());
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success(StockQuoteResponse.from(quote, stock)));
    }

    /**
     * POST /market/quotes/batch
     * Quotes for multiple symbols — used by portfolio and watchlist views.
     * Body: { "symbols": ["AAPL", "MSFT", "GOOGL"] }
     */
    @PostMapping("/quotes/batch")
    @Operation(summary = "Get quotes for multiple symbols")
    public ResponseEntity<ApiResponse<List<StockQuoteResponse>>> getBatchQuotes(
            @RequestBody Map<String, List<String>> body) {

        List<String> symbols = body.getOrDefault("symbols", List.of());
        if (symbols.size() > 50) {
            symbols = symbols.subList(0, 50);   // max 50 per request
        }

        List<StockQuote> quotes = marketDataService.getBatchQuotes(symbols);
        List<StockQuoteResponse> responses = quotes.stream()
                .map(q -> StockQuoteResponse.from(q, null))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * GET /market/company/{symbol}
     * Company profile — sector, employees, website, logo.
     * Cache: 24 hours
     */
    @GetMapping("/company/{symbol}")
    @Operation(summary = "Get company profile and metadata")
    public ResponseEntity<ApiResponse<Stock>> getCompanyProfile(
            @PathVariable String symbol) {

        Stock stock = marketDataService.getCompanyProfile(symbol.toUpperCase());
        return ResponseEntity.ok(ApiResponse.success(stock));
    }

    /**
     * GET /market/search?q={query}&limit={limit}
     * Autocomplete stock search by symbol or name.
     */
    @GetMapping("/search")
    @Operation(summary = "Search stocks by symbol or company name")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchStocks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") @Min(1) @Max(30) int limit) {

        List<Map<String, Object>> results = marketDataService.searchStocks(q, limit);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    /**
     * GET /market/movers
     * Top 5 gainers and top 5 losers from the stock universe.
     * Cache: 2 minutes
     */
    @GetMapping("/movers")
    @Operation(summary = "Get market movers — top gainers and losers")
    public ResponseEntity<ApiResponse<Map<String, List<StockQuote>>>> getMarketMovers() {
        Map<String, List<StockQuote>> movers = marketDataService.getMarketMovers();
        return ResponseEntity.ok(ApiResponse.success(movers));
    }

    /**
     * GET /market/indices
     * Major index values: S&P 500 (SPY), NASDAQ (QQQ), Dow (DIA).
     */
    @GetMapping("/indices")
    @Operation(summary = "Get major market index quotes")
    public ResponseEntity<ApiResponse<List<StockQuoteResponse>>> getIndices() {
        List<StockQuote> quotes = marketDataService.getBatchQuotes(
                List.of("SPY", "QQQ", "DIA", "IWM")
        );
        List<StockQuoteResponse> responses = quotes.stream()
                .map(q -> StockQuoteResponse.from(q, null))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
