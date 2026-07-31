package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Immutable audit log â€” records all significant user actions.
 * Per TECH_SPEC.md Â§14 â€” Audit Trail.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_logs_user_id", columnList = "user_id"),
    @Index(name = "idx_audit_logs_action", columnList = "action"),
    @Index(name = "idx_audit_logs_created", columnList = "created_at DESC")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id")
    private String userId;  // nullable â€” system events have no user

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AuditAction action;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 36)
    private String entityId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;  // JSON string with extra context

    @Column(name = "success", nullable = false)
    @Builder.Default
    private boolean success = true;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum AuditAction {
        AUTH_LOGIN, AUTH_LOGOUT, AUTH_REGISTER, AUTH_PASSWORD_RESET,
        AUTH_2FA_ENABLE, AUTH_2FA_DISABLE, AUTH_2FA_VERIFY,
        TRADE_BUY, TRADE_SELL,
        PORTFOLIO_CREATE, PORTFOLIO_DELETE,
        STRATEGY_CREATE, STRATEGY_DELETE,
        BACKTEST_RUN,
        WATCHLIST_ADD, WATCHLIST_REMOVE,
        ALERT_CREATE, ALERT_DELETE,
        ADMIN_USER_SUSPEND, ADMIN_ROLE_CHANGE,
        AI_CALL
    }
}
