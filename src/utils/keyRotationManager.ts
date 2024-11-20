import { encryptionManager } from './encryptionManager';
import { auditManager } from './auditManager';
import CryptoJS from 'crypto-js';

interface KeyRotationConfig {
  rotationInterval: number;  // 毫秒
  minKeyAge: number;        // 毫秒
  maxKeyAge: number;        // 毫秒
  autoRotate: boolean;
}

class KeyRotationManager {
  private static instance: KeyRotationManager;
  private config: KeyRotationConfig = {
    rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
    minKeyAge: 7 * 24 * 60 * 60 * 1000,        // 7天
    maxKeyAge: 90 * 24 * 60 * 60 * 1000,       // 90天
    autoRotate: true,
  };
  private rotationTimer: NodeJS.Timeout | null = null;
  private lastRotation: number = Date.now();

  private constructor() {
    this.startAutoRotation();
  }

  static getInstance(): KeyRotationManager {
    if (!KeyRotationManager.instance) {
      KeyRotationManager.instance = new KeyRotationManager();
    }
    return KeyRotationManager.instance;
  }

  private startAutoRotation(): void {
    if (this.config.autoRotate) {
      this.rotationTimer = setInterval(
        () => this.rotateKey(),
        this.config.rotationInterval
      );
    }
  }

  private stopAutoRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }

  async rotateKey(): Promise<void> {
    try {
      const keyAge = Date.now() - this.lastRotation;
      if (keyAge < this.config.minKeyAge) {
        return;
      }

      // 生成新密钥
      const newKey = this.generateKey();
      
      // 更新加密管理器的密钥
      await encryptionManager.changeEncryptionKey(newKey);
      
      this.lastRotation = Date.now();

      // 记录审计事件
      await auditManager.logEvent({
        type: 'security',
        action: 'key_rotation',
        status: 'success',
        details: {
          keyAge,
          rotationTime: this.lastRotation,
        },
      });
    } catch (error) {
      console.error('Key rotation failed:', error);
      await auditManager.logEvent({
        type: 'security',
        action: 'key_rotation',
        status: 'failure',
        details: {
          error: error.message,
        },
        errorMessage: error.message,
      });
    }
  }

  private generateKey(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return randomBytes.toString(CryptoJS.enc.Hex);
  }

  updateConfig(config: Partial<KeyRotationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    if (config.autoRotate !== undefined) {
      if (config.autoRotate) {
        this.startAutoRotation();
      } else {
        this.stopAutoRotation();
      }
    }
  }

  getKeyAge(): number {
    return Date.now() - this.lastRotation;
  }

  shouldRotate(): boolean {
    const keyAge = this.getKeyAge();
    return keyAge >= this.config.maxKeyAge;
  }

  destroy(): void {
    this.stopAutoRotation();
  }
}

export const keyRotationManager = KeyRotationManager.getInstance(); 