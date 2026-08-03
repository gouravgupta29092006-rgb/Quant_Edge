package com.quantedge.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Two-tier cache strategy:
 *   L1: Caffeine (in-memory, microsecond access) — for hot, short-lived data
 *   L2: Redis (distributed) — for shared, longer-lived data (optional — skipped when Redis is unavailable)
 *
 * Cost: ₹0 — Caffeine is a free Java library, Upstash Redis is free tier.
 *
 * When running with the 'local' profile (no Redis), only Caffeine L1 is active.
 * Redis beans are guarded with @ConditionalOnBean(RedisConnectionFactory.class).
 */
@Configuration
public class CacheConfig {

    // ─── Cache name constants ──────────────────────────────────────────
    public static final String CACHE_QUOTES      = "stock-quotes";       // 15s TTL
    public static final String CACHE_COMPANY     = "company-info";       // 24h TTL
    public static final String CACHE_HISTORICAL  = "historical-prices";  // 1h TTL
    public static final String CACHE_NEWS        = "news-feed";          // 5m TTL
    public static final String CACHE_MOVERS      = "market-movers";      // 2m TTL
    public static final String CACHE_AI          = "ai-responses";       // 6h TTL
    public static final String CACHE_PORTFOLIO   = "portfolio-data";     // 30s TTL

    /**
     * L1 Cache — Caffeine (in-process, zero network latency).
     * Always active — used as the primary CacheManager in all profiles.
     */
    @Bean
    @Primary
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(30, TimeUnit.SECONDS)
                .recordStats());
        return manager;
    }

    /**
     * L2 Cache — Redis (Upstash / local Redis).
     * Only created when a RedisConnectionFactory is available in the context
     * (i.e., Redis auto-config is active). Skipped in 'local' profile.
     */
    @Bean
    @ConditionalOnBean(RedisConnectionFactory.class)
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> perCacheConfig = new HashMap<>();
        perCacheConfig.put(CACHE_QUOTES,     defaultConfig.entryTtl(Duration.ofSeconds(15)));
        perCacheConfig.put(CACHE_COMPANY,    defaultConfig.entryTtl(Duration.ofHours(24)));
        perCacheConfig.put(CACHE_HISTORICAL, defaultConfig.entryTtl(Duration.ofHours(1)));
        perCacheConfig.put(CACHE_NEWS,       defaultConfig.entryTtl(Duration.ofMinutes(5)));
        perCacheConfig.put(CACHE_MOVERS,     defaultConfig.entryTtl(Duration.ofMinutes(2)));
        perCacheConfig.put(CACHE_AI,         defaultConfig.entryTtl(Duration.ofHours(6)));
        perCacheConfig.put(CACHE_PORTFOLIO,  defaultConfig.entryTtl(Duration.ofSeconds(30)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig.entryTtl(Duration.ofMinutes(10)))
                .withInitialCacheConfigurations(perCacheConfig)
                .build();
    }

    /**
     * RedisTemplate for manual cache operations.
     * Only created when RedisConnectionFactory is available.
     * Skipped in 'local' profile (no Redis).
     */
    @Bean
    @ConditionalOnBean(RedisConnectionFactory.class)
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        return template;
    }
}
