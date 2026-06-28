package com.quantedge.service;

import com.quantedge.config.CacheConfig;
import com.quantedge.provider.AlphaVantageProvider;
import com.quantedge.provider.FinnhubProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Historical price data service.
 * Sources: Alpha Vantage (primary) → Finnhub (fallback)
 *
 * Supported intervals:
 *   1D, 1W, 1M → daily OHLCV from AlphaVantage TIME_SERIES_DAILY
 *   1d (intraday 1min), 5d (5min), 1mo (15min) → TIME_SERIES_INTRADAY
 *
 * Per TECH_SPEC.md §4 — Historical Data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HistoricalDataService {

    private final AlphaVantageProvider alphaVantageProvider;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get OHLCV chart data for a given symbol and range.
     *
     * @param symbol   Stock ticker (e.g., "AAPL")
     * @param range    Time range: 1D, 5D, 1M, 3M, 6M, 1Y, 2Y, 5Y, MAX
     * @param interval Bar interval: 1min, 5min, 15min, 1day
     * @return List of OHLCV candles sorted ascending by date
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_HISTORICAL,
               key = "#symbol.toUpperCase() + ':' + #range + ':' + #interval")
    public List<Map<String, Object>> getChartData(String symbol, String range, String interval) {
        String upperSymbol = symbol.toUpperCase();

        // Intraday ranges use TIME_SERIES_INTRADAY
        if (Set.of("1D", "5D").contains(range.toUpperCase())) {
            String avInterval = "1D".equalsIgnoreCase(range) ? "5min" : "15min";
            return fetchIntraday(upperSymbol, avInterval, range);
        }

        // Daily ranges use TIME_SERIES_DAILY
        boolean fullHistory = Set.of("2Y", "5Y", "MAX").contains(range.toUpperCase());
        return fetchDaily(upperSymbol, range, fullHistory);
    }

    // ─── Private Fetchers ─────────────────────────────────────

    private List<Map<String, Object>> fetchDaily(String symbol, String range, boolean full) {
        Map avData = alphaVantageProvider.getDailyTimeSeries(symbol, full).block();

        if (avData == null || avData.containsKey("Note") || avData.containsKey("Information")) {
            log.warn("AlphaVantage rate limit hit for {}. Returning empty.", symbol);
            return List.of();
        }

        @SuppressWarnings("unchecked")
        Map<String, Map<String, String>> timeSeries =
                (Map<String, Map<String, String>>) avData.get("Time Series (Daily)");
        if (timeSeries == null) return List.of();

        LocalDate cutoff = getCutoffDate(range);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, String>> entry : timeSeries.entrySet()) {
            LocalDate date = LocalDate.parse(entry.getKey(), DATE_FMT);
            if (date.isBefore(cutoff)) continue;

            Map<String, String> bar = entry.getValue();
            result.add(Map.of(
                    "date",   entry.getKey(),
                    "open",   parseBD(bar.get("1. open")),
                    "high",   parseBD(bar.get("2. high")),
                    "low",    parseBD(bar.get("3. low")),
                    "close",  parseBD(bar.get("4. close")),
                    "volume", parseLong(bar.get("5. volume"))
            ));
        }

        result.sort(Comparator.comparing(m -> (String) m.get("date")));
        return result;
    }

    private List<Map<String, Object>> fetchIntraday(String symbol, String avInterval, String range) {
        Map avData = alphaVantageProvider.getIntradayTimeSeries(symbol, avInterval).block();
        if (avData == null) return List.of();

        String seriesKey = "Time Series (" + avInterval + ")";
        @SuppressWarnings("unchecked")
        Map<String, Map<String, String>> timeSeries =
                (Map<String, Map<String, String>>) avData.get(seriesKey);
        if (timeSeries == null) return List.of();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : timeSeries.entrySet()) {
            Map<String, String> bar = entry.getValue();
            result.add(Map.of(
                    "date",   entry.getKey(),
                    "open",   parseBD(bar.get("1. open")),
                    "high",   parseBD(bar.get("2. high")),
                    "low",    parseBD(bar.get("3. low")),
                    "close",  parseBD(bar.get("4. close")),
                    "volume", parseLong(bar.get("5. volume"))
            ));
        }

        result.sort(Comparator.comparing(m -> (String) m.get("date")));
        return result;
    }

    private LocalDate getCutoffDate(String range) {
        return switch (range.toUpperCase()) {
            case "1D"  -> LocalDate.now().minusDays(1);
            case "5D"  -> LocalDate.now().minusDays(5);
            case "1M"  -> LocalDate.now().minusMonths(1);
            case "3M"  -> LocalDate.now().minusMonths(3);
            case "6M"  -> LocalDate.now().minusMonths(6);
            case "1Y"  -> LocalDate.now().minusYears(1);
            case "2Y"  -> LocalDate.now().minusYears(2);
            case "5Y"  -> LocalDate.now().minusYears(5);
            default    -> LocalDate.of(2000, 1, 1);  // MAX
        };
    }

    private BigDecimal parseBD(String value) {
        try { return new BigDecimal(value); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }

    private long parseLong(String value) {
        try { return Long.parseLong(value); }
        catch (Exception e) { return 0L; }
    }
}
