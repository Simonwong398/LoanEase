import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionManager } from './encryptionManager';
import { privacyManager } from './privacyManager';

interface StorageOptions {
  encrypt?: boolean;
  anonymize?: boolean;
  expiry?: number;
}

class SecureStorageManager {
  private static instance: SecureStorageManager;
  private readonly METADATA_KEY = '@storage_metadata';
  private metadata: Map<string, {
    encrypted: boolean;
    anonymized: boolean;
    expiry?: number;
    lastAccessed: number;
  }> = new Map();

  private constructor() {
    this.loadMetadata();
  }

  static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager();
    }
    return SecureStorageManager.instance;
  }

  private async loadMetadata(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.METADATA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.metadata = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load storage metadata:', error);
    }
  }

  private async saveMetadata(): Promise<void> {
    try {
      const data = Object.fromEntries(this.metadata);
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save storage metadata:', error);
    }
  }

  async setItem(
    key: string,
    value: any,
    options: StorageOptions = {}
  ): Promise<void> {
    try {
      let processedValue = value;

      // 匿名化数据
      if (options.anonymize) {
        processedValue = await privacyManager.anonymizeUserData(processedValue);
      }

      // 加密数据
      if (options.encrypt) {
        processedValue = await encryptionManager.encrypt(processedValue);
      }

      // 保存数据
      await AsyncStorage.setItem(key, JSON.stringify(processedValue));

      // 更新元数据
      this.metadata.set(key, {
        encrypted: !!options.encrypt,
        anonymized: !!options.anonymize,
        expiry: options.expiry,
        lastAccessed: Date.now(),
      });
      await this.saveMetadata();
    } catch (error) {
      console.error('Failed to set item:', error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      // 检查过期
      const meta = this.metadata.get(key);
      if (meta?.expiry && Date.now() > meta.expiry) {
        await this.removeItem(key);
        return null;
      }

      const data = await AsyncStorage.getItem(key);
      if (!data) return null;

      let processedData = JSON.parse(data);

      // 解密数据
      if (meta?.encrypted) {
        processedData = await encryptionManager.decrypt<T>(processedData);
      }

      // 更新访问时间
      if (meta) {
        meta.lastAccessed = Date.now();
        await this.saveMetadata();
      }

      return processedData;
    } catch (error) {
      console.error('Failed to get item:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.metadata.delete(key);
      await this.saveMetadata();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Array.from(this.metadata.keys());
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      this.metadata.clear();
      await this.saveMetadata();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys = Array.from(this.metadata.entries())
      .filter(([_, meta]) => meta.expiry && now > meta.expiry)
      .map(([key]) => key);

    await Promise.all(expiredKeys.map(key => this.removeItem(key)));
  }
}

export const secureStorageManager = SecureStorageManager.getInstance(); 