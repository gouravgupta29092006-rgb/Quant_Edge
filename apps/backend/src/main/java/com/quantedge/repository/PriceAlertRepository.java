package com.quantedge.repository;

import com.quantedge.entity.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceAlertRepository extends JpaRepository<PriceAlert, String> {
    List<PriceAlert> findByUserIdAndStatusNot(String userId, PriceAlert.AlertStatus status);
    List<PriceAlert> findBySymbolAndStatus(String symbol, PriceAlert.AlertStatus status);
    Optional<PriceAlert> findByIdAndUserId(String id, String userId);
}
