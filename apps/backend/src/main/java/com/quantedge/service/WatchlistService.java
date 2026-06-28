package com.quantedge.service;

import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Watchlist service.
 * Each user has exactly one watchlist (auto-created on registration).
 * Max 50 items per watchlist.
 * Per TECH_SPEC.md §7 — Watchlist.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final StockRepository stockRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Get a user's watchlist (creates one if it doesn't exist).
     */
    @Transactional(readOnly = true)
    public Watchlist getWatchlist(String userId) {
        return watchlistRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Watchlist not found"));
    }

    /**
     * Add a symbol to the watchlist.
     */
    public WatchlistItem addSymbol(String userId, String symbol, String notes) {
        String upperSymbol = symbol.toUpperCase();
        Watchlist watchlist = getWatchlist(userId);

        // Check if already in watchlist
        if (watchlistItemRepository.existsByWatchlistIdAndSymbol(watchlist.getId(), upperSymbol)) {
            throw new AppException(ErrorCode.ALREADY_EXISTS, upperSymbol + " is already in your watchlist");
        }

        // Enforce 50-item limit
        if (watchlistItemRepository.countByWatchlistId(watchlist.getId()) >= 50) {
            throw new AppException(ErrorCode.WATCHLIST_LIMIT);
        }

        // Verify stock exists (or create stub entry)
        if (!stockRepository.existsById(upperSymbol)) {
            Stock stub = Stock.builder()
                    .symbol(upperSymbol)
                    .name(upperSymbol)
                    .exchange("UNKNOWN")
                    .isActive(true)
                    .build();
            stockRepository.save(stub);
        }

        Stock stockRef = Stock.builder().symbol(upperSymbol).build();
        WatchlistItem item = WatchlistItem.builder()
                .watchlist(watchlist)
                .stock(stockRef)
                .symbol(upperSymbol)
                .notes(notes)
                .addedAt(Instant.now())
                .sortOrder((int) watchlistItemRepository.countByWatchlistId(watchlist.getId()))
                .build();

        item = watchlistItemRepository.save(item);
        auditLog(userId, AuditLog.AuditAction.WATCHLIST_ADD, upperSymbol);
        log.info("Added {} to watchlist for user {}", upperSymbol, userId);
        return item;
    }

    /**
     * Remove a symbol from the watchlist.
     */
    public void removeSymbol(String userId, String symbol) {
        String upperSymbol = symbol.toUpperCase();
        Watchlist watchlist = getWatchlist(userId);

        if (!watchlistItemRepository.existsByWatchlistIdAndSymbol(watchlist.getId(), upperSymbol)) {
            throw new AppException(ErrorCode.NOT_FOUND, upperSymbol + " is not in your watchlist");
        }

        watchlistItemRepository.deleteByWatchlistIdAndSymbol(watchlist.getId(), upperSymbol);
        auditLog(userId, AuditLog.AuditAction.WATCHLIST_REMOVE, upperSymbol);
    }

    /**
     * Get all items in the watchlist.
     */
    @Transactional(readOnly = true)
    public List<WatchlistItem> getWatchlistItems(String userId) {
        Watchlist watchlist = getWatchlist(userId);
        return watchlistItemRepository.findByWatchlistId(watchlist.getId());
    }

    private void auditLog(String userId, AuditLog.AuditAction action, String symbol) {
        auditLogRepository.save(AuditLog.builder()
                .userId(userId).action(action)
                .entityType("watchlist").entityId(symbol)
                .success(true).build());
    }
}
