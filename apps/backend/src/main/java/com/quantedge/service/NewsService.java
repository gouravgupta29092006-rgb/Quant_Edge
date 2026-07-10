package com.quantedge.service;

import com.quantedge.config.CacheConfig;
import com.quantedge.provider.FinnhubProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * News service â€” fetches market and company news from Finnhub.
 * Finnhub free tier includes company news and general market news.
 * Per TECH_SPEC.md Â§5 â€” News & Intelligence.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NewsService {

    private final FinnhubProvider finnhubProvider;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Get company-specific news for a symbol (last 7 days).
     * Cache: 5 minutes
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_NEWS, key = "'company:' + #symbol.toUpperCase()")
    public List<Map<String, Object>> getCompanyNews(String symbol) {
        String to   = LocalDate.now().format(DATE_FMT);
        String from = LocalDate.now().minusDays(7).format(DATE_FMT);

        Object[] rawNews = finnhubProvider.getCompanyNews(symbol.toUpperCase(), from, to).block();
        if (rawNews == null) return List.of();

        return Arrays.stream(rawNews)
                .filter(item -> item instanceof Map)
                .map(item -> (Map<Object, Object>) item)
                .filter(item -> item.get("headline") != null)
                .limit(20)
                .map(item -> {
                    Map<String, Object> article = new LinkedHashMap<>();
                    article.put("id",        item.getOrDefault("id", ""));
                    article.put("headline",  item.getOrDefault("headline", ""));
                    article.put("summary",   item.getOrDefault("summary", ""));
                    article.put("source",    item.getOrDefault("source", ""));
                    article.put("url",       item.getOrDefault("url", ""));
                    article.put("imageUrl",  item.getOrDefault("image", ""));
                    article.put("datetime",  item.getOrDefault("datetime", 0));
                    article.put("category",  item.getOrDefault("category", "company"));
                    article.put("symbol",    symbol.toUpperCase());
                    return article;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get general market news (not symbol-specific).
     * Cache: 5 minutes
     */
    @Cacheable(cacheNames = CacheConfig.CACHE_NEWS, key = "'general:market'")
    public List<Map<String, Object>> getMarketNews() {
        String to   = LocalDate.now().format(DATE_FMT);
        String from = LocalDate.now().minusDays(3).format(DATE_FMT);

        // Fetch news for top symbols as a proxy for "market news"
        List<String> topSymbols = List.of("AAPL", "MSFT", "GOOGL", "NVDA", "SPY");
        List<Map<String, Object>> allNews = new ArrayList<>();

        for (String symbol : topSymbols) {
            try {
                Object[] raw = finnhubProvider.getCompanyNews(symbol, from, to).block();
                if (raw != null) {
                    Arrays.stream(raw)
                            .filter(item -> item instanceof Map)
                            .map(item -> (Map<Object, Object>) item)
                            .filter(item -> item.get("headline") != null)
                            .limit(5)
                            .forEach(item -> {
                                Map<String, Object> article = new LinkedHashMap<>();
                                article.put("id",       item.getOrDefault("id", ""));
                                article.put("headline", item.getOrDefault("headline", ""));
                                article.put("summary",  item.getOrDefault("summary", ""));
                                article.put("source",   item.getOrDefault("source", ""));
                                article.put("url",      item.getOrDefault("url", ""));
                                article.put("imageUrl", item.getOrDefault("image", ""));
                                article.put("datetime", item.getOrDefault("datetime", 0));
                                article.put("symbol",   symbol);
                                allNews.add(article);
                            });
                }
            } catch (Exception e) {
                log.warn("News fetch failed for {}: {}", symbol, e.getMessage());
            }
        }

        // Deduplicate by headline and sort by datetime desc
        return allNews.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(
                                m -> String.valueOf(m.get("headline")),
                                m -> m,
                                (a, b) -> a,
                                LinkedHashMap::new
                        ),
                        map -> new ArrayList<>(map.values())
                ))
                .stream()
                .sorted((a, b) -> Long.compare(
                        toLong(b.get("datetime")), toLong(a.get("datetime"))))
                .limit(30)
                .collect(Collectors.toList());
    }

    private long toLong(Object val) {
        if (val instanceof Number n) return n.longValue();
        try { return Long.parseLong(String.valueOf(val)); }
        catch (Exception e) { return 0L; }
    }
}
