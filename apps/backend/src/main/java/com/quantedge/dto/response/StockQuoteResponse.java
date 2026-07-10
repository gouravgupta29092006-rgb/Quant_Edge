package com.quantedge.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Quote response DTO â€” serialized to frontend.
 * Includes formatted change percent and direction indicator.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StockQuoteResponse {

    private String symbol;
    private String name;
    private String exchange;
    private String sector;
    private String logoUrl;

    // Price data
    private BigDecimal price;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal prevClose;
    private BigDecimal changeAmount;
    private BigDecimal changePercent;

    // Volume & fundamentals
    private Long volume;
    private Long avgVolume;
    private Long marketCap;
    private BigDecimal peRatio;
    private BigDecimal eps;
    private BigDecimal beta;
    private BigDecimal dividendYield;
    private BigDecimal week52High;
    private BigDecimal week52Low;
    private Long sharesOutstanding;

    // Computed helpers for frontend
    private String direction;   // "up" | "down" | "flat"
    private Instant updatedAt;

    public static StockQuoteResponse from(
            com.quantedge.entity.StockQuote q,
            com.quantedge.entity.Stock stock) {

        String direction = "flat";
        if (q.getChangePercent() != null) {
            int cmp = q.getChangePercent().compareTo(BigDecimal.ZERO);
            direction = cmp > 0 ? "up" : cmp < 0 ? "down" : "flat";
        }

        return StockQuoteResponse.builder()
                .symbol(q.getSymbol())
                .name(stock != null ? stock.getName() : q.getSymbol())
                .exchange(stock != null ? stock.getExchange() : null)
                .sector(stock != null ? stock.getSector() : null)
                .logoUrl(stock != null ? stock.getLogoUrl() : null)
                .price(q.getPrice())
                .open(q.getOpen())
                .high(q.getHigh())
                .low(q.getLow())
                .prevClose(q.getPrevClose())
                .changeAmount(q.getChangeAmount())
                .changePercent(q.getChangePercent())
                .volume(q.getVolume())
                .avgVolume(q.getAvgVolume())
                .marketCap(q.getMarketCap())
                .peRatio(q.getPeRatio())
                .eps(q.getEps())
                .beta(q.getBeta())
                .dividendYield(q.getDividendYield())
                .week52High(q.getWeek52High())
                .week52Low(q.getWeek52Low())
                .sharesOutstanding(q.getSharesOutstanding())
                .direction(direction)
                .updatedAt(q.getUpdatedAt())
                .build();
    }
}
