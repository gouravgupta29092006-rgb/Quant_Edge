package com.quantedge.controller;

import com.quantedge.dto.response.PortfolioAnalyticsResponse;
import com.quantedge.service.AnalyticsService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Analytics Controller.
 * Per TECH_SPEC.md §8 — Analytics Engine.
 * Base path: /api/v1/analytics
 */
@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Portfolio risk metrics and performance analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /analytics/{portfolioId}?from=2024-01-01&to=2024-12-31
     * Full risk/return analytics for a portfolio.
     */
    @GetMapping("/{portfolioId}")
    @Operation(summary = "Get full portfolio analytics (Sharpe, Sortino, drawdown, etc.)")
    public ResponseEntity<ApiResponse<PortfolioAnalyticsResponse>> getAnalytics(
            @PathVariable String portfolioId,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().minusYears(1).toString()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal UserDetails user) {

        PortfolioAnalyticsResponse analytics =
                analyticsService.computeAnalytics(portfolioId, user.getUsername(), from, to);

        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    /**
     * GET /analytics/{portfolioId}/equity-curve?from=...&to=...
     * Daily equity curve data for performance chart.
     */
    @GetMapping("/{portfolioId}/equity-curve")
    @Operation(summary = "Get equity curve for charting")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEquityCurve(
            @PathVariable String portfolioId,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().minusYears(1).toString()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(defaultValue = "#{T(java.time.LocalDate).now().toString()}")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal UserDetails user) {

        List<Map<String, Object>> curve =
                analyticsService.getEquityCurve(portfolioId, user.getUsername(), from, to);

        return ResponseEntity.ok(ApiResponse.success(curve));
    }
}
