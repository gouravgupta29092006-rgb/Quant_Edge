package com.quantedge.repository;

import com.quantedge.entity.Strategy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, String> {
    Page<Strategy> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    Optional<Strategy> findByIdAndUserId(String id, String userId);
    Page<Strategy> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
}
