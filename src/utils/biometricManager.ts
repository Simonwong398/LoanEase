import { Platform, NativeModules } from 'react-native';
import { auditManager } from './auditManager';

// 定义生物识别接口
interface BiometricInterface {
  isSupported(): Promise<boolean>;
  authenticate(options: { reason: string }): Promise<boolean>;
}

// 创建平台特定的生物识别实现
const BiometricModule: BiometricInterface = Platform.select({
  ios: NativeModules.TouchID || NativeModules.FaceID,
  android: NativeModules.BiometricModule,
  default: {
    isSupported: async () => false,
    authenticate: async () => false,
  },
});

interface BiometricConfig {
  enabled: boolean;
  allowFallback: boolean;
  promptMessage: string;
  fallbackMessage: string;
}

class BiometricManager {
  private static instance: BiometricManager;
  private config: BiometricConfig = {
    enabled: false,
    allowFallback: true,
    promptMessage: '请验证身份',
    fallbackMessage: '使用密码',
  };

  private constructor() {
    this.checkBiometricAvailability();
  }

  static getInstance(): BiometricManager {
    if (!BiometricManager.instance) {
      BiometricManager.instance = new BiometricManager();
    }
    return BiometricManager.instance;
  }

  private async checkBiometricAvailability(): Promise<void> {
    try {
      const isSupported = await BiometricModule.isSupported();
      this.config.enabled = isSupported;

      await auditManager.logEvent({
        type: 'security',
        action: 'check_biometric',
        status: 'success',
        details: { 
          available: this.config.enabled, 
          platform: Platform.OS 
        },
      });
    } catch (error) {
      console.error('Biometric check failed:', error);
      this.config.enabled = false;

      await auditManager.logEvent({
        type: 'security',
        action: 'check_biometric',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async authenticate(reason?: string): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const success = await BiometricModule.authenticate({
        reason: reason || this.config.promptMessage,
      });

      await auditManager.logEvent({
        type: 'security',
        action: 'authenticate',
        status: success ? 'success' : 'failure',
        details: { reason },
      });

      return success;
    } catch (error) {
      await auditManager.logEvent({
        type: 'security',
        action: 'authenticate',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      return false;
    }
  }

  updateConfig(newConfig: Partial<BiometricConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
  }

  isAvailable(): boolean {
    return this.config.enabled;
  }
}

export const biometricManager = BiometricManager.getInstance(); 