package com.quantedge.repository;

import com.quantedge.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Page<Transaction> findByPortfolioIdOrderByExecutedAtDesc(String portfolioId, Pageable pageable);
    List<Transaction> findByPortfolioIdAndSymbolOrderByExecutedAtDesc(String portfolioId, String symbol);
}
