package com.quantedge.service;

import com.quantedge.entity.*;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.repository.BacktestRepository;
import com.quantedge.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * Backtesting engine — simulates a strategy on historical data.
 * Per TECH_SPEC.md §10 — Backtesting Engine.
 *
 * Supported strategies (via config map):
 *   type: SMA_CROSSOVER    → SMA fast/slow crossover
 *   type: RSI              → RSI overbought/oversold
 *   type: BUY_AND_HOLD     → Simple benchmark
 *
 * Run is async to avoid blocking the HTTP thread on large date ranges.
 * Status polling via GET /backtests/{id}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BacktestService {

    private final StrategyRepository strategyRepository;
    private final BacktestRepository backtestRepository;
    private final HistoricalDataService historicalDataService;

    /**
     * Initiate a backtest run asynchronously.
     * Returns the Backtest entity in RUNNING status immediately.
     */
    @Transactional
    public Backtest initiateBacktest(String strategyId, String userId,
                                     String symbol, LocalDate fromDate, LocalDate toDate,
                                     BigDecimal initialCapital) {
        Strategy strategy = strategyRepository.findByIdAndUserId(strategyId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.STRATEGY_NOT_FOUND));

        Backtest backtest = Backtest.builder()
                .strategy(strategy)
                .symbol(symbol.toUpperCase())
                .startDate(fromDate)
                .endDate(toDate)
                .initialCapital(initialCapital)
                .status(Backtest.BacktestStatus.RUNNING)
                .startedAt(java.time.Instant.now())
                .build();
        backtest = backtestRepository.save(backtest);

        // Run async
        runBacktestAsync(backtest.getId(), strategy, symbol, fromDate, toDate, initialCapital);
        return backtest;
    }

    /**
     * Async backtest runner — executed in a Virtual Thread pool.
     */
    @Async
    public void runBacktestAsync(String backtestId, Strategy strategy, String symbol,
                                  LocalDate fromDate, LocalDate toDate, BigDecimal initialCapital) {
        try {
            Map<String, Object> results = runStrategy(strategy.getConfig(), symbol, fromDate, toDate, initialCapital);
            updateBacktestResults(backtestId, results);
        } catch (Exception e) {
            log.error("Backtest {} failed: {}", backtestId, e.getMessage());
            backtestRepository.findById(backtestId).ifPresent(bt -> {
                bt.setStatus(Backtest.BacktestStatus.FAILED);
                backtestRepository.save(bt);
            });
        }
    }

    // ─── Strategy Engines ─────────────────────────────────────

    private Map<String, Object> runStrategy(Map<String, Object> config, String symbol,
                                             LocalDate from, LocalDate to, BigDecimal initialCapital) {
        String type = String.valueOf(config.getOrDefault("type", "BUY_AND_HOLD"));

        // Fetch OHLCV data
        String range = computeRange(from, to);
        List<Map<String, Object>> candles = historicalDataService.getChartData(symbol, range, "1day");

        // Filter to date range
        candles = candles.stream()
                .filter(c -> {
                    String date = (String) c.get("date");
                    return date != null && !date.compareTo(from.toString()) < 0
                            && !date.compareTo(to.toString()) > 0;
                })
                .toList();

        return switch (type) {
            case "SMA_CROSSOVER" -> runSmaCrossover(candles, config, initialCapital);
            case "RSI"           -> runRsi(candles, config, initialCapital);
            default              -> runBuyAndHold(candles, initialCapital);
        };
    }

    private Map<String, Object> runBuyAndHold(List<Map<String, Object>> candles, BigDecimal initialCapital) {
        if (candles.isEmpty()) return emptyResults(initialCapital);

        BigDecimal entryPrice = (BigDecimal) candles.get(0).get("close");
        BigDecimal exitPrice  = (BigDecimal) candles.get(candles.size() - 1).get("close");

        if (entryPrice.compareTo(BigDecimal.ZERO) == 0) return emptyResults(initialCapital);

        BigDecimal shares = initialCapital.divide(entryPrice, 4, RoundingMode.HALF_UP);
        BigDecimal finalValue = shares.multiply(exitPrice);
        BigDecimal totalReturn = finalValue.subtract(initialCapital)
                .divide(initialCapital, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

        return buildResults(initialCapital, finalValue, totalReturn, 1, 1, candles, List.of(
                Map.of("action", "BUY",  "date", candles.get(0).get("date"), "price", entryPrice),
                Map.of("action", "SELL", "date", candles.get(candles.size()-1).get("date"), "price", exitPrice)
        ));
    }

    private Map<String, Object> runSmaCrossover(List<Map<String, Object>> candles,
                                                 Map<String, Object> config, BigDecimal initialCapital) {
        int fastPeriod = toInt(config.getOrDefault("fastPeriod", 10));
        int slowPeriod = toInt(config.getOrDefault("slowPeriod", 50));

        List<BigDecimal> closes = candles.stream()
                .map(c -> (BigDecimal) c.get("close")).toList();
        List<BigDecimal> fastSma = computeSma(closes, fastPeriod);
        List<BigDecimal> slowSma = computeSma(closes, slowPeriod);

        BigDecimal cash = initialCapital;
        BigDecimal shares = BigDecimal.ZERO;
        List<Map<String, Object>> trades = new ArrayList<>();
        int wins = 0, losses = 0;
        BigDecimal lastBuyPrice = BigDecimal.ZERO;

        for (int i = 1; i < candles.size(); i++) {
            BigDecimal fast = fastSma.get(i), slowMa = slowSma.get(i);
            BigDecimal prevFast = fastSma.get(i - 1), prevSlow = slowSma.get(i - 1);
            if (fast == null || slowMa == null || prevFast == null || prevSlow == null) continue;

            BigDecimal price = (BigDecimal) candles.get(i).get("close");

            // Golden cross → BUY
            if (prevFast.compareTo(prevSlow) <= 0 && fast.compareTo(slowMa) > 0 && cash.compareTo(BigDecimal.ZERO) > 0) {
                shares = cash.divide(price, 4, RoundingMode.HALF_UP);
                lastBuyPrice = price;
                cash = BigDecimal.ZERO;
                trades.add(Map.of("action", "BUY", "date", candles.get(i).get("date"), "price", price));
            }
            // Death cross → SELL
            else if (prevFast.compareTo(prevSlow) >= 0 && fast.compareTo(slowMa) < 0 && shares.compareTo(BigDecimal.ZERO) > 0) {
                cash = shares.multiply(price);
                shares = BigDecimal.ZERO;
                if (price.compareTo(lastBuyPrice) > 0) wins++; else losses++;
                trades.add(Map.of("action", "SELL", "date", candles.get(i).get("date"), "price", price));
            }
        }

        BigDecimal finalValue = cash.add(shares.compareTo(BigDecimal.ZERO) > 0
                ? shares.multiply((BigDecimal) candles.get(candles.size()-1).get("close"))
                : BigDecimal.ZERO);
        BigDecimal totalReturn = finalValue.subtract(initialCapital)
                .divide(initialCapital, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));

        return buildResults(initialCapital, finalValue, totalReturn, wins, losses, candles, trades);
    }

    private Map<String, Object> runRsi(List<Map<String, Object>> candles,
                                        Map<String, Object> config, BigDecimal initialCapital) {
        int period      = toInt(config.getOrDefault("period", 14));
        int oversold    = toInt(config.getOrDefault("oversold", 30));
        int overbought  = toInt(config.getOrDefault("overbought", 70));

        List<BigDecimal> closes = candles.stream().map(c -> (BigDecimal) c.get("close")).toList();
        List<BigDecimal> rsi    = computeRsi(closes, period);

        BigDecimal cash = initialCapital, shares = BigDecimal.ZERO;
        List<Map<String, Object>> trades = new ArrayList<>();
        int wins = 0, losses = 0;
        BigDecimal lastBuyPrice = BigDecimal.ZERO;

        for (int i = 1; i < candles.size(); i++) {
            if (rsi.get(i) == null) continue;
            BigDecimal rsiVal = rsi.get(i), price = (BigDecimal) candles.get(i).get("close");

            if (rsiVal.compareTo(new BigDecimal(oversold)) < 0 && cash.compareTo(BigDecimal.ZERO) > 0) {
                shares = cash.divide(price, 4, RoundingMode.HALF_UP);
                lastBuyPrice = price; cash = BigDecimal.ZERO;
                trades.add(Map.of("action", "BUY", "date", candles.get(i).get("date"), "price", price, "rsi", rsiVal));
            } else if (rsiVal.compareTo(new BigDecimal(overbought)) > 0 && shares.compareTo(BigDecimal.ZERO) > 0) {
                cash = shares.multiply(price); shares = BigDecimal.ZERO;
                if (price.compareTo(lastBuyPrice) > 0) wins++; else losses++;
                trades.add(Map.of("action", "SELL", "date", candles.get(i).get("date"), "price", price, "rsi", rsiVal));
            }
        }

        BigDecimal lastClose = (BigDecimal) candles.get(candles.size()-1).get("close");
        BigDecimal finalValue = cash.add(shares.multiply(lastClose));
        BigDecimal totalReturn = finalValue.subtract(initialCapital)
                .divide(initialCapital, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        return buildResults(initialCapital, finalValue, totalReturn, wins, losses, candles, trades);
    }

    // ─── Indicator Computations ───────────────────────────────

    private List<BigDecimal> computeSma(List<BigDecimal> prices, int period) {
        List<BigDecimal> sma = new ArrayList<>(Collections.nCopies(prices.size(), null));
        for (int i = period - 1; i < prices.size(); i++) {
            BigDecimal sum = BigDecimal.ZERO;
            for (int j = i - period + 1; j <= i; j++) sum = sum.add(prices.get(j));
            sma.set(i, sum.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP));
        }
        return sma;
    }

    private List<BigDecimal> computeRsi(List<BigDecimal> prices, int period) {
        List<BigDecimal> rsi = new ArrayList<>(Collections.nCopies(prices.size(), null));
        if (prices.size() < period + 1) return rsi;

        BigDecimal avgGain = BigDecimal.ZERO, avgLoss = BigDecimal.ZERO;
        for (int i = 1; i <= period; i++) {
            BigDecimal change = prices.get(i).subtract(prices.get(i - 1));
            if (change.compareTo(BigDecimal.ZERO) > 0) avgGain = avgGain.add(change);
            else avgLoss = avgLoss.add(change.abs());
        }
        avgGain = avgGain.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);
        avgLoss = avgLoss.divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);

        for (int i = period; i < prices.size(); i++) {
            if (i > period) {
                BigDecimal change = prices.get(i).subtract(prices.get(i - 1));
                BigDecimal gain   = change.compareTo(BigDecimal.ZERO) > 0 ? change : BigDecimal.ZERO;
                BigDecimal loss   = change.compareTo(BigDecimal.ZERO) < 0 ? change.abs() : BigDecimal.ZERO;
                avgGain = avgGain.multiply(new BigDecimal(period - 1)).add(gain)
                        .divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);
                avgLoss = avgLoss.multiply(new BigDecimal(period - 1)).add(loss)
                        .divide(new BigDecimal(period), 4, RoundingMode.HALF_UP);
            }
            if (avgLoss.compareTo(BigDecimal.ZERO) == 0) { rsi.set(i, new BigDecimal("100")); continue; }
            BigDecimal rs = avgGain.divide(avgLoss, 4, RoundingMode.HALF_UP);
            rsi.set(i, new BigDecimal("100").subtract(
                    new BigDecimal("100").divide(BigDecimal.ONE.add(rs), 4, RoundingMode.HALF_UP)));
        }
        return rsi;
    }

    // ─── Helpers ──────────────────────────────────────────────

    private Map<String, Object> buildResults(BigDecimal initial, BigDecimal finalValue, BigDecimal totalReturn,
                                              int wins, int losses, List<Map<String, Object>> candles,
                                              List<Map<String, Object>> trades) {
        int totalTrades = wins + losses;
        BigDecimal winRate = totalTrades > 0
                ? new BigDecimal(wins).divide(new BigDecimal(totalTrades), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        return Map.of(
                "initialCapital", initial,
                "finalValue",     finalValue,
                "totalReturnPct", totalReturn,
                "totalTrades",    totalTrades,
                "winRate",        winRate,
                "wins",           wins,
                "losses",         losses,
                "trades",         trades,
                "dataPoints",     candles.size()
        );
    }

    private Map<String, Object> emptyResults(BigDecimal initialCapital) {
        return Map.of("initialCapital", initialCapital, "finalValue", initialCapital,
                "totalReturnPct", BigDecimal.ZERO, "totalTrades", 0, "winRate", BigDecimal.ZERO);
    }

    @Transactional
    private void updateBacktestResults(String backtestId, Map<String, Object> results) {
        backtestRepository.findById(backtestId).ifPresent(bt -> {
            bt.setTradeLog(results.get("trades"));
            bt.setStatus(Backtest.BacktestStatus.COMPLETED);
            bt.setCompletedAt(java.time.Instant.now());
            if (results.get("finalValue") instanceof BigDecimal fv) {
                // store final vs initial as equity curve (2 points)
                bt.setEquityCurve(List.of(
                        Map.of("date", "start", "value", bt.getInitialCapital()),
                        Map.of("date", "end",   "value", fv)
                ));
            }
            if (results.get("totalReturnPct") instanceof BigDecimal tr) bt.setTotalReturnPct(tr);
            if (results.get("totalTrades")    instanceof Integer tt)    bt.setTotalTrades(tt);
            if (results.get("winRate")        instanceof BigDecimal wr)  bt.setWinRate(wr);
            backtestRepository.save(bt);
            log.info("Backtest {} completed. Return: {}%", backtestId, results.get("totalReturnPct"));
        });
    }

    private int toInt(Object val) {
        if (val instanceof Integer i) return i;
        try { return Integer.parseInt(String.valueOf(val)); }
        catch (Exception e) { return 0; }
    }

    private String computeRange(LocalDate from, LocalDate to) {
        long days = from.until(to).getDays() + from.until(to).getMonths() * 30L + from.until(to).getYears() * 365L;
        if (days <= 30)   return "1M";
        if (days <= 90)   return "3M";
        if (days <= 180)  return "6M";
        if (days <= 365)  return "1Y";
        if (days <= 730)  return "2Y";
        return "5Y";
    }
}
