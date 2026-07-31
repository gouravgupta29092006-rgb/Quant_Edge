package com.quantedge.controller;

import com.quantedge.dto.request.CreatePortfolioRequest;
import com.quantedge.dto.request.TradeRequest;
import com.quantedge.dto.response.PortfolioResponse;
import com.quantedge.entity.Portfolio;
import com.quantedge.entity.Transaction;
import com.quantedge.service.PortfolioService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Portfolio & Trading REST Controller.
 * All endpoints require authentication.
 *
 * Base path: /api/v1/portfolios
 * Per APPFLOW.md â€” Portfolio Module.
 */
@RestController
@RequestMapping("/portfolios")
@RequiredArgsConstructor
@Tag(name = "Portfolios", description = "Virtual portfolio management and paper trading")
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * GET /portfolios
     * List all portfolios for the authenticated user.
     */
    @GetMapping
    @Operation(summary = "Get all user portfolios")
    public ResponseEntity<ApiResponse<List<Portfolio>>> getPortfolios(
            @AuthenticationPrincipal UserDetails user) {

        List<Portfolio> portfolios = portfolioService.getUserPortfolios(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(portfolios));
    }

    /**
     * POST /portfolios
     * Create a new virtual portfolio.
     */
    @PostMapping
    @Operation(summary = "Create a new portfolio")
    public ResponseEntity<ApiResponse<Portfolio>> createPortfolio(
            @Valid @RequestBody CreatePortfolioRequest request,
            @AuthenticationPrincipal UserDetails user) {

        Portfolio portfolio = portfolioService.createPortfolio(user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(portfolio));
    }

    /**
     * GET /portfolios/{id}
     * Get portfolio details with current holdings values.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get portfolio with live market values")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getPortfolio(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user) {

        PortfolioResponse response = portfolioService.getPortfolioWithValues(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * DELETE /portfolios/{id}
     * Soft-delete a portfolio.
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a portfolio")
    public ResponseEntity<ApiResponse<Void>> deletePortfolio(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user) {

        portfolioService.deletePortfolio(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * POST /portfolios/{id}/trade
     * Execute a BUY or SELL paper trade.
     * Body: { symbol, type, shares, limitPrice?, notes? }
     */
    @PostMapping("/{id}/trade")
    @Operation(summary = "Execute a paper trade (BUY or SELL)")
    public ResponseEntity<ApiResponse<Transaction>> executeTrade(
            @PathVariable String id,
            @Valid @RequestBody TradeRequest request,
            @AuthenticationPrincipal UserDetails user) {

        Transaction tx = portfolioService.executeTrade(id, user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(tx));
    }

    /**
     * GET /portfolios/{id}/transactions?page=0&size=20
     * Paginated transaction history for a portfolio.
     */
    @GetMapping("/{id}/transactions")
    @Operation(summary = "Get paginated transaction history")
    public ResponseEntity<ApiResponse<Page<Transaction>>> getTransactions(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails user) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<Transaction> transactions = portfolioService.getTransactions(id, user.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}
