type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private static instance: Logger | null = null;
  private readonly maxLogSize = 1000;
  private logs: LogEntry[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addEntry(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    // 在开发环境下打印日志
    if (__DEV__) {
      const { timestamp, level, category, message, details, error } = entry;
      console[level](
        `[${new Date(timestamp).toISOString()}] [${category}] ${message}`,
        details,
        error
      );
    }
  }

  debug(category: string, message: string, details?: Record<string, unknown>): void {
    this.addEntry({
      timestamp: Date.now(),
      level: 'debug',
      category,
      message,
      details,
    });
  }

  info(category: string, message: string, details?: Record<string, unknown>): void {
    this.addEntry({
      timestamp: Date.now(),
      level: 'info',
      category,
      message,
      details,
    });
  }

  warn(category: string, message: string, details?: Record<string, unknown>): void {
    this.addEntry({
      timestamp: Date.now(),
      level: 'warn',
      category,
      message,
      details,
    });
  }

  error(category: string, message: string, error?: Error, details?: Record<string, unknown>): void {
    this.addEntry({
      timestamp: Date.now(),
      level: 'error',
      category,
      message,
      details,
      error,
    });
  }

  getLogs(level?: LogLevel, category?: string): LogEntry[] {
    return this.logs.filter(log => 
      (!level || log.level === level) &&
      (!category || log.category === category)
    );
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 