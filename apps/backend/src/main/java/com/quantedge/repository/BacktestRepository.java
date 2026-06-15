package com.quantedge.repository;

import com.quantedge.entity.Backtest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BacktestRepository extends JpaRepository<Backtest, String> {
    Page<Backtest> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<Backtest> findByIdAndUserId(String id, String userId);
    Page<Backtest> findByStrategyIdOrderByCreatedAtDesc(String strategyId, Pageable pageable);
}
