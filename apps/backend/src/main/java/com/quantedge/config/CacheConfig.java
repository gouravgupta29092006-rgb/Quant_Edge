package com.quantedge.config;

import com.github.benmanes.caffeine.cache.Caffeine;
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
 *   L1: Caffeine (in-memory, microsecond access) â€” for hot, short-lived data
 *   L2: Upstash Redis (distributed, per-instance) â€” for shared, longer-lived data
 *
 * Cost: â‚¹0 â€” Caffeine is a free Java library, Upstash is free tier.
 */
@Configuration
public class CacheConfig {

    // â”€â”€â”€ Cache name constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public static final String CACHE_QUOTES      = "stock-quotes";       // 15s TTL
    public static final String CACHE_COMPANY     = "company-info";       // 24h TTL
    public static final String CACHE_HISTORICAL  = "historical-prices";  // 1h TTL
    public static final String CACHE_NEWS        = "news-feed";          // 5m TTL
    public static final String CACHE_MOVERS      = "market-movers";      // 2m TTL
    public static final String CACHE_AI          = "ai-responses";       // 6h TTL
    public static final String CACHE_PORTFOLIO   = "portfolio-data";     // 30s TTL

    /**
     * L1 Cache â€” Caffeine (in-process, zero network latency)
     * Used as primary cache for hot market data endpoints.
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
     * L2 Cache â€” Redis (Upstash, distributed)
     * Used for longer-lived data shared across restarts.
     */
    @Bean
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
     * RedisTemplate for manual cache operations (non-@Cacheable patterns).
     */
    @Bean
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
