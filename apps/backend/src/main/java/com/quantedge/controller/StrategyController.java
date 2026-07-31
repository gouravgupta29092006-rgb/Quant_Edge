package com.quantedge.controller;

import com.quantedge.dto.request.BacktestRequest;
import com.quantedge.entity.Backtest;
import com.quantedge.entity.Strategy;
import com.quantedge.service.BacktestService;
import com.quantedge.service.StrategyService;
import com.quantedge.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Strategy & Backtest Controller.
 * Base path: /api/v1/strategies
 * Per TECH_SPEC.md Â§9 â€” Strategy Builder, Â§10 â€” Backtesting Engine.
 */
@RestController
@RequestMapping("/strategies")
@RequiredArgsConstructor
@Tag(name = "Strategies", description = "Trading strategy builder and backtesting")
public class StrategyController {

    private final StrategyService strategyService;
    private final BacktestService backtestService;

    /** GET /strategies â€” list user strategies */
    @GetMapping
    @Operation(summary = "List all user strategies")
    public ResponseEntity<ApiResponse<List<Strategy>>> listStrategies(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(strategyService.getUserStrategies(user.getUsername())));
    }

    /** POST /strategies â€” create new strategy */
    @PostMapping
    @Operation(summary = "Create a new trading strategy")
    public ResponseEntity<ApiResponse<Strategy>> createStrategy(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails user) {
        String name        = String.valueOf(body.getOrDefault("name", "Untitled Strategy"));
        String description = String.valueOf(body.getOrDefault("description", ""));
        @SuppressWarnings("unchecked")
        Map<String, Object> config = (Map<String, Object>) body.getOrDefault("config", Map.of("type", "BUY_AND_HOLD"));
        Strategy strategy = strategyService.createStrategy(user.getUsername(), name, description, config);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(strategy));
    }

    /** GET /strategies/{id} â€” get strategy details */
    @GetMapping("/{id}")
    @Operation(summary = "Get strategy details")
    public ResponseEntity<ApiResponse<Strategy>> getStrategy(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.success(strategyService.getStrategy(id, user.getUsername())));
    }

    /** PUT /strategies/{id} â€” update strategy */
    @PutMapping("/{id}")
    @Operation(summary = "Update a strategy")
    public ResponseEntity<ApiResponse<Strategy>> updateStrategy(
            @PathVariable String id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails user) {
        @SuppressWarnings("unchecked")
        Strategy updated = strategyService.updateStrategy(id, user.getUsername(),
                (String) body.get("name"), (String) body.get("description"),
                (Map<String, Object>) body.get("config"));
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /** DELETE /strategies/{id} â€” delete strategy */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a strategy")
    public ResponseEntity<ApiResponse<Void>> deleteStrategy(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user) {
        strategyService.deleteStrategy(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // â”€â”€â”€ Backtests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /** POST /strategies/{id}/backtests â€” run a backtest */
    @PostMapping("/{id}/backtests")
    @Operation(summary = "Run a backtest on a strategy")
    public ResponseEntity<ApiResponse<Backtest>> runBacktest(
            @PathVariable String id,
            @Valid @RequestBody BacktestRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Backtest backtest = backtestService.initiateBacktest(
                id, user.getUsername(), request.getSymbol(),
                request.getFromDate(), request.getToDate(), request.getInitialCapital());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(backtest));
    }

    /** GET /strategies/{id}/backtests â€” list backtests for a strategy */
    @GetMapping("/{id}/backtests")
    @Operation(summary = "List backtests for a strategy")
    public ResponseEntity<ApiResponse<List<Backtest>>> listBacktests(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails user) {
        List<Backtest> backtests = strategyService.getStrategyBacktests(id, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(backtests));
    }

    /** GET /strategies/backtests/{backtestId} â€” poll backtest status */
    @GetMapping("/backtests/{backtestId}")
    @Operation(summary = "Get backtest status and results")
    public ResponseEntity<ApiResponse<Backtest>> getBacktest(
            @PathVariable String backtestId,
            @AuthenticationPrincipal UserDetails user) {
        Backtest bt = strategyService.getBacktest(backtestId, user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(bt));
    }
}
