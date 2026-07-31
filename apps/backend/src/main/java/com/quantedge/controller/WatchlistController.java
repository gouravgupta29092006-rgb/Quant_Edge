package com.quantedge.controller;

import com.quantedge.entity.Watchlist;
import com.quantedge.entity.WatchlistItem;
import com.quantedge.service.WatchlistService;
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

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist", description = "Stock watchlist management")
public class WatchlistController {

    private final WatchlistService watchlistService;

    /** GET /watchlist — get user watchlist with all items */
    @GetMapping
    @Operation(summary = "Get user watchlist")
    public ResponseEntity<ApiResponse<List<WatchlistItem>>> getWatchlist(
            @AuthenticationPrincipal UserDetails user) {
        List<WatchlistItem> items = watchlistService.getWatchlistItems(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /** POST /watchlist — add symbol */
    @PostMapping
    @Operation(summary = "Add stock to watchlist")
    public ResponseEntity<ApiResponse<WatchlistItem>> addSymbol(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails user) {
        String symbol = body.get("symbol");
        String notes  = body.get("notes");
        WatchlistItem item = watchlistService.addSymbol(user.getUsername(), symbol, notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(item));
    }

    /** DELETE /watchlist/{symbol} — remove symbol */
    @DeleteMapping("/{symbol}")
    @Operation(summary = "Remove stock from watchlist")
    public ResponseEntity<ApiResponse<Void>> removeSymbol(
            @PathVariable String symbol,
            @AuthenticationPrincipal UserDetails user) {
        watchlistService.removeSymbol(user.getUsername(), symbol);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
