package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Latest real-time quote per stock symbol.
 * One row per symbol — upserted on every price update.
 * Backed by Redis cache for sub-second reads.
 */
@Entity
@Table(name = "stock_quotes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockQuote {

    @Id
    @Column(name = "symbol", length = 10)
    private String symbol;

    @Column(name = "price", nullable = false, precision = 12, scale = 4)
    private BigDecimal price;

    @Column(name = "open", precision = 12, scale = 4)
    private BigDecimal open;

    @Column(name = "high", precision = 12, scale = 4)
    private BigDecimal high;

    @Column(name = "low", precision = 12, scale = 4)
    private BigDecimal low;

    @Column(name = "prev_close", precision = 12, scale = 4)
    private BigDecimal prevClose;

    @Column(name = "change_amount", precision = 12, scale = 4)
    private BigDecimal changeAmount;

    @Column(name = "change_percent", precision = 8, scale = 4)
    private BigDecimal changePercent;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "avg_volume")
    private Long avgVolume;

    @Column(name = "market_cap")
    private Long marketCap;

    @Column(name = "pe_ratio", precision = 10, scale = 2)
    private BigDecimal peRatio;

    @Column(name = "eps", precision = 10, scale = 4)
    private BigDecimal eps;

    @Column(name = "beta", precision = 8, scale = 4)
    private BigDecimal beta;

    @Column(name = "dividend_yield", precision = 8, scale = 4)
    private BigDecimal dividendYield;

    @Column(name = "week_52_high", precision = 12, scale = 4)
    private BigDecimal week52High;

    @Column(name = "week_52_low", precision = 12, scale = 4)
    private BigDecimal week52Low;

    @Column(name = "shares_outstanding")
    private Long sharesOutstanding;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
