import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, errors, json, colorize, printf, splat } = format;

const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
const LOG_DIR = process.env.LOG_DIR ?? './logs';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

// Development console format
const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length > 0 ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
  const stackStr = stack ? `\n${stack as string}` : '';
  return `${ts as string} [${level}] ${message as string}${metaStr}${stackStr}`;
});

// Production JSON format
const prodFormat = combine(
  timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  errors({ stack: true }),
  splat(),
  json()
);

const logger = createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: 'quantedge-api',
    environment: NODE_ENV,
  },
  format: NODE_ENV === 'production' ? prodFormat : combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    errors({ stack: true }),
    devFormat
  ),
  transports: [
    // Console transport
    new transports.Console({
      silent: NODE_ENV === 'test',
    }),
  ],
  exitOnError: false,
});

// Add file transports in production/staging
if (NODE_ENV !== 'development' && NODE_ENV !== 'test') {
  // All logs (rotating daily)
  logger.add(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'quantedge-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: LOG_LEVEL,
      format: prodFormat,
    })
  );

  // Error logs only
  logger.add(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'errors-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '60d',
      level: 'error',
      format: prodFormat,
    })
  );
}

// Add HTTP level
logger.levels = {
  ...logger.levels,
  http: 5,
};

export default logger;
