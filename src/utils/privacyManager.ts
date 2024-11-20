import AsyncStorage from '@react-native-async-storage/async-storage';

interface PrivacyConfig {
  dataRetentionDays: number;
  anonymizeData: boolean;
  collectAnalytics: boolean;
  shareData: boolean;
}

interface PrivacySettings {
  consentGiven: boolean;
  dataCollection: boolean;
  dataSharing: boolean;
  marketingCommunication: boolean;
  lastUpdated: number;
}

class PrivacyManager {
  private static instance: PrivacyManager;
  private config: PrivacyConfig;
  private settings: PrivacySettings;

  private constructor() {
    this.config = {
      dataRetentionDays: 365,
      anonymizeData: true,
      collectAnalytics: false,
      shareData: false,
    };
    this.settings = {
      consentGiven: false,
      dataCollection: false,
      dataSharing: false,
      marketingCommunication: false,
      lastUpdated: Date.now(),
    };
    this.loadSettings();
  }

  static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  private async loadSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('@privacy_settings');
      if (settings) {
        this.settings = JSON.parse(settings);
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('@privacy_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  }

  async updateConsent(settings: Partial<PrivacySettings>): Promise<void> {
    this.settings = {
      ...this.settings,
      ...settings,
      lastUpdated: Date.now(),
    };
    await this.saveSettings();
  }

  async anonymizeUserData(data: any): Promise<any> {
    if (!this.config.anonymizeData) return data;

    // 实现数据匿名化逻辑
    const anonymized = { ...data };
    delete anonymized.personalInfo;
    // 替换敏感信息
    if (anonymized.name) {
      anonymized.name = this.maskString(anonymized.name);
    }
    if (anonymized.email) {
      anonymized.email = this.maskEmail(anonymized.email);
    }
    if (anonymized.phone) {
      anonymized.phone = this.maskPhone(anonymized.phone);
    }
    return anonymized;
  }

  private maskString(str: string): string {
    return str.charAt(0) + '*'.repeat(str.length - 2) + str.charAt(str.length - 1);
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return this.maskString(local) + '@' + domain;
  }

  private maskPhone(phone: string): string {
    return phone.slice(0, 3) + '*'.repeat(4) + phone.slice(-4);
  }

  async cleanupOldData(): Promise<void> {
    const cutoffDate = Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000;
    // 实现数据清理逻辑
  }

  canCollectData(): boolean {
    return this.settings.consentGiven && this.settings.dataCollection;
  }

  canShareData(): boolean {
    return this.settings.consentGiven && this.settings.dataSharing;
  }

  getPrivacySettings(): PrivacySettings {
    return { ...this.settings };
  }

  getDataRetentionPeriod(): number {
    return this.config.dataRetentionDays;
  }
}

export const privacyManager = PrivacyManager.getInstance(); 