package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "price_alerts", indexes = {
    @Index(name = "idx_price_alerts_user_id", columnList = "user_id"),
    @Index(name = "idx_price_alerts_symbol_status", columnList = "symbol, status")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition", nullable = false)
    private AlertCondition condition;

    @Column(name = "target_value", nullable = false, precision = 12, scale = 4)
    private BigDecimal targetValue;

    @Column(name = "message", length = 300)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AlertStatus status = AlertStatus.ACTIVE;

    @Column(name = "triggered_at")
    private Instant triggeredAt;

    @Column(name = "triggered_price", precision = 12, scale = 4)
    private BigDecimal triggeredPrice;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public enum AlertCondition {
        ABOVE, BELOW, PERCENT_CHANGE_UP, PERCENT_CHANGE_DOWN
    }

    public enum AlertStatus {
        ACTIVE, TRIGGERED, PAUSED, DELETED
    }
}
