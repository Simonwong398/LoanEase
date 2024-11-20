import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

export type Locale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';

interface LocaleConfig {
  numberFormat: Intl.NumberFormatOptions;
  dateFormat: Intl.DateTimeFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
  timeZone: string;
  firstDayOfWeek: number;
}

const defaultConfigs: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
    dateFormat: { dateStyle: 'full' },
    currencyFormat: { style: 'currency', currency: 'CNY' },
    timeZone: 'Asia/Shanghai',
    firstDayOfWeek: 1,
  },
  'en-US': {
    numberFormat: { style: 'decimal', minimumFractionDigits: 2 },
    dateFormat: { dateStyle: 'full' },
    currencyFormat: { style: 'currency', currency: 'USD' },
    timeZone: 'America/New_York',
    firstDayOfWeek: 0,
  },
  'ja-JP': {
    numberFormat: { style: 'decimal', minimumFractionDigits: 0 },
    dateFormat: { dateStyle: 'full' },
    currencyFormat: { style: 'currency', currency: 'JPY' },
    timeZone: 'Asia/Tokyo',
    firstDayOfWeek: 0,
  },
  'ko-KR': {
    numberFormat: { style: 'decimal', minimumFractionDigits: 0 },
    dateFormat: { dateStyle: 'full' },
    currencyFormat: { style: 'currency', currency: 'KRW' },
    timeZone: 'Asia/Seoul',
    firstDayOfWeek: 0,
  },
};

class LocalizationManager {
  private static instance: LocalizationManager;
  private currentLocale: Locale;
  private config: LocaleConfig;
  private translations: Record<string, string> = {};
  private subscribers = new Set<(locale: Locale) => void>();

  private constructor() {
    this.currentLocale = 'en-US';
    this.config = defaultConfigs[this.currentLocale];
    this.initialize();
  }

  static getInstance(): LocalizationManager {
    if (!LocalizationManager.instance) {
      LocalizationManager.instance = new LocalizationManager();
    }
    return LocalizationManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 尝试加载保存的语言设置
      const savedLocale = await AsyncStorage.getItem('@app_locale');
      if (savedLocale) {
        await this.setLocale(savedLocale as Locale);
      } else {
        // 使用系统语言
        const deviceLocale = this.getDeviceLocale();
        await this.setLocale(this.getSupportedLocale(deviceLocale));
      }

      await auditManager.logEvent({
        type: 'localization',
        action: 'initialize',
        status: 'success',
        details: { locale: this.currentLocale },
      });
    } catch (error) {
      console.error('Localization initialization failed:', error);
      await auditManager.logEvent({
        type: 'localization',
        action: 'initialize',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private getDeviceLocale(): string {
    if (Platform.OS === 'ios') {
      return NativeModules.SettingsManager.settings.AppleLocale ||
             NativeModules.SettingsManager.settings.AppleLanguages[0];
    } else if (Platform.OS === 'android') {
      return NativeModules.I18nManager.localeIdentifier;
    }
    return 'en-US';
  }

  private getSupportedLocale(locale: string): Locale {
    const supported: Record<string, Locale> = {
      'zh': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
    };
    
    const language = locale.split('-')[0].toLowerCase();
    return supported[language] || 'en-US';
  }

  async setLocale(locale: Locale): Promise<void> {
    try {
      this.currentLocale = locale;
      this.config = defaultConfigs[locale];
      
      // 加载翻译文件
      await this.loadTranslations(locale);
      
      // 保存设置
      await AsyncStorage.setItem('@app_locale', locale);
      
      // 通知订阅者
      this.subscribers.forEach(callback => callback(locale));

      await auditManager.logEvent({
        type: 'localization',
        action: 'change_locale',
        status: 'success',
        details: { locale },
      });
    } catch (error) {
      await auditManager.logEvent({
        type: 'localization',
        action: 'change_locale',
        status: 'failure',
        details: { locale, error: error instanceof Error ? error.message : 'Unknown error' },
      });
      throw error;
    }
  }

  private async loadTranslations(locale: Locale): Promise<void> {
    try {
      // 在实际应用中，这里应该从文件或API加载翻译
      const translations = await import(`../translations/${locale}.json`);
      this.translations = translations.default;
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
    }
  }

  // 格式化方法
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(
      this.currentLocale,
      { ...this.config.numberFormat, ...options }
    ).format(value);
  }

  formatCurrency(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(
      this.currentLocale,
      { ...this.config.currencyFormat, ...options }
    ).format(value);
  }

  formatDate(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(
      this.currentLocale,
      { ...this.config.dateFormat, ...options }
    ).format(date);
  }

  formatTime(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(
      this.currentLocale,
      { hour: 'numeric', minute: 'numeric', second: 'numeric', ...options }
    ).format(date);
  }

  // 时区转换
  toLocalTime(date: Date): Date {
    return new Date(date.toLocaleString('en-US', { timeZone: this.config.timeZone }));
  }

  fromLocalTime(date: Date): Date {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    return new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
  }

  // 翻译方法
  translate(key: string, params?: Record<string, string | number>): string {
    let text = this.translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, String(value));
      });
    }
    
    return text;
  }

  // 订阅语言变化
  subscribe(callback: (locale: Locale) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 获取当前设置
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  getConfig(): LocaleConfig {
    return { ...this.config };
  }

  getSupportedLocales(): Locale[] {
    return Object.keys(defaultConfigs) as Locale[];
  }
}

export const localizationManager = LocalizationManager.getInstance(); 