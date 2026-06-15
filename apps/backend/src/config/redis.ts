import { Redis } from 'ioredis';
import logger from '../utils/logger';

const REDIS_PREFIX = process.env.REDIS_PREFIX ?? 'qe:';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis reconnect attempt ${times} in ${delay}ms`);
    return delay;
  },
  lazyConnect: true,
  enableReadyCheck: true,
  keyPrefix: REDIS_PREFIX,
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  commandTimeout: 5000,
});

redis.on('connect', () => logger.info('Redis: connected'));
redis.on('ready', () => logger.info('Redis: ready'));
redis.on('error', (err: Error) => logger.error('Redis error:', err));
redis.on('close', () => logger.warn('Redis: connection closed'));
redis.on('reconnecting', () => logger.warn('Redis: reconnecting...'));

// ─────────────────────────────────────────────────────────────
// Cache-Aside Pattern: Get from cache, or fetch and populate
// ─────────────────────────────────────────────────────────────
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    logger.warn('Cache read failed, proceeding with fetch', { key, err });
  }

  const data = await fetchFn();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn('Cache write failed', { key, err });
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
// Stale-While-Revalidate: Return stale data while refreshing
// ─────────────────────────────────────────────────────────────
export async function getStaleOrFetch<T>(
  key: string,
  ttlSeconds: number,
  staleTtlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const staleKey = `stale:${key}`;

  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      // Refresh in background asynchronously
      void refreshInBackground(key, staleKey, ttlSeconds, staleTtlSeconds, fetchFn);
      return JSON.parse(cached) as T;
    }

    // Check stale cache
    const stale = await redis.get(staleKey);
    if (stale !== null) {
      void refreshInBackground(key, staleKey, ttlSeconds, staleTtlSeconds, fetchFn);
      return JSON.parse(stale) as T;
    }
  } catch (err) {
    logger.warn('Cache read failed in SWR', { key, err });
  }

  return await fetchFreshAndCache(key, staleKey, ttlSeconds, staleTtlSeconds, fetchFn);
}

async function refreshInBackground<T>(
  key: string,
  staleKey: string,
  ttlSeconds: number,
  staleTtlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<void> {
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'EX', 30, 'NX');
  if (!acquired) return;

  try {
    await fetchFreshAndCache(key, staleKey, ttlSeconds, staleTtlSeconds, fetchFn);
  } finally {
    await redis.del(lockKey);
  }
}

async function fetchFreshAndCache<T>(
  key: string,
  staleKey: string,
  ttlSeconds: number,
  staleTtlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const data = await fetchFn();
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    await redis.setex(staleKey, staleTtlSeconds, JSON.stringify(data));
  } catch (err) {
    logger.warn('Cache write failed', { key, err });
  }
  return data;
}

// ─────────────────────────────────────────────────────────────
// Cache invalidation helpers
// ─────────────────────────────────────────────────────────────
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn('Cache invalidation failed', { pattern, err });
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn('Cache set failed', { key, err });
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached !== null ? (JSON.parse(cached) as T) : null;
  } catch (err) {
    logger.warn('Cache get failed', { key, err });
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn('Cache delete failed', { key, err });
  }
}

export default redis;
