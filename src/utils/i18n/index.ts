import { logger } from '../logger';
import { storageManager } from '../storage';
import { performanceManager } from '../performance';

// 支持的语言类型
type Locale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR';

// 翻译键类型
type TranslationKey = string;

// 翻译参数类型
type TranslationParams = Record<string, string | number>;

// 翻译对象类型
type TranslationMap = {
  [key: string]: string | TranslationMap;
};

// 语言包类型
interface LocaleResource {
  locale: Locale;
  translations: TranslationMap;
  metadata?: {
    lastModified?: number;
    version?: string;
    author?: string;
  };
}

// 国际化配置
interface I18nConfig {
  defaultLocale: Locale;
  fallbackLocale: Locale;
  loadPath: string;
  cacheExpiry: number;
  interpolation: {
    prefix: string;
    suffix: string;
  };
  pluralization: {
    defaultRule: (count: number) => 'zero' | 'one' | 'other';
    rules: Record<Locale, (count: number) => string>;
  };
}

class I18nManager {
  private static instance: I18nManager | null = null;
  private currentLocale: Locale;
  private translations: Map<Locale, TranslationMap> = new Map();
  private loadedLocales: Set<Locale> = new Set();
  private loadingPromises: Map<Locale, Promise<void>> = new Map();
  private readonly config: I18nConfig = {
    defaultLocale: 'en-US',
    fallbackLocale: 'en-US',
    loadPath: '/locales/{{locale}}.json',
    cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    pluralization: {
      defaultRule: (count: number) => count === 0 ? 'zero' : count === 1 ? 'one' : 'other',
      rules: {
        'en-US': (count: number) => count === 1 ? 'one' : 'other',
        'zh-CN': () => 'other',
        'ja-JP': () => 'other',
        'ko-KR': () => 'other',
      },
    },
  };

  private constructor() {
    this.currentLocale = this.config.defaultLocale;
    this.initialize();
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 加载保存的语言设置
      const savedLocale = await storageManager.getItem<Locale>('app_locale');
      if (savedLocale && this.isValidLocale(savedLocale)) {
        this.currentLocale = savedLocale;
      }

      // 加载默认语言包
      await this.loadLocale(this.currentLocale);
      
      // 如果当前语言不是默认语言，预加载默认语言包作为后备
      if (this.currentLocale !== this.config.fallbackLocale) {
        await this.loadLocale(this.config.fallbackLocale);
      }

      logger.info('I18nManager', 'Initialized successfully', {
        currentLocale: this.currentLocale,
        loadedLocales: Array.from(this.loadedLocales),
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('I18nManager', 'Initialization failed', actualError);
      throw actualError;
    }
  }

  // 切换语言
  async setLocale(locale: Locale): Promise<void> {
    const startTime = performance.now();

    try {
      if (!this.isValidLocale(locale)) {
        throw new Error(`Invalid locale: ${locale}`);
      }

      // 加载新语言包
      await this.loadLocale(locale);

      // 更新当前语言
      this.currentLocale = locale;

      // 保存语言设置
      await storageManager.setItem('app_locale', locale);

      await performanceManager.recordMetric('i18n', 'setLocale', performance.now() - startTime, {
        locale,
        success: true,
      });

      // 触发语言变更事件
      this.emitLocaleChange(locale);
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('I18nManager', 'Failed to set locale', actualError);
      await performanceManager.recordMetric('i18n', 'setLocale', performance.now() - startTime, {
        locale,
        success: false,
        error: actualError.message,
      });
      throw actualError;
    }
  }

  // 获取翻译
  translate(
    key: TranslationKey,
    params?: TranslationParams,
    options?: {
      locale?: Locale;
      defaultValue?: string;
      count?: number;
    }
  ): string {
    try {
      const locale = options?.locale || this.currentLocale;
      const translations = this.translations.get(locale);
      
      if (!translations) {
        return this.handleMissingTranslation(key, options?.defaultValue);
      }

      // 获取翻译
      let translation = this.getNestedTranslation(translations, key);
      
      // 如果没有找到翻译，尝试使用后备语言
      if (!translation && locale !== this.config.fallbackLocale) {
        const fallbackTranslations = this.translations.get(this.config.fallbackLocale);
        if (fallbackTranslations) {
          translation = this.getNestedTranslation(fallbackTranslations, key);
        }
      }

      // 如果仍然没有找到翻译，返回默认值或键名
      if (!translation) {
        return this.handleMissingTranslation(key, options?.defaultValue);
      }

      // 处理复数形式
      if (options?.count !== undefined) {
        translation = this.handlePluralization(translation, options.count, locale);
      }

      // 替换参数
      if (params) {
        translation = this.interpolate(translation, params);
      }

      return translation;
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('I18nManager', 'Translation failed', actualError);
      return this.handleMissingTranslation(key, options?.defaultValue);
    }
  }

  // 获取当前语言
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  // 获取支持的语言列表
  getSupportedLocales(): Locale[] {
    return ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'];
  }

  // 检查语言包是否已加载
  isLocaleLoaded(locale: Locale): boolean {
    return this.loadedLocales.has(locale);
  }

  private async loadLocale(locale: Locale): Promise<void> {
    // 如果已经加载，直接返回
    if (this.loadedLocales.has(locale)) {
      return;
    }

    // 如果正在加载，等待加载完成
    if (this.loadingPromises.has(locale)) {
      return this.loadingPromises.get(locale);
    }

    const startTime = performance.now();
    const loadingPromise = (async () => {
      try {
        // 首先尝试从缓存加载
        const cached = await this.loadFromCache(locale);
        if (cached) {
          this.translations.set(locale, cached.translations);
          this.loadedLocales.add(locale);
          return;
        }

        // 从服务器加载
        const translations = await this.fetchTranslations(locale);
        
        // 保存到缓存
        await this.saveToCache(locale, translations);
        
        this.translations.set(locale, translations);
        this.loadedLocales.add(locale);

        await performanceManager.recordMetric('i18n', 'loadLocale', performance.now() - startTime, {
          locale,
          success: true,
          cached: !!cached,
        });
      } catch (error) {
        const actualError = error instanceof Error ? error : new Error(String(error));
        logger.error('I18nManager', 'Failed to load locale', actualError);
        await performanceManager.recordMetric('i18n', 'loadLocale', performance.now() - startTime, {
          locale,
          success: false,
          error: actualError.message,
        });
        throw actualError;
      } finally {
        this.loadingPromises.delete(locale);
      }
    })();

    this.loadingPromises.set(locale, loadingPromise);
    return loadingPromise;
  }

  private async loadFromCache(locale: Locale): Promise<LocaleResource | null> {
    const cacheKey = `i18n_${locale}`;
    const cached = await storageManager.getItem<LocaleResource>(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    
    return null;
  }

  private async saveToCache(locale: Locale, translations: TranslationMap): Promise<void> {
    const cacheKey = `i18n_${locale}`;
    const resource: LocaleResource = {
      locale,
      translations,
      metadata: {
        lastModified: Date.now(),
        version: '1.0.0',
      },
    };
    await storageManager.setItem(cacheKey, resource, {
      ttl: this.config.cacheExpiry,
    });
  }

  private isCacheValid(cached: LocaleResource): boolean {
    if (!cached.metadata?.lastModified) {
      return false;
    }
    return Date.now() - cached.metadata.lastModified < this.config.cacheExpiry;
  }

  private async fetchTranslations(locale: Locale): Promise<TranslationMap> {
    const url = this.config.loadPath.replace('{{locale}}', locale);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load translations for locale: ${locale}`);
    }
    return response.json();
  }

  private getNestedTranslation(
    translations: TranslationMap,
    key: string
  ): string | undefined {
    const keys = key.split('.');
    let current: string | TranslationMap | undefined = translations;

    for (const k of keys) {
      if (!current || typeof current !== 'object') {
        return undefined;
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : undefined;
  }

  private handlePluralization(
    translation: string,
    count: number,
    locale: Locale
  ): string {
    const rule = this.config.pluralization.rules[locale] || this.config.pluralization.defaultRule;
    const form = rule(count);
    const forms = translation.split('|');
    
    switch (form) {
      case 'zero':
        return forms[0] || forms[forms.length - 1];
      case 'one':
        return forms[1] || forms[forms.length - 1];
      default:
        return forms[forms.length - 1];
    }
  }

  private interpolate(translation: string, params: TranslationParams): string {
    const { prefix, suffix } = this.config.interpolation;
    return translation.replace(
      new RegExp(`${prefix}([\\w.]+)${suffix}`, 'g'),
      (_, key) => String(params[key] ?? `${prefix}${key}${suffix}`)
    );
  }

  private handleMissingTranslation(key: string, defaultValue?: string): string {
    logger.warn('I18nManager', 'Missing translation', { key, locale: this.currentLocale });
    return defaultValue || key;
  }

  private isValidLocale(locale: string): locale is Locale {
    return ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'].includes(locale);
  }

  private emitLocaleChange(locale: Locale): void {
    const event = new CustomEvent('localeChange', { detail: { locale } });
    window.dispatchEvent(event);
  }

  // 清理资源
  dispose(): void {
    this.translations.clear();
    this.loadedLocales.clear();
    this.loadingPromises.clear();
  }
}

export const i18nManager = I18nManager.getInstance();
export type { Locale, TranslationKey, TranslationParams, TranslationMap }; 