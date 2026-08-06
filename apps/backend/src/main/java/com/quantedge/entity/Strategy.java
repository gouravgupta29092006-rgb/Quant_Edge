package com.quantedge.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "strategies", indexes = {
    @Index(name = "idx_strategies_user_id", columnList = "user_id"),
    @Index(name = "idx_strategies_status", columnList = "status"),
    @Index(name = "idx_strategies_is_public", columnList = "is_public")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Strategy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Stored as JSON array of strings
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private StrategyStatus status = StrategyStatus.DRAFT;

    // JSON columns â€” store structured rule definitions
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rules", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> rules = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "indicators", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> indicators = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "entry_conditions", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> entryConditions = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "exit_conditions", columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, Object> exitConditions = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "position_sizing", nullable = false)
    @Builder.Default
    private PositionSizing positionSizing = PositionSizing.PERCENTAGE;

    @Column(name = "position_value", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal positionValue = BigDecimal.valueOf(100);

    @Column(name = "stop_loss_pct", precision = 6, scale = 2)
    private BigDecimal stopLossPct;

    @Column(name = "take_profit_pct", precision = 6, scale = 2)
    private BigDecimal takeProfitPct;

    @Column(name = "ai_confidence", precision = 5, scale = 2)
    private BigDecimal aiConfidence;

    @Column(name = "ai_notes", columnDefinition = "TEXT")
    private String aiNotes;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "strategy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Backtest> backtests = new ArrayList<>();

    public enum StrategyStatus { DRAFT, ACTIVE, ARCHIVED }
    public enum PositionSizing { PERCENTAGE, FIXED_AMOUNT, FIXED_SHARES }
}
