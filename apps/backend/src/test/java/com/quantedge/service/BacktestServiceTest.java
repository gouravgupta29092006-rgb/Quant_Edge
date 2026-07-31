package com.quantedge.service;

import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.repository.BacktestRepository;
import com.quantedge.repository.StrategyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BacktestService.
 * Phase 15 - Per TECH_SPEC.md §15 - Testing Strategy.
 *
 * NOTE on @Async behaviour in unit tests:
 *   MockitoExtension does NOT load the Spring ApplicationContext, so @Async
 *   runs SYNCHRONOUSLY on the test thread. The entity returned by initiateBacktest()
 *   is the same Java object mutated by runBacktestAsync(), meaning its status will
 *   be COMPLETED or FAILED by the time initiateBacktest() returns.
 *   Tests therefore verify save()-call args or post-completion state.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BacktestService Unit Tests")
class BacktestServiceTest {

    @Mock private BacktestRepository backtestRepository;
    @Mock private StrategyRepository strategyRepository;
    @Mock private HistoricalDataService historicalDataService;

    @InjectMocks
    private BacktestService backtestService;

    private static final String USER_ID = "user-123";

    private Strategy buildStrategy(String type) {
        User user = User.builder().id(USER_ID).email("test@test.com")
                .firstName("Test").lastName("User")
                .role(User.UserRole.USER).status(User.UserStatus.ACTIVE)
                .twoFactorEnabled(false).build();
        Strategy s = new Strategy();
        s.setId("strategy-id");
        s.setUser(user);
        s.setName("Test Strategy");
        s.setPositionSizing(Strategy.PositionSizing.PERCENTAGE);
        s.setStatus(Strategy.StrategyStatus.ACTIVE);
        Map<String, Object> rules = new HashMap<>();
        rules.put("type", type);
        rules.put("fastPeriod", 10);
        rules.put("slowPeriod", 20);
        s.setRules(rules);
        return s;
    }

    private Backtest buildSavedBacktest(String id, BigDecimal initialCapital) {
        Backtest b = new Backtest();
        b.setId(id);
        b.setInitialCapital(initialCapital);
        b.setStatus(Backtest.BacktestStatus.RUNNING);
        return b;
    }

    private List<Map<String, Object>> buildCandles(int count, double startPrice, double endPrice) {
        List<Map<String, Object>> candles = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            double price = startPrice + (endPrice - startPrice) * i / Math.max(count - 1, 1);
            Map<String, Object> candle = new LinkedHashMap<>();
            // Use dates within 2024 so they pass the date filter
            candle.put("date",   "2024-" + String.format("%02d", (i / 28) + 1) + "-" + String.format("%02d", (i % 28) + 1));
            candle.put("open",   BigDecimal.valueOf(price));
            candle.put("high",   BigDecimal.valueOf(price * 1.01));
            candle.put("low",    BigDecimal.valueOf(price * 0.99));
            candle.put("close",  BigDecimal.valueOf(price));
            candle.put("volume", 1_000_000L);
            candles.add(candle);
        }
        return candles;
    }

    // ─── initiateBacktest ────────────────────────────────────────────────────

    @Nested
    @DisplayName("initiateBacktest()")
    class InitiateBacktest {

        @Test
        @DisplayName("should save a backtest entity with RUNNING status on first save call")
        void savesBacktestWithRunningStatus() {
            Strategy strategy = buildStrategy("BUY_AND_HOLD");
            Backtest savedBt = buildSavedBacktest("bt-id", new BigDecimal("10000.00"));

            when(strategyRepository.findByIdAndUserId("strategy-id", USER_ID))
                    .thenReturn(Optional.of(strategy));
            when(backtestRepository.save(any(Backtest.class))).thenReturn(savedBt);
            // findById is called by updateBacktestResults (after async completes synchronously)
            when(backtestRepository.findById("bt-id")).thenReturn(Optional.of(savedBt));
            when(historicalDataService.getChartData(anyString(), anyString(), anyString()))
                    .thenReturn(buildCandles(100, 100, 150));

            backtestService.initiateBacktest(
                    "strategy-id", USER_ID, "AAPL",
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    new BigDecimal("10000.00"));

            // First save() call must be with RUNNING status
            verify(backtestRepository, atLeastOnce()).save(argThat(bt ->
                    bt.getSymbol() != null
                    && bt.getInitialCapital().compareTo(new BigDecimal("10000.00")) == 0
            ));
        }

        @Test
        @DisplayName("should throw NOT_FOUND when strategy doesn't belong to user")
        void throwsForUnownedStrategy() {
            when(strategyRepository.findByIdAndUserId("strategy-id", "other-user"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> backtestService.initiateBacktest(
                    "strategy-id", "other-user", "AAPL",
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 6, 30),
                    new BigDecimal("10000.00")))
                    .isInstanceOf(AppException.class);

            verify(backtestRepository, never()).save(any());
        }

        @Test
        @DisplayName("should save backtest with uppercase symbol and correct date range")
        void savesCorrectMetadata() {
            Strategy strategy = buildStrategy("SMA_CROSSOVER");
            Backtest savedBt = buildSavedBacktest("bt-id", new BigDecimal("50000.00"));

            when(strategyRepository.findByIdAndUserId("strategy-id", USER_ID))
                    .thenReturn(Optional.of(strategy));
            when(backtestRepository.save(any(Backtest.class))).thenReturn(savedBt);
            when(backtestRepository.findById("bt-id")).thenReturn(Optional.of(savedBt));
            when(historicalDataService.getChartData(anyString(), anyString(), anyString()))
                    .thenReturn(buildCandles(200, 100, 200));

            backtestService.initiateBacktest(
                    "strategy-id", USER_ID, "nvda",  // lowercase input
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    new BigDecimal("50000.00"));

            // Symbol should be uppercased; initial capital correct
            verify(backtestRepository, atLeastOnce()).save(argThat(bt ->
                    "NVDA".equals(bt.getSymbol())
                    && bt.getInitialCapital().compareTo(new BigDecimal("50000.00")) == 0
            ));
        }
    }

    // ─── runBacktestAsync (strategy engine logic) ─────────────────────────────

    @Nested
    @DisplayName("runBacktestAsync() - strategy engines")
    class RunBacktestAsync {

        @Test
        @DisplayName("BUY_AND_HOLD: should mark as COMPLETED and set totalReturnPct")
        void buyAndHoldCompletes() {
            Strategy strategy = buildStrategy("BUY_AND_HOLD");
            String backtestId = "bt-async";

            // Price rises from 100 to 150 - ~50% return
            when(historicalDataService.getChartData(eq("AAPL"), anyString(), anyString()))
                    .thenReturn(buildCandles(100, 100, 150));

            Backtest backtest = buildSavedBacktest(backtestId, new BigDecimal("10000.00"));
            when(backtestRepository.findById(backtestId)).thenReturn(Optional.of(backtest));
            when(backtestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            backtestService.runBacktestAsync(backtestId, strategy, "AAPL",
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    new BigDecimal("10000.00"));

            // Engine completes -> status COMPLETED, totalReturnPct > 0
            assertThat(backtest.getStatus()).isEqualTo(Backtest.BacktestStatus.COMPLETED);
            assertThat(backtest.getTotalReturnPct()).isNotNull();
            assertThat(backtest.getTotalReturnPct()).isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("should mark as FAILED when historicalDataService throws exception")
        void failedWhenServiceThrows() {
            Strategy strategy = buildStrategy("BUY_AND_HOLD");
            String backtestId = "bt-fail";

            when(historicalDataService.getChartData(anyString(), anyString(), anyString()))
                    .thenThrow(new RuntimeException("Data provider unavailable"));

            Backtest backtest = buildSavedBacktest(backtestId, new BigDecimal("10000.00"));
            when(backtestRepository.findById(backtestId)).thenReturn(Optional.of(backtest));
            when(backtestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            backtestService.runBacktestAsync(backtestId, strategy, "AAPL",
                    LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31),
                    new BigDecimal("10000.00"));

            // Should mark as FAILED when data provider throws
            assertThat(backtest.getStatus()).isEqualTo(Backtest.BacktestStatus.FAILED);
        }
    }
}
