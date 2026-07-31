package com.quantedge.service;

import com.quantedge.entity.Holding;
import com.quantedge.entity.Portfolio;
import com.quantedge.entity.PortfolioSnapshot;
import com.quantedge.entity.StockQuote;
import com.quantedge.repository.HoldingRepository;
import com.quantedge.repository.PortfolioRepository;
import com.quantedge.repository.PortfolioSnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Portfolio snapshot service.
 * Takes a daily snapshot of each portfolio's total value.
 * Used by the performance chart on the dashboard.
 * Called by ScheduledJobs at midnight UTC.
 * Per TECH_SPEC.md Â§6 â€” Portfolio Analytics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioSnapshotService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final PortfolioSnapshotRepository snapshotRepository;
    private final MarketDataService marketDataService;

    /**
     * Take a snapshot of ALL active portfolios.
     * Called by ScheduledJobs.takeDailyPortfolioSnapshots().
     */
    @Transactional
    public void takeAllSnapshots() {
        List<Portfolio> allPortfolios = portfolioRepository.findAll();
        LocalDate today = LocalDate.now();
        int count = 0;

        for (Portfolio portfolio : allPortfolios) {
            if (portfolio.isDeleted()) continue;
            try {
                takeSnapshot(portfolio, today);
                count++;
            } catch (Exception e) {
                log.error("Snapshot failed for portfolio {}: {}", portfolio.getId(), e.getMessage());
            }
        }
        log.info("Daily snapshots taken for {} portfolios", count);
    }

    /**
     * Take a snapshot for a single portfolio.
     */
    @Transactional
    public void takeSnapshot(Portfolio portfolio, LocalDate date) {
        // Skip if already snapshotted today
        if (snapshotRepository.findByPortfolioIdAndSnapshotDate(portfolio.getId(), date).isPresent()) {
            return;
        }

        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolio.getId());
        BigDecimal holdingsValue = BigDecimal.ZERO;

        for (Holding h : holdings) {
            try {
                StockQuote q = marketDataService.getQuote(h.getSymbol());
                holdingsValue = holdingsValue.add(q.getPrice().multiply(h.getShares()));
            } catch (Exception e) {
                holdingsValue = holdingsValue.add(h.getTotalCost());
            }
        }

        BigDecimal totalValue = portfolio.getCashBalance().add(holdingsValue);

        // Calculate daily return vs yesterday's snapshot
        BigDecimal dailyReturn = null;
        Optional<PortfolioSnapshot> yesterday = snapshotRepository
                .findTopByPortfolioIdOrderBySnapshotDateDesc(portfolio.getId());
        if (yesterday.isPresent() && yesterday.get().getTotalValue().compareTo(BigDecimal.ZERO) > 0) {
            dailyReturn = totalValue.subtract(yesterday.get().getTotalValue())
                    .divide(yesterday.get().getTotalValue(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        PortfolioSnapshot snapshot = PortfolioSnapshot.builder()
                .portfolio(portfolio)
                .snapshotDate(date)
                .totalValue(totalValue)
                .holdingsValue(holdingsValue)
                .cashBalance(portfolio.getCashBalance())
                .dailyReturn(dailyReturn)
                .build();

        snapshotRepository.save(snapshot);
        log.debug("Snapshot saved: portfolio={} date={} value=${}", portfolio.getId(), date, totalValue);
    }

    /**
     * Get snapshot history for a portfolio (for performance chart).
     */
    @Transactional(readOnly = true)
    public List<PortfolioSnapshot> getSnapshotHistory(String portfolioId, LocalDate from, LocalDate to) {
        return snapshotRepository.findByPortfolioIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                portfolioId, from, to);
    }
}
