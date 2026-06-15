package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "backtests", indexes = {
    @Index(name = "idx_backtests_user_created", columnList = "user_id, created_at DESC"),
    @Index(name = "idx_backtests_strategy_id", columnList = "strategy_id"),
    @Index(name = "idx_backtests_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Backtest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Strategy strategy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    @Column(name = "name", length = 200)
    private String name;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "initial_capital", nullable = false, precision = 14, scale = 2)
    private BigDecimal initialCapital;

    @Column(name = "commission", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal commission = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "position_sizing", nullable = false)
    @Builder.Default
    private Strategy.PositionSizing positionSizing = Strategy.PositionSizing.PERCENTAGE;

    @Column(name = "position_value", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal positionValue = BigDecimal.valueOf(100);

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BacktestStatus status = BacktestStatus.QUEUED;

    @Column(name = "progress_step", nullable = false)
    @Builder.Default
    private int progressStep = 0;

    @Column(name = "progress_percent", nullable = false)
    @Builder.Default
    private int progressPercent = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    // ─── Result metrics ───────────────────────────────────────
    @Column(name = "total_return_pct", precision = 10, scale = 4)
    private BigDecimal totalReturnPct;
    @Column(name = "annualized_return", precision = 10, scale = 4)
    private BigDecimal annualizedReturn;
    @Column(name = "sharpe_ratio", precision = 8, scale = 4)
    private BigDecimal sharpeRatio;
    @Column(name = "sortino_ratio", precision = 8, scale = 4)
    private BigDecimal sortinoRatio;
    @Column(name = "max_drawdown_pct", precision = 8, scale = 4)
    private BigDecimal maxDrawdownPct;
    @Column(name = "max_drawdown_start")
    private LocalDate maxDrawdownStart;
    @Column(name = "max_drawdown_end")
    private LocalDate maxDrawdownEnd;
    @Column(name = "volatility", precision = 8, scale = 4)
    private BigDecimal volatility;
    @Column(name = "win_rate", precision = 6, scale = 4)
    private BigDecimal winRate;
    @Column(name = "total_trades")
    private Integer totalTrades;
    @Column(name = "profitable_trades")
    private Integer profitableTrades;
    @Column(name = "losing_trades")
    private Integer losingTrades;
    @Column(name = "avg_profit_pct", precision = 8, scale = 4)
    private BigDecimal avgProfitPct;
    @Column(name = "avg_loss_pct", precision = 8, scale = 4)
    private BigDecimal avgLossPct;
    @Column(name = "profit_factor", precision = 8, scale = 4)
    private BigDecimal profitFactor;
    @Column(name = "benchmark_return", precision = 10, scale = 4)
    private BigDecimal benchmarkReturn;
    @Column(name = "alpha", precision = 8, scale = 4)
    private BigDecimal alpha;
    @Column(name = "beta", precision = 8, scale = 4)
    private BigDecimal beta;

    // ─── JSON result blobs ─────────────────────────────────────
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "equity_curve", columnDefinition = "jsonb")
    private Object equityCurve;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "trade_log", columnDefinition = "jsonb")
    private Object tradeLog;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "monthly_returns", columnDefinition = "jsonb")
    private Object monthlyReturns;

    @Column(name = "ai_interpretation", columnDefinition = "TEXT")
    private String aiInterpretation;
    @Column(name = "ai_generated_at")
    private Instant aiGeneratedAt;

    @Column(name = "started_at")
    private Instant startedAt;
    @Column(name = "completed_at")
    private Instant completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum BacktestStatus { QUEUED, RUNNING, COMPLETED, FAILED, TIMEOUT, CANCELLED }
}
