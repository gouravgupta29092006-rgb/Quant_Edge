package com.quantedge.repository;

import com.quantedge.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, String> {
    List<Holding> findByPortfolioId(String portfolioId);
    Optional<Holding> findByPortfolioIdAndSymbol(String portfolioId, String symbol);
    void deleteByPortfolioIdAndSymbol(String portfolioId, String symbol);
}
