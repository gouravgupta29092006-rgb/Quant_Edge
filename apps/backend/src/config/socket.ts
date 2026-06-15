import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import logger from '../utils/logger';

export let io: SocketServer;

export function initializeSocket(httpServer: HttpServer): SocketServer {
  const pubClient = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    keyPrefix: 'socket:',
    lazyConnect: true,
  });

  const subClient = pubClient.duplicate();

  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis adapter for multi-instance Socket.io
  io.adapter(createAdapter(pubClient, subClient));

  // ─── Socket Authentication ─────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const { verifyAccessToken } = await import('../utils/jwt');
      const payload = verifyAccessToken(token);
      socket.data = { userId: payload.sub, role: payload.role };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Auto-join personal room
    void socket.join(`user:${userId}`);

    // Join portfolio room
    socket.on('join:portfolio', (portfolioId: string) => {
      void socket.join(`portfolio:${portfolioId}`);
    });

    // Join price room for a stock symbol
    socket.on('join:price', (symbol: string) => {
      void socket.join(`price:${symbol}`);
    });

    // Leave price room
    socket.on('leave:price', (symbol: string) => {
      void socket.leave(`price:${symbol}`);
    });

    // Join backtest room
    socket.on('join:backtest', (backtestId: string) => {
      void socket.join(`backtest:${backtestId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error (${socket.id}):`, err);
    });
  });

  logger.info('Socket.io server initialized with Redis adapter');
  return io;
}

// ─── Emit helpers ─────────────────────────────────────────────
export function emitToUser(userId: string, event: string, data: unknown): void {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitPriceUpdate(
  symbol: string,
  data: { symbol: string; price: number; change: number; changePercent: number }
): void {
  io.to(`price:${symbol}`).emit('price:update', data);
}

export function emitPortfolioUpdate(
  portfolioId: string,
  data: { portfolioId: string; value: number; dailyPnl: number }
): void {
  io.to(`portfolio:${portfolioId}`).emit('portfolio:update', data);
}

export function emitBacktestProgress(
  backtestId: string,
  data: { id: string; step: number; stepName: string; percent: number }
): void {
  io.to(`backtest:${backtestId}`).emit('backtest:progress', data);
}

export function emitBacktestComplete(backtestId: string, results: unknown): void {
  io.to(`backtest:${backtestId}`).emit('backtest:complete', { id: backtestId, results });
}

export function emitNotification(
  userId: string,
  data: { id: string; type: string; title: string; message: string; data?: unknown }
): void {
  io.to(`user:${userId}`).emit('notification:new', data);
}

export function emitAlertTriggered(
  userId: string,
  data: { alertId: string; symbol: string; price: number; condition: string }
): void {
  io.to(`user:${userId}`).emit('alert:triggered', data);
}
