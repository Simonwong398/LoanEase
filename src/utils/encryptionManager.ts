import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  iterations: number;
}

class EncryptionManager {
  private static instance: EncryptionManager;
  private encryptionKey: string | null = null;
  private readonly config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    iterations: 10000,
  };

  private constructor() {
    this.initializeEncryption();
  }

  static getInstance(): EncryptionManager {
    if (!EncryptionManager.instance) {
      EncryptionManager.instance = new EncryptionManager();
    }
    return EncryptionManager.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      const key = await this.getSecureKey();
      if (key) {
        this.encryptionKey = key;
      } else {
        this.encryptionKey = this.generateKey();
        await this.saveSecureKey(this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.encryptionKey = this.generateFallbackKey();
    }
  }

  private async getSecureKey(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem('@encryption_key');
      } else {
        const credentials = await Keychain.getGenericPassword({
          service: 'encryption_key',
        });
        return credentials ? credentials.password : null;
      }
    } catch (error) {
      console.error('Failed to get secure key:', error);
      return null;
    }
  }

  private async saveSecureKey(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('@encryption_key', key);
      } else {
        await Keychain.setGenericPassword('encryption', key, {
          service: 'encryption_key',
        });
      }
    } catch (error) {
      console.error('Failed to save secure key:', error);
    }
  }

  private generateKey(): string {
    return CryptoJS.lib.WordArray.random(this.config.keySize / 8).toString();
  }

  private generateFallbackKey(): string {
    const deviceInfo = Platform.select({
      ios: 'ios',
      android: 'android',
      default: 'web',
    });
    const message = `${deviceInfo}${Date.now()}`;
    const hash = CryptoJS.SHA256(message);
    return hash.toString(CryptoJS.enc.Hex);
  }

  private generateDeviceHash(): string {
    const deviceInfo = `${Platform.OS}-${Platform.Version}`;
    const message = `${deviceInfo}${Date.now()}`;
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
  }

  async encrypt(data: any): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const jsonStr = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonStr, this.encryptionKey);
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }

  async decrypt<T>(encryptedData: string): Promise<T> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonStr = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }

  async changeEncryptionKey(newKey: string): Promise<void> {
    const oldKey = this.encryptionKey;
    this.encryptionKey = newKey;
    await this.reencryptData(oldKey!, newKey);
    await this.saveSecureKey(newKey);
  }

  private async reencryptData(oldKey: string, newKey: string): Promise<void> {
    // 实现数据重新加密的逻辑
  }

  async validateKey(key: string): Promise<boolean> {
    return key === this.encryptionKey;
  }
}

export const encryptionManager = EncryptionManager.getInstance(); 