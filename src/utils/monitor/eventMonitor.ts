import { logger } from '../logger';

interface EventMetric {
  name: string;
  timestamp: number;
  duration?: number;
  category: string;
  status: 'success' | 'error' | 'warning';
  metadata?: Record<string, unknown>;
}

interface EventPattern {
  name: string;
  timeWindow: number;
  threshold: number;
  action: (events: EventMetric[]) => void;
}

class EventMonitor {
  private static instance: EventMonitor | null = null;
  private events: EventMetric[] = [];
  private patterns: EventPattern[] = [];
  private readonly maxEvents = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startCleanup();
  }

  static getInstance(): EventMonitor {
    if (!EventMonitor.instance) {
      EventMonitor.instance = new EventMonitor();
    }
    return EventMonitor.instance;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.events = this.events.filter(event => 
        now - event.timestamp < 24 * 60 * 60 * 1000 // 保留24小时内的事件
      );
    }, 60 * 60 * 1000); // 每小时清理一次
  }

  recordEvent(
    name: string,
    category: string,
    status: EventMetric['status'] = 'success',
    metadata?: Record<string, unknown>
  ): void {
    const event: EventMetric = {
      name,
      timestamp: Date.now(),
      category,
      status,
      metadata
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    this.checkPatterns(event);
    
    if (status === 'error') {
      const error = new Error(`Event error: ${name}`);
      if (metadata) {
        Object.assign(error, { metadata });
      }
      logger.error('EventMonitor', error.message, error);
    }
  }

  startEvent(
    name: string,
    category: string,
    metadata?: Record<string, unknown>
  ): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordEvent(name, category, 'success', { ...metadata, duration });
    };
  }

  registerPattern(pattern: EventPattern): void {
    this.patterns.push(pattern);
  }

  private checkPatterns(newEvent: EventMetric): void {
    const now = Date.now();

    this.patterns.forEach(pattern => {
      if (pattern.name === newEvent.name) {
        const relevantEvents = this.events.filter(event => 
          event.name === pattern.name &&
          now - event.timestamp <= pattern.timeWindow
        );

        if (relevantEvents.length >= pattern.threshold) {
          pattern.action(relevantEvents);
        }
      }
    });
  }

  getEvents(
    filter?: {
      name?: string;
      category?: string;
      status?: EventMetric['status'];
      timeRange?: [number, number];
    }
  ): EventMetric[] {
    let filtered = this.events;

    if (filter) {
      const { name, category, status, timeRange } = filter;

      if (name) {
        filtered = filtered.filter(event => event.name === name);
      }
      if (category) {
        filtered = filtered.filter(event => event.category === category);
      }
      if (status) {
        filtered = filtered.filter(event => event.status === status);
      }
      if (timeRange) {
        const [start, end] = timeRange;
        filtered = filtered.filter(event => 
          event.timestamp >= start && event.timestamp <= end
        );
      }
    }

    return [...filtered];
  }

  getEventStats(
    name: string,
    timeWindow: number = 60 * 60 * 1000 // 默认1小时
  ): {
    total: number;
    success: number;
    error: number;
    warning: number;
    avgDuration?: number;
  } {
    const now = Date.now();
    const relevantEvents = this.events.filter(event =>
      event.name === name &&
      now - event.timestamp <= timeWindow
    );

    const stats = {
      total: relevantEvents.length,
      success: 0,
      error: 0,
      warning: 0,
      avgDuration: undefined as number | undefined,
    };

    let totalDuration = 0;
    let eventsWithDuration = 0;

    relevantEvents.forEach(event => {
      stats[event.status]++;
      if (event.duration !== undefined) {
        totalDuration += event.duration;
        eventsWithDuration++;
      }
    });

    if (eventsWithDuration > 0) {
      stats.avgDuration = totalDuration / eventsWithDuration;
    }

    return stats;
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.events = [];
    this.patterns = [];
  }
}

export const eventMonitor = EventMonitor.getInstance();
export type { EventMetric, EventPattern }; 