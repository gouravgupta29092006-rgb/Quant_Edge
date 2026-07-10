package com.quantedge.repository;

import com.quantedge.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, String> {
    Optional<WatchlistItem> findByWatchlistIdAndSymbol(String watchlistId, String symbol);
    boolean existsByWatchlistIdAndSymbol(String watchlistId, String symbol);
    long countByWatchlistId(String watchlistId);
    void deleteByWatchlistIdAndSymbol(String watchlistId, String symbol);
    java.util.List<WatchlistItem> findByWatchlistIdOrderBySortOrderAsc(String watchlistId);
}
