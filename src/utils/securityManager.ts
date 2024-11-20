import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

// 定义加密接口
interface EncryptionInterface {
  generateKey(): Promise<string>;
  encrypt(data: string, key: string): Promise<string>;
  decrypt(data: string, key: string): Promise<string>;
}

// 创建平台特定的加密实现
const EncryptionModule: EncryptionInterface = Platform.select({
  ios: NativeModules.EncryptionModule,
  android: NativeModules.EncryptionModule,
  default: {
    generateKey: async () => '',
    encrypt: async (data: string) => data,
    decrypt: async (data: string) => data,
  },
});

interface EncryptedData {
  data: string;
  iv: string;
  timestamp: number;
}

class SecurityManager {
  private static instance: SecurityManager;
  private encryptionKey: string | null = null;
  private readonly ENCRYPTION_KEY_KEY = '@encryption_key';

  private constructor() {
    this.initializeEncryption();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // 尝试加载现有密钥
      let key = await AsyncStorage.getItem(this.ENCRYPTION_KEY_KEY);
      
      if (!key) {
        // 生成新密钥
        key = await EncryptionModule.generateKey();
        await AsyncStorage.setItem(this.ENCRYPTION_KEY_KEY, key);
      }

      this.encryptionKey = key;

      await auditManager.logEvent({
        type: 'security',
        action: 'init_encryption',
        status: 'success',
        details: { keyExists: !!key },
      });
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      await auditManager.logEvent({
        type: 'security',
        action: 'init_encryption',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async encryptData(data: any): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const jsonData = JSON.stringify(data);
      const encrypted = await EncryptionModule.encrypt(jsonData, this.encryptionKey);

      const encryptedData: EncryptedData = {
        data: encrypted,
        iv: '', // 在实际实现中应该使用 IV
        timestamp: Date.now(),
      };

      await auditManager.logEvent({
        type: 'security',
        action: 'encrypt',
        status: 'success',
        details: { timestamp: encryptedData.timestamp },
      });

      return JSON.stringify(encryptedData);
    } catch (error) {
      await auditManager.logEvent({
        type: 'security',
        action: 'encrypt',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async decryptData<T>(encryptedString: string): Promise<T> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encryptedData: EncryptedData = JSON.parse(encryptedString);
      const decrypted = await EncryptionModule.decrypt(
        encryptedData.data,
        this.encryptionKey
      );

      await auditManager.logEvent({
        type: 'security',
        action: 'decrypt',
        status: 'success',
        details: { timestamp: encryptedData.timestamp },
      });

      return JSON.parse(decrypted);
    } catch (error) {
      await auditManager.logEvent({
        type: 'security',
        action: 'decrypt',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  async storeEncrypted(key: string, data: any): Promise<void> {
    const encrypted = await this.encryptData(data);
    await AsyncStorage.setItem(key, encrypted);
  }

  async retrieveEncrypted<T>(key: string): Promise<T | null> {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return await this.decryptData<T>(encrypted);
  }

  async removeEncrypted(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async rotateEncryptionKey(): Promise<void> {
    try {
      const newKey = await EncryptionModule.generateKey();
      const oldKey = this.encryptionKey;
      this.encryptionKey = newKey;

      // 重新加密所有数据
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith('@encrypted_')) {
          const encrypted = await AsyncStorage.getItem(key);
          if (encrypted) {
            const data = await this.decryptData(encrypted);
            await this.storeEncrypted(key, data);
          }
        }
      }

      await AsyncStorage.setItem(this.ENCRYPTION_KEY_KEY, newKey);

      await auditManager.logEvent({
        type: 'security',
        action: 'rotate_key',
        status: 'success',
        details: { timestamp: Date.now() },
      });
    } catch (error) {
      this.encryptionKey = null;
      await auditManager.logEvent({
        type: 'security',
        action: 'rotate_key',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }
}

export const securityManager = SecurityManager.getInstance(); 