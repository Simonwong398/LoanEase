import AsyncStorage from '@react-native-async-storage/async-storage';
import { validationCache } from './validationCache';

interface PersistenceConfig {
  maxCacheSize: number;
  persistInterval: number;
  compressionThreshold: number;
  retryAttempts: number;
  retryDelay: number;
}

export class PersistenceManager {
  private static instance: PersistenceManager;
  private config: PersistenceConfig = {
    maxCacheSize: 1000,
    persistInterval: 5 * 60 * 1000, // 5分钟
    compressionThreshold: 1024 * 50, // 50KB
    retryAttempts: 3,
    retryDelay: 1000,
  };

  private persistenceTimer: NodeJS.Timeout | null = null;
  private pendingChanges = new Set<string>();

  private constructor() {
    this.startPersistenceTimer();
  }

  static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  private startPersistenceTimer(): void {
    this.persistenceTimer = setInterval(() => {
      this.persistCache();
    }, this.config.persistInterval);
  }

  async persistCache(): Promise<void> {
    if (this.pendingChanges.size === 0) return;

    const entries = validationCache.getEntries()
      .filter(([key]) => this.pendingChanges.has(key));

    if (entries.length === 0) return;

    const data = JSON.stringify(entries);
    
    const needsCompression = data.length > this.config.compressionThreshold;
    const processedData = needsCompression ? await this.compress(data) : data;

    let attempts = 0;
    while (attempts < this.config.retryAttempts) {
      try {
        await AsyncStorage.setItem(
          '@validation_cache',
          processedData
        );
        this.pendingChanges.clear();
        break;
      } catch (error) {
        attempts++;
        if (attempts === this.config.retryAttempts) {
          console.error('Failed to persist cache after retries:', error);
          break;
        }
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * attempts)
        );
      }
    }
  }

  private async compress(data: string): Promise<string> {
    // 实现简单的压缩算法
    // 这里可以使用更复杂的压缩库
    return data.replace(/\s+/g, '');
  }

  async loadCache(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem('@validation_cache');
      if (!data) return;

      const isCompressed = await this.isCompressed(data);
      const processedData = isCompressed ? await this.decompress(data) : data;
      
      const entries = JSON.parse(processedData);
      validationCache.loadEntries(entries);
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  private async isCompressed(data: string): Promise<boolean> {
    // 检查数据是否被压缩
    return data.startsWith('compressed:');
  }

  private async decompress(data: string): Promise<string> {
    // 实现解压缩
    return data.substring('compressed:'.length);
  }

  recordChange(key: string): void {
    this.pendingChanges.add(key);
  }

  destroy(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }
    this.persistCache();
  }
}

export const persistenceManager = PersistenceManager.getInstance(); 