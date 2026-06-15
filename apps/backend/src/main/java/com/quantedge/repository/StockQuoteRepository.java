package com.quantedge.repository;

import com.quantedge.entity.StockQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockQuoteRepository extends JpaRepository<StockQuote, String> {
    List<StockQuote> findBySymbolIn(List<String> symbols);
}
