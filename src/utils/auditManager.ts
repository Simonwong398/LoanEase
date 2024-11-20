import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionManager } from './encryptionManager';

interface AuditEvent {
  id: string;
  timestamp: number;
  type: string;
  userId?: string;
  action: string;
  details: any;
  status: 'success' | 'failure';
  errorMessage?: string;
}

interface AuditConfig {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class AuditManager {
  private static instance: AuditManager;
  private events: AuditEvent[] = [];
  private config: AuditConfig = {
    enabled: true,
    retentionDays: 90,
    logLevel: 'info',
  };

  private constructor() {}

  static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
    }
    return AuditManager.instance;
  }

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enabled) return;

    const auditEvent: AuditEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    this.events.push(auditEvent);
    await this.persistEvent(auditEvent);
    await this.cleanupOldEvents();
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      // 加密并保存审计事件
      const encryptedEvent = await encryptionManager.encrypt(event);
      await AsyncStorage.setItem(`@audit_${event.id}`, encryptedEvent);
    } catch (error) {
      console.error('Failed to persist audit event:', error);
    }
  }

  private async cleanupOldEvents(): Promise<void> {
    const cutoffDate = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    this.events = this.events.filter(event => event.timestamp > cutoffDate);

    try {
      const keys = await AsyncStorage.getAllKeys();
      const auditKeys = keys.filter(key => key.startsWith('@audit_'));
      
      for (const key of auditKeys) {
        const event = await this.getEvent(key);
        if (event && event.timestamp <= cutoffDate) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old events:', error);
    }
  }

  private async getEvent(key: string): Promise<AuditEvent | null> {
    try {
      const encryptedEvent = await AsyncStorage.getItem(key);
      if (!encryptedEvent) return null;
      return await encryptionManager.decrypt<AuditEvent>(encryptedEvent);
    } catch (error) {
      console.error('Failed to get audit event:', error);
      return null;
    }
  }

  async getEvents(options?: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: 'success' | 'failure';
  }): Promise<AuditEvent[]> {
    let events = [...this.events];

    if (options?.startDate) {
      events = events.filter(e => e.timestamp >= options.startDate!.getTime());
    }
    if (options?.endDate) {
      events = events.filter(e => e.timestamp <= options.endDate!.getTime());
    }
    if (options?.type) {
      events = events.filter(e => e.type === options.type);
    }
    if (options?.status) {
      events = events.filter(e => e.status === options.status);
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  async exportAuditLog(format: 'json' | 'csv'): Promise<string> {
    const events = await this.getEvents();
    
    if (format === 'csv') {
      return this.generateCSV(events);
    }
    return JSON.stringify(events, null, 2);
  }

  private generateCSV(events: AuditEvent[]): string {
    const headers = ['Timestamp', 'Type', 'Action', 'Status', 'Details'];
    const rows = events.map(event => [
      new Date(event.timestamp).toISOString(),
      event.type,
      event.action,
      event.status,
      JSON.stringify(event.details),
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }

  updateConfig(config: Partial<AuditConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

export const auditManager = AuditManager.getInstance(); 