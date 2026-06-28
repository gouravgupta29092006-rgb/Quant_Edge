package com.quantedge.controller;

import com.quantedge.service.NewsService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * News Controller.
 * Base path: /api/v1/news
 */
@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
@Tag(name = "News", description = "Market and company news from Finnhub")
public class NewsController {

    private final NewsService newsService;

    /**
     * GET /news/market
     * General market news (top stories).
     */
    @GetMapping("/market")
    @Operation(summary = "Get general market news")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMarketNews() {
        return ResponseEntity.ok(ApiResponse.success(newsService.getMarketNews()));
    }

    /**
     * GET /news/{symbol}
     * Company-specific news for a ticker.
     */
    @GetMapping("/{symbol}")
    @Operation(summary = "Get news for a specific stock")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCompanyNews(
            @PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getCompanyNews(symbol)));
    }
}
