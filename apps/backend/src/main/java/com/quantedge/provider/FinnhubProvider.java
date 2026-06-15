package com.quantedge.provider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Finnhub market data provider.
 * Free tier: 60 requests/minute — sufficient for portfolio project.
 * Provides: real-time quotes, company info, news, earnings
 *
 * Docs: https://finnhub.io/docs/api
 */
@Component
@Slf4j
public class FinnhubProvider {

    private final WebClient webClient;

    @Value("${quantedge.market.finnhub-api-key:}")
    private String apiKey;

    private final AtomicInteger requestCount = new AtomicInteger(0);

    public FinnhubProvider(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://finnhub.io/api/v1")
                .build();
    }

    /**
     * GET /quote?symbol={symbol}
     * Real-time quote for a stock.
     */
    public Mono<Map> getQuote(String symbol) {
        return webClient.get()
                .uri("/quote?symbol={symbol}&token={token}", symbol, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnNext(r -> log.debug("Finnhub quote fetched for: {}", symbol))
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.warn("Finnhub quote error for {}: {} {}", symbol, e.getStatusCode(), e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * GET /stock/profile2?symbol={symbol}
     * Company profile (sector, industry, employees, etc.)
     */
    public Mono<Map> getCompanyProfile(String symbol) {
        return webClient.get()
                .uri("/stock/profile2?symbol={symbol}&token={token}", symbol, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.warn("Finnhub profile error for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * GET /company-news?symbol={symbol}&from={from}&to={to}
     * Company news articles.
     */
    public Mono<Object[]> getCompanyNews(String symbol, String from, String to) {
        return webClient.get()
                .uri("/company-news?symbol={symbol}&from={from}&to={to}&token={token}",
                        symbol, from, to, apiKey)
                .retrieve()
                .bodyToMono(Object[].class)
                .onErrorResume(e -> {
                    log.warn("Finnhub news error for {}: {}", symbol, e.getMessage());
                    return Mono.just(new Object[0]);
                });
    }

    /**
     * GET /search?q={query}
     * Symbol search for autocomplete.
     */
    public Mono<Map> searchSymbol(String query) {
        return webClient.get()
                .uri("/search?q={q}&token={token}", query, apiKey)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.warn("Finnhub search error: {}", e.getMessage());
                    return Mono.empty();
                });
    }
}
