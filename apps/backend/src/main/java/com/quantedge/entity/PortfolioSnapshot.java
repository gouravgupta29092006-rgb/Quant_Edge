package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * PortfolioSnapshot â€” daily snapshot of portfolio value for charting.
 */
@Entity
@Table(name = "portfolio_snapshots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"portfolio_id", "snapshot_date"}),
    indexes = {
        @Index(name = "idx_snapshots_portfolio_date", columnList = "portfolio_id, snapshot_date DESC")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "total_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "holdings_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal holdingsValue;

    @Column(name = "cash_balance", nullable = false, precision = 14, scale = 2)
    private BigDecimal cashBalance;

    @Column(name = "daily_return", precision = 8, scale = 4)
    private BigDecimal dailyReturn;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
