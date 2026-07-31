package com.quantedge.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Full analytics response for a portfolio.
 * Sent to the dashboard analytics panel.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortfolioAnalyticsResponse {

    private String portfolioId;
    private LocalDate fromDate;
    private LocalDate toDate;

    // Returns
    private BigDecimal totalReturnPct;
    private BigDecimal annualisedReturnPct;

    // Risk metrics
    private BigDecimal volatilityPct;
    private BigDecimal sharpeRatio;
    private BigDecimal sortinoRatio;
    private BigDecimal maxDrawdownPct;
    private LocalDate  maxDrawdownStart;
    private LocalDate  maxDrawdownEnd;
    private BigDecimal bestDayPct;
    private BigDecimal worstDayPct;

    // Trade metrics
    private int        totalTrades;
    private BigDecimal winRate;         // as %
    private BigDecimal profitFactor;
    private BigDecimal avgWinPct;
    private BigDecimal avgLossPct;

    /** Factory for when there is insufficient data (< 2 snapshots). */
    public static PortfolioAnalyticsResponse empty(String portfolioId, LocalDate from, LocalDate to) {
        return PortfolioAnalyticsResponse.builder()
                .portfolioId(portfolioId)
                .fromDate(from)
                .toDate(to)
                .totalReturnPct(BigDecimal.ZERO)
                .annualisedReturnPct(BigDecimal.ZERO)
                .volatilityPct(BigDecimal.ZERO)
                .sharpeRatio(BigDecimal.ZERO)
                .sortinoRatio(BigDecimal.ZERO)
                .maxDrawdownPct(BigDecimal.ZERO)
                .bestDayPct(BigDecimal.ZERO)
                .worstDayPct(BigDecimal.ZERO)
                .totalTrades(0)
                .winRate(BigDecimal.ZERO)
                .profitFactor(BigDecimal.ZERO)
                .avgWinPct(BigDecimal.ZERO)
                .avgLossPct(BigDecimal.ZERO)
                .build();
    }
}
