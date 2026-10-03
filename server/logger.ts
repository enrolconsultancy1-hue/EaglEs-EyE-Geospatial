import { isProd } from './config.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel = process.env.LOG_LEVEL
  ? (process.env.LOG_LEVEL.toLowerCase() as LogLevel)
  : isProd()
    ? 'info'
    : 'debug';

function formatMessage(
  level: LogLevel,
  moduleName: string,
  message: string,
  meta?: unknown,
): string {
  const timestamp = new Date().toISOString();
  if (isProd()) {
    return JSON.stringify({
      timestamp,
      level,
      module: moduleName,
      message,
      ...(meta !== undefined ? { meta } : {}),
    });
  }

  const levelIcons: Record<LogLevel, string> = {
    debug: '🔍 DEBUG',
    info: 'ℹ️ INFO ',
    warn: '⚠️ WARN ',
    error: '❌ ERROR',
  };

  const metaStr =
    meta !== undefined
      ? `\n  ${typeof meta === 'object' ? JSON.stringify(meta, null, 2) : String(meta)}`
      : '';

  return `[${timestamp}] [${levelIcons[level]}] [${moduleName}]: ${message}${metaStr}`;
}

export class Logger {
  private moduleName: string;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[CURRENT_LEVEL];
  }

  debug(message: string, meta?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(formatMessage('debug', this.moduleName, message, meta));
    }
  }

  info(message: string, meta?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(formatMessage('info', this.moduleName, message, meta));
    }
  }

  warn(message: string, meta?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(formatMessage('warn', this.moduleName, message, meta));
    }
  }

  error(message: string, meta?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(formatMessage('error', this.moduleName, message, meta));
    }
  }
}

export function createLogger(moduleName: string): Logger {
  return new Logger(moduleName);
}

export const defaultLogger = createLogger('EaglEs-EyE');
