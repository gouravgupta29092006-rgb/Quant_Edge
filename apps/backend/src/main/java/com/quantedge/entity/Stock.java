package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Cached stock metadata. Symbol is the PK.
 * Updated periodically from external APIs.
 */
@Entity
@Table(name = "stocks", indexes = {
    @Index(name = "idx_stocks_name", columnList = "name"),
    @Index(name = "idx_stocks_sector", columnList = "sector"),
    @Index(name = "idx_stocks_is_active", columnList = "is_active")
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stock {

    @Id
    @Column(name = "symbol", length = 10, nullable = false)
    private String symbol;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "exchange", nullable = false, length = 20)
    private String exchange;

    @Column(name = "sector", length = 100)
    private String sector;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "employees")
    private Integer employees;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "country", length = 5)
    @Builder.Default
    private String country = "US";

    @Column(name = "currency", length = 5)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
