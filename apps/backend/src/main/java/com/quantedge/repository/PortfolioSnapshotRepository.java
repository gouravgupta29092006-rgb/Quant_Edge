package com.quantedge.repository;

import com.quantedge.entity.PortfolioSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioSnapshotRepository extends JpaRepository<PortfolioSnapshot, String> {
    List<PortfolioSnapshot> findByPortfolioIdOrderBySnapshotDateAsc(String portfolioId);
    List<PortfolioSnapshot> findByPortfolioIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(String portfolioId, LocalDate start, LocalDate end);
    Optional<PortfolioSnapshot> findByPortfolioIdAndSnapshotDate(String portfolioId, LocalDate date);
    Optional<PortfolioSnapshot> findTopByPortfolioIdOrderBySnapshotDateDesc(String portfolioId);
}
