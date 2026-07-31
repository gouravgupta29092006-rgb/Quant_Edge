package com.quantedge.scheduler;

import com.quantedge.repository.PriceAlertRepository;
import com.quantedge.repository.RefreshTokenRepository;
import com.quantedge.service.MarketDataService;
import com.quantedge.service.PortfolioSnapshotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * All scheduled background jobs.
 * Replaces BullMQ â€” Spring's @Scheduled is free and built-in.
 * Runs in a dedicated thread pool configured in application.yml.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobs {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PriceAlertRepository priceAlertRepository;
    private final MarketDataService marketDataService;
    private final PortfolioSnapshotService portfolioSnapshotService;

    // Top symbols to refresh on the real-time feed
    private static final List<String> TRACKED_SYMBOLS = List.of(
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META",
            "NFLX", "JPM", "V", "MA", "SPY", "QQQ", "DIA", "IWM"
    );

    /**
     * Clean expired refresh tokens every hour.
     * Prevents unbounded growth of the refresh_tokens table.
     */
    @Scheduled(fixedRate = 3600000)   // Every 60 minutes
    @Transactional
    public void cleanExpiredRefreshTokens() {
        int deleted = refreshTokenRepository.deleteExpiredTokens(Instant.now());
        if (deleted > 0) {
            log.info("Cleaned {} expired refresh tokens", deleted);
        }
    }

    /**
     * Refresh tracked symbol prices every 15 seconds and broadcast via WebSocket.
     * Finnhub free tier: 60 req/min â†’ 15 symbols every 15s = safe.
     */
    @Scheduled(fixedRate = 15000)
    public void refreshAndBroadcastPrices() {
        log.debug("Broadcasting price updates for {} symbols", TRACKED_SYMBOLS.size());
        for (String symbol : TRACKED_SYMBOLS) {
            try {
                marketDataService.broadcastPriceUpdate(symbol);
            } catch (Exception e) {
                log.debug("Price broadcast skipped for {}: {}", symbol, e.getMessage());
            }
        }
    }

    /**
     * Check active price alerts every minute.
     * Compares cached prices against alert target values.
     */
    @Scheduled(fixedRate = 60000)
    public void checkPriceAlerts() {
        // Implementation in Phase 13 â€” Real-Time Features
        log.debug("Price alert check: scheduled (Phase 13 implementation)");
    }

    /**
     * Take daily portfolio snapshots at midnight UTC.
     * Stores total value, holdings value, cash for charting.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    public void takeDailyPortfolioSnapshots() {
        log.info("Daily portfolio snapshot job started");
        portfolioSnapshotService.takeAllSnapshots();
    }

    /**
     * Fetch and ingest market news every 15 minutes.
     * Uses Finnhub free API + Alpha Vantage as fallback.
     */
    @Scheduled(fixedRate = 900000)   // Every 15 minutes
    public void ingestMarketNews() {
        // Implementation in Phase 12 â€” News & Intelligence
        log.debug("News ingestion job triggered (Phase 12 implementation)");
    }

    /**
     * Reset daily AI call counters at midnight UTC.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyAiCallCounters() {
        // Implementation in Phase 11 â€” AI Integration
        log.info("Daily AI counter reset triggered (Phase 11 implementation)");
    }
}
