package com.quantedge.controller;

import com.quantedge.service.NewsService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
     * GET /news
     * Paginated news feed. Supports ?page, ?size, ?category, ?q (search query).
     * Returns a page-like object: { content: [...], last: bool, totalElements: n }
     */
    @GetMapping
    @Operation(summary = "Get paginated market news feed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNews(
            @RequestParam(defaultValue = "0")    int    page,
            @RequestParam(defaultValue = "20")   int    size,
            @RequestParam(required = false)       String category,
            @RequestParam(name = "q", required = false) String query) {

        List<Map<String, Object>> all = newsService.getMarketNews();

        // Simple keyword filter
        if (query != null && !query.isBlank()) {
            String lq = query.toLowerCase();
            all = all.stream()
                    .filter(n -> {
                        String h = String.valueOf(n.getOrDefault("headline", "")).toLowerCase();
                        String s = String.valueOf(n.getOrDefault("summary",  "")).toLowerCase();
                        return h.contains(lq) || s.contains(lq);
                    }).toList();
        }

        int total = all.size();
        int from  = Math.min(page * size, total);
        int to    = Math.min(from + size, total);
        List<Map<String, Object>> content = all.subList(from, to);

        Map<String, Object> pageResult = new HashMap<>();
        pageResult.put("content",       content);
        pageResult.put("last",          to >= total);
        pageResult.put("totalElements", total);
        pageResult.put("page",          page);
        pageResult.put("size",          size);

        return ResponseEntity.ok(ApiResponse.success(pageResult));
    }

    /**
     * GET /news/market
     * General market news (top stories) — unfiltered list.
     */
    @GetMapping("/market")
    @Operation(summary = "Get general market news")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMarketNews() {
        return ResponseEntity.ok(ApiResponse.success(newsService.getMarketNews()));
    }

    /**
     * GET /news/{symbol}
     * Company-specific news for a ticker symbol.
     */
    @GetMapping("/{symbol}")
    @Operation(summary = "Get news for a specific stock")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCompanyNews(
            @PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getCompanyNews(symbol)));
    }
}
