package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Transaction entity — immutable ledger of all trades and cash movements.
 */
@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transactions_portfolio_executed", columnList = "portfolio_id, executed_at DESC"),
    @Index(name = "idx_transactions_portfolio_type", columnList = "portfolio_id, type"),
    @Index(name = "idx_transactions_symbol", columnList = "symbol")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "symbol", length = 10)
    private String symbol;  // null for cash transactions

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    @Builder.Default
    private OrderType orderType = OrderType.MARKET;

    @Column(name = "shares", precision = 12, scale = 4)
    private BigDecimal shares;

    @Column(name = "price_per_share", precision = 12, scale = 4)
    private BigDecimal pricePerShare;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;  // + credit / - debit

    @Column(name = "commission", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "executed_at", nullable = false)
    @Builder.Default
    private Instant executedAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum TransactionType {
        BUY, SELL, DIVIDEND, CASH_DEPOSIT, CASH_WITHDRAWAL
    }

    public enum OrderType {
        MARKET, LIMIT
    }
}
