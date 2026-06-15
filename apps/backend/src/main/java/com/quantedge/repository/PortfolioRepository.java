package com.quantedge.repository;

import com.quantedge.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, String> {
    List<Portfolio> findByUserIdAndIsDeletedFalseOrderByCreatedAtAsc(String userId);
    Optional<Portfolio> findByIdAndUserIdAndIsDeletedFalse(String id, String userId);
    long countByUserIdAndIsDeletedFalse(String userId);
    boolean existsByUserIdAndNameAndIsDeletedFalse(String userId, String name);
}
