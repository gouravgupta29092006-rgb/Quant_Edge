package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "user_preferences")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "default_chart_type", length = 20)
    @Builder.Default
    private String defaultChartType = "candlestick";

    @Column(name = "default_time_range", length = 10)
    @Builder.Default
    private String defaultTimeRange = "1D";

    @Column(name = "number_format", length = 10)
    @Builder.Default
    private String numberFormat = "en-US";

    @Column(name = "email_daily_digest")
    @Builder.Default
    private boolean emailDailyDigest = true;

    @Column(name = "email_price_alerts")
    @Builder.Default
    private boolean emailPriceAlerts = true;

    @Column(name = "email_portfolio")
    @Builder.Default
    private boolean emailPortfolio = false;

    @Column(name = "email_earnings")
    @Builder.Default
    private boolean emailEarnings = true;

    @Column(name = "notif_price_alerts")
    @Builder.Default
    private boolean notifPriceAlerts = true;

    @Column(name = "notif_portfolio")
    @Builder.Default
    private boolean notifPortfolio = true;

    @Column(name = "notif_backtest")
    @Builder.Default
    private boolean notifBacktest = true;

    @Column(name = "notif_earnings")
    @Builder.Default
    private boolean notifEarnings = true;

    @Column(name = "onboarding_completed")
    @Builder.Default
    private boolean onboardingCompleted = false;

    @Column(name = "user_type", length = 30)
    private String userType;   // beginner | student | builder | enthusiast

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
