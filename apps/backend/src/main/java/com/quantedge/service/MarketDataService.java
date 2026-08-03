package com.quantedge.service;

import com.quantedge.config.CacheConfig;
import com.quantedge.entity.Stock;
import com.quantedge.entity.StockQuote;
import com.quantedge.exception.AppException;
import com.quantedge.exception.ErrorCode;
import com.quantedge.provider.FinnhubProvider;
import com.quantedge.repository.StockQuoteRepository;
import com.quantedge.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.lang.Nullable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * Market Data Service.
 * Primary data flow:
 *   1. Check Redis cache (15s TTL)
 *   2. On miss â†’ Finnhub free API
 *   3. Update DB + Redis
 *   4. Broadcast via WebSocket
 *
 * All external APIs are free tier. Cost: â‚¹0.
 * Per TECH_SPEC.md Â§4 â€” Market Data API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private final FinnhubProvider finnhubProvider;
    private final StockQuoteRepository stockQuoteRepository;
    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** Optional — null when running without Redis (local profile). */
    @Autowired(required = false)
    @Nullable
    private RedisTemplate<String, Object> redisTemplate;

    private static final String REDIS_QUOTE_KEY = "quote:";
    private static final long QUOTE_CACHE_TTL_SECONDS = 15;

    // â”€â”€â”€ Quotes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Get real-time quote for a symbol.
     * Cache: Redis 15s â†’ Finnhub on miss â†’ DB upsert.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_QUOTES, key = "#symbol.toUpperCase()")
    public StockQuote getQuote(String symbol) {
        String upperSymbol = symbol.toUpperCase();

        // Check DB first (has last known price even if API is down)
        StockQuote cached = stockQuoteRepository.findById(upperSymbol).orElse(null);

        // Try fetching from Finnhub
        Map finnhubData = finnhubProvider.getQuote(upperSymbol).block();

        if (finnhubData != null && finnhubData.get("c") != null) {
            StockQuote quote = mapFinnhubToQuote(upperSymbol, finnhubData);
            stockQuoteRepository.save(quote);
            log.debug("Quote fetched from Finnhub for: {}", upperSymbol);
            return quote;
        }

        // Fallback to cached DB value
        if (cached != null) {
            log.warn("Finnhub unavailable for {}. Returning stale DB quote.", upperSymbol);
            return cached;
        }

        throw new AppException(ErrorCode.MARKET_DATA_UNAVAILABLE,
                "No market data available for: " + upperSymbol);
    }

    /**
     * Get quotes for multiple symbols in one batch.
     */
    public List<StockQuote> getBatchQuotes(List<String> symbols) {
        List<StockQuote> results = new ArrayList<>();
        for (String symbol : symbols) {
            try {
                results.add(getQuote(symbol));
            } catch (AppException e) {
                log.warn("Skipping {} in batch: {}", symbol, e.getMessage());
            }
        }
        return results;
    }

    /**
     * Get company profile (metadata: sector, employees, website, etc.)
     * Cache: Redis 24h â€” company info changes rarely.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_COMPANY, key = "#symbol.toUpperCase()")
    @Transactional
    public Stock getCompanyProfile(String symbol) {
        String upperSymbol = symbol.toUpperCase();

        // Return existing if we have a complete profile
        Stock existing = stockRepository.findById(upperSymbol).orElse(null);
        if (existing != null && existing.getSector() != null) {
            return existing;
        }

        // Fetch from Finnhub
        Map profileData = finnhubProvider.getCompanyProfile(upperSymbol).block();
        if (profileData == null || profileData.isEmpty() || profileData.get("name") == null) {
            if (existing != null) return existing;
            throw new AppException(ErrorCode.STOCK_NOT_FOUND,
                    "Company profile not found for: " + upperSymbol);
        }

        Stock stock = mapFinnhubToStock(upperSymbol, profileData);
        stockRepository.save(stock);
        return stock;
    }

    /**
     * Search stocks by symbol or company name.
     */
    public List<Map<String, Object>> searchStocks(String query, int limit) {
        if (query == null || query.trim().length() < 1) return List.of();

        // Search local DB first (fast, covers seeded stocks)
        var dbResults = stockRepository.searchBySymbolOrName(
                query.trim(),
                org.springframework.data.domain.PageRequest.of(0, limit)
        );

        if (!dbResults.isEmpty()) {
            return dbResults.getContent().stream()
                    .map(s -> Map.<String, Object>of(
                            "symbol", s.getSymbol(),
                            "name", s.getName(),
                            "exchange", s.getExchange(),
                            "sector", Optional.ofNullable(s.getSector()).orElse(""),
                            "type", "Common Stock"
                    ))
                    .toList();
        }

        // Fallback: Finnhub symbol search
        Map finnhubResult = finnhubProvider.searchSymbol(query.trim()).block();
        if (finnhubResult == null) return List.of();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> hits = (List<Map<String, Object>>) finnhubResult.get("result");
        if (hits == null) return List.of();

        return hits.stream()
                .limit(limit)
                .map(hit -> Map.<String, Object>of(
                        "symbol", hit.getOrDefault("symbol", ""),
                        "name",   hit.getOrDefault("description", ""),
                        "exchange", hit.getOrDefault("primaryExchange", ""),
                        "sector", "",
                        "type", hit.getOrDefault("type", "Common Stock")
                ))
                .toList();
    }

    /**
     * Get market movers â€” top gainers and losers.
     * Built from cached quotes of the seeded stock universe.
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_MOVERS)
    public Map<String, List<StockQuote>> getMarketMovers() {
        // Get all seeded stocks
        List<String> seedSymbols = List.of(
                "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META",
                "NFLX", "JPM", "V", "MA", "UNH", "JNJ", "WMT", "DIS"
        );

        List<StockQuote> quotes = getBatchQuotes(seedSymbols).stream()
                .filter(q -> q.getChangePercent() != null)
                .sorted(Comparator.comparing(StockQuote::getChangePercent).reversed())
                .toList();

        int size = quotes.size();
        List<StockQuote> gainers = quotes.stream()
                .filter(q -> q.getChangePercent() != null && q.getChangePercent().compareTo(BigDecimal.ZERO) > 0)
                .limit(5).toList();
        List<StockQuote> losers = new ArrayList<>(quotes.stream()
                .filter(q -> q.getChangePercent() != null && q.getChangePercent().compareTo(BigDecimal.ZERO) < 0)
                .toList());
        Collections.reverse(losers);
        losers = losers.stream().limit(5).toList();

        return Map.of("gainers", gainers, "losers", losers);
    }

    /**
     * Broadcast price update via WebSocket.
     * Called by ScheduledJobs price refresh.
     */
    @CacheEvict(cacheNames = CacheConfig.CACHE_QUOTES, key = "#symbol")
    public void broadcastPriceUpdate(String symbol) {
        try {
            StockQuote quote = getQuote(symbol);
            messagingTemplate.convertAndSend("/topic/price/" + symbol, quote);
        } catch (Exception e) {
            log.warn("Failed to broadcast price for {}: {}", symbol, e.getMessage());
        }
    }

    // â”€â”€â”€ Private Mappers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @SuppressWarnings("unchecked")
    private StockQuote mapFinnhubToQuote(String symbol, Map data) {
        return StockQuote.builder()
                .symbol(symbol)
                .price(toBigDecimal(data.get("c")))         // current price
                .open(toBigDecimal(data.get("o")))           // open
                .high(toBigDecimal(data.get("h")))           // high
                .low(toBigDecimal(data.get("l")))            // low
                .prevClose(toBigDecimal(data.get("pc")))     // previous close
                .changeAmount(toBigDecimal(data.get("d")))   // change
                .changePercent(toBigDecimal(data.get("dp"))) // change %
                .updatedAt(Instant.now())
                .build();
    }

    @SuppressWarnings("unchecked")
    private Stock mapFinnhubToStock(String symbol, Map data) {
        return Stock.builder()
                .symbol(symbol)
                .name(String.valueOf(data.getOrDefault("name", symbol)))
                .exchange(String.valueOf(data.getOrDefault("exchange", "UNKNOWN")))
                .sector(String.valueOf(data.getOrDefault("finnhubIndustry", "")))
                .industry(String.valueOf(data.getOrDefault("finnhubIndustry", "")))
                .logoUrl(String.valueOf(data.getOrDefault("logo", "")))
                .website(String.valueOf(data.getOrDefault("weburl", "")))
                .country(String.valueOf(data.getOrDefault("country", "US")))
                .currency(String.valueOf(data.getOrDefault("currency", "USD")))
                .employees(data.get("employeeTotal") instanceof Number n ? n.intValue() : null)
                .isActive(true)
                .build();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return null;
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
