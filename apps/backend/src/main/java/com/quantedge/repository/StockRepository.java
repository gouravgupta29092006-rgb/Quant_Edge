package com.quantedge.repository;

import com.quantedge.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, String> {
    @Query("SELECT s FROM Stock s WHERE LOWER(s.symbol) LIKE LOWER(CONCAT(:q, '%')) OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) AND s.isActive = true")
    Page<Stock> searchBySymbolOrName(String q, Pageable pageable);

    List<Stock> findBySectorAndIsActiveTrue(String sector);
}
