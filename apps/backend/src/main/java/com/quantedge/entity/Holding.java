package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Holding entity — one row per stock per portfolio.
 * Updated on every trade. Stores average cost basis.
 */
@Entity
@Table(name = "holdings",
    uniqueConstraints = @UniqueConstraint(columnNames = {"portfolio_id", "symbol"}),
    indexes = {
        @Index(name = "idx_holdings_portfolio_id", columnList = "portfolio_id"),
        @Index(name = "idx_holdings_symbol", columnList = "symbol")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "shares", nullable = false, precision = 12, scale = 4)
    private BigDecimal shares;

    @Column(name = "average_cost", nullable = false, precision = 12, scale = 4)
    private BigDecimal averageCost;

    @Column(name = "total_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalCost;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
