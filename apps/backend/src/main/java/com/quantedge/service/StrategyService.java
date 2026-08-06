package com.quantedge.service;

import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.repository.BacktestRepository;
import com.quantedge.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Strategy service â€” CRUD for trading strategies.
 * Strategies are user-defined rule sets (JSON) persisted to DB.
 * Per TECH_SPEC.md Â§9 â€” Strategy Builder.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StrategyService {

    private final StrategyRepository strategyRepository;
    private final BacktestRepository backtestRepository;

    // â”€â”€â”€ Strategy CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional(readOnly = true)
    public List<Strategy> getUserStrategies(String userId) {
        return strategyRepository.findByUserIdOrderByCreatedAtDesc(
                userId,
                org.springframework.data.domain.PageRequest.of(0, 100)
        ).getContent();
    }

    @Transactional(readOnly = true)
    public Strategy getStrategy(String strategyId, String userId) {
        return strategyRepository.findByIdAndUserId(strategyId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.STRATEGY_NOT_FOUND));
    }

    public Strategy createStrategy(String userId, String name, String description, Map<String, Object> config) {
        User userRef = User.builder().id(userId).build();
        Strategy strategy = Strategy.builder()
                .user(userRef)
                .name(name.trim())
                .description(description)
                .rules(new java.util.HashMap<>(config != null ? config : Map.of()))
                .indicators(new java.util.HashMap<>())
                .entryConditions(new java.util.HashMap<>())
                .exitConditions(new java.util.HashMap<>())
                .build();
        strategy = strategyRepository.save(strategy);
        log.info("Strategy created: {} for user: {}", strategy.getId(), userId);
        return strategy;
    }

    public Strategy updateStrategy(String strategyId, String userId,
                                   String name, String description, Map<String, Object> config) {
        Strategy strategy = getStrategy(strategyId, userId);
        if (name != null) strategy.setName(name.trim());
        if (description != null) strategy.setDescription(description);
        if (config != null) strategy.setRules(config);  // rules stores the config
        return strategyRepository.save(strategy);
    }

    public void deleteStrategy(String strategyId, String userId) {
        Strategy strategy = getStrategy(strategyId, userId);
        strategyRepository.delete(strategy);
        log.info("Strategy deleted: {}", strategyId);
    }

    // â”€â”€â”€ Backtests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional(readOnly = true)
    public List<Backtest> getStrategyBacktests(String strategyId, String userId) {
        getStrategy(strategyId, userId); // ownership check
        return backtestRepository.findByStrategyIdOrderByCreatedAtDesc(
                strategyId, org.springframework.data.domain.PageRequest.of(0, 100)
        ).getContent();
    }

    @Transactional(readOnly = true)
    public Backtest getBacktest(String backtestId, String userId) {
        Backtest bt = backtestRepository.findById(backtestId)
                .orElseThrow(() -> new AppException(ErrorCode.BACKTEST_NOT_FOUND));
        // Verify user owns the parent strategy
        getStrategy(bt.getStrategy().getId(), userId);
        return bt;
    }
}
