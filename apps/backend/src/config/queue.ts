import { Queue, Worker, QueueEvents } from 'bullmq';
import { redis } from './redis';
import logger from '../utils/logger';

// BullMQ connection config — use raw ioredis instance (without prefix for queues)
const connection = {
  host: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').port || '6379', 10),
  password:
    new URL(process.env.REDIS_URL ?? 'redis://localhost:6379').password || undefined,
};

// ─── Queue Definitions ────────────────────────────────────────
export const priceAlertsQueue = new Queue('price-alerts', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export const newsIngestionQueue = new Queue('news-ingestion', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  },
});

export const aiJobsQueue = new Queue('ai-jobs', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 2,
    backoff: { type: 'fixed', delay: 30000 },
  },
});

export const backtestsQueue = new Queue('backtests', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 100,
    attempts: 1, // No retries — user initiates manually
    timeout: 5 * 60 * 1000, // 5 minute timeout
  },
});

export const emailJobsQueue = new Queue('email-jobs', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 200,
    removeOnFail: 500,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export const analyticsQueue = new Queue('analytics', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 2,
    backoff: { type: 'fixed', delay: 60000 },
  },
});

export const snapshotQueue = new Queue('portfolio-snapshots', {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
  },
});

// ─── All queues in one place ──────────────────────────────────
const allQueues = [
  priceAlertsQueue,
  newsIngestionQueue,
  aiJobsQueue,
  backtestsQueue,
  emailJobsQueue,
  analyticsQueue,
  snapshotQueue,
];

export function initializeQueues(): void {
  // Log queue initialization
  allQueues.forEach((queue) => {
    logger.info(`Queue initialized: ${queue.name}`);

    // Global failure handler
    queue.on('error', (err) => {
      logger.error(`Queue error [${queue.name}]:`, err);
    });
  });

  logger.info(`${allQueues.length} BullMQ queues initialized`);
}

export function getQueues() {
  return allQueues;
}

export { connection as queueConnection };
