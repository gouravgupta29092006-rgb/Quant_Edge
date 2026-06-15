package com.quantedge.scheduler;

import com.quantedge.repository.PriceAlertRepository;
import com.quantedge.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * All scheduled background jobs.
 * Replaces BullMQ — Spring's @Scheduled is free and built-in.
 * Runs in a dedicated thread pool configured in application.yml.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledJobs {

    private final RefreshTokenRepository refreshTokenRepository;
    private final PriceAlertRepository priceAlertRepository;

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
     * Check active price alerts every minute.
     * Fetches current prices from cache and evaluates conditions.
     * Triggered alerts send notifications + emails.
     */
    @Scheduled(fixedRate = 60000)    // Every 1 minute
    public void checkPriceAlerts() {
        // Implementation in Phase 13 — Real-Time Features
        log.debug("Price alert check: scheduled (Phase 13 implementation)");
    }

    /**
     * Take daily portfolio snapshots at midnight UTC.
     * Stores total value, holdings value, cash for charting.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")    // Midnight UTC
    public void takeDailyPortfolioSnapshots() {
        // Implementation in Phase 5 — Portfolio & Trading
        log.info("Daily portfolio snapshot job triggered (Phase 5 implementation)");
    }

    /**
     * Fetch and ingest market news every 15 minutes.
     * Uses Finnhub free API + Alpha Vantage as fallback.
     */
    @Scheduled(fixedRate = 900000)   // Every 15 minutes
    public void ingestMarketNews() {
        // Implementation in Phase 12 — News & Intelligence
        log.debug("News ingestion job triggered (Phase 12 implementation)");
    }

    /**
     * Reset daily AI call counters at midnight UTC.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyAiCallCounters() {
        // Implementation in Phase 11 — AI Integration
        log.info("Daily AI counter reset triggered (Phase 11 implementation)");
    }
}
