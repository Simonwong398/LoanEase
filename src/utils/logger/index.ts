type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogError {
  name: string;
  message: string;
  stack?: string;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  error(message: string, context: string, error: Error | { message: string }): void {
    const errorMessage = error instanceof Error ? error.message : error.message;
    console.error(`[${context}] ${message}: ${errorMessage}`);
  }
}

export const logger = Logger.getInstance();