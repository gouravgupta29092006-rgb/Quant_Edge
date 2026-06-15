package com.quantedge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "watchlist_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"watchlist_id", "symbol"}),
    indexes = @Index(name = "idx_watchlist_items_watchlist_id", columnList = "watchlist_id")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "watchlist_id", nullable = false)
    private Watchlist watchlist;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Column(name = "added_at", nullable = false)
    @Builder.Default
    private Instant addedAt = Instant.now();

    @Column(name = "notes", length = 200)
    private String notes;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
