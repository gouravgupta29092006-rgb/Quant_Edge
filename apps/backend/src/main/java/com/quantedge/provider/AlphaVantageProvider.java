package com.quantedge.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Alpha Vantage market data provider.
 * Free tier: 25 requests/day (standard free) or 500/day (with free key).
 * Used primarily for historical OHLCV data.
 * Sign up: https://www.alphavantage.co/support/#api-key
 *
 * Functions used:
 *   TIME_SERIES_DAILY        â€” daily OHLCV (up to 20 years)
 *   TIME_SERIES_INTRADAY     â€” intraday OHLCV (last 2 months)
 *   GLOBAL_QUOTE            â€” real-time quote (fallback for Finnhub)
 *   OVERVIEW                 â€” company fundamentals
 *
 * Cost: â‚¹0 â€” free API key.
 */
@Component
@Slf4j
public class AlphaVantageProvider {

    private final WebClient webClient;

    @Value("${quantedge.market.alpha-vantage-api-key:demo}")
    private String apiKey;

    public AlphaVantageProvider(WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("https://www.alphavantage.co/query")
                .build();
    }

    /**
     * Fetch daily OHLCV time series.
     * outputsize: compact (100 days) | full (20 years)
     */
    public Mono<Map> getDailyTimeSeries(String symbol, boolean fullHistory) {
        String outputsize = fullHistory ? "full" : "compact";
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("function", "TIME_SERIES_DAILY")
                        .queryParam("symbol", symbol)
                        .queryParam("outputsize", outputsize)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .doOnNext(r -> log.debug("AV daily series fetched for: {}", symbol))
                .onErrorResume(e -> {
                    log.warn("AlphaVantage daily error for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Fetch intraday OHLCV time series.
     * interval: 1min, 5min, 15min, 30min, 60min
     */
    public Mono<Map> getIntradayTimeSeries(String symbol, String interval) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("function", "TIME_SERIES_INTRADAY")
                        .queryParam("symbol", symbol)
                        .queryParam("interval", interval)
                        .queryParam("outputsize", "compact")
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.warn("AlphaVantage intraday error for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Global quote â€” used as Finnhub fallback.
     */
    public Mono<Map> getGlobalQuote(String symbol) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("function", "GLOBAL_QUOTE")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.warn("AlphaVantage quote error for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * Company overview â€” fundamentals (P/E, EPS, market cap, etc.)
     */
    public Mono<Map> getCompanyOverview(String symbol) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("function", "OVERVIEW")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> {
                    log.warn("AlphaVantage overview error for {}: {}", symbol, e.getMessage());
                    return Mono.empty();
                });
    }
}
