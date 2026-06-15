import http from 'http';
import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import app from './app';
import { initializeSocket } from './config/socket';
import { initializeQueues } from './config/queue';
import { startScheduler } from './jobs/scheduler';
import { redis } from './config/redis';
import { prisma } from './config/database';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '8080', 10);

async function startServer(): Promise<void> {
  try {
    // ─── Verify Database Connection ────────────────────────────
    await prisma.$connect();
    logger.info('✅ Database connected');

    // ─── Verify Redis Connection ───────────────────────────────
    await redis.ping();
    logger.info('✅ Redis connected');

    // ─── Create HTTP Server ────────────────────────────────────
    const server = http.createServer(app);

    // ─── Initialize WebSocket ─────────────────────────────────
    initializeSocket(server);
    logger.info('✅ WebSocket server initialized');

    // ─── Initialize BullMQ Queues ─────────────────────────────
    initializeQueues();
    logger.info('✅ Job queues initialized');

    // ─── Start Cron Scheduler ─────────────────────────────────
    startScheduler();
    logger.info('✅ Cron scheduler started');

    // ─── Start Listening ──────────────────────────────────────
    server.listen(PORT, () => {
      logger.info(`🚀 QuantEdge API running on port ${PORT}`);
      logger.info(`📡 Environment: ${process.env.NODE_ENV ?? 'development'}`);
      logger.info(`🔗 Health: http://localhost:${PORT}/health`);
      logger.info(`🔗 API:    http://localhost:${PORT}/api/${process.env.API_VERSION ?? 'v1'}`);
    });

    // ─── Graceful Shutdown ────────────────────────────────────
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — beginning graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('Database disconnected');

          await redis.quit();
          logger.info('Redis disconnected');

          logger.info('✅ Graceful shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown:', err);
          process.exit(1);
        }
      });

      // Force shutdown after 30s
      setTimeout(() => {
        logger.error('Forced shutdown after 30s timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

    // ─── Unhandled Rejections ─────────────────────────────────
    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Unhandled promise rejection:', reason);
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

void startServer();
