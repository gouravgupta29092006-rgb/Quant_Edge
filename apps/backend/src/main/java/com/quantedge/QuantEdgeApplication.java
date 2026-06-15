package com.quantedge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * QuantEdge Application Entry Point
 *
 * AI-powered financial intelligence platform.
 * Educational and analytical only — no real money trading.
 *
 * Stack: Java 21 + Spring Boot 3 + PostgreSQL + Upstash Redis
 * Cost: ₹0 (all free-tier services)
 */
@SpringBootApplication
@EnableCaching          // Caffeine L1 cache + Redis L2 cache
@EnableScheduling       // @Scheduled jobs (replaces BullMQ)
@EnableAsync            // Async processing for AI/market data
@EnableJpaAuditing      // createdAt/updatedAt auto-management
public class QuantEdgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuantEdgeApplication.class, args);
    }
}
