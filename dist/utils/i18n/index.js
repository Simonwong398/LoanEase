"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nManager = void 0;
const logger_1 = require("../logger");
const storage_1 = require("../storage");
const performance_1 = require("../performance");
class I18nManager {
    constructor() {
        this.translations = new Map();
        this.loadedLocales = new Set();
        this.loadingPromises = new Map();
        this.config = {
            defaultLocale: 'en-US',
            fallbackLocale: 'en-US',
            loadPath: '/locales/{{locale}}.json',
            cacheExpiry: 24 * 60 * 60 * 1000, // 24小时
            interpolation: {
                prefix: '{{',
                suffix: '}}',
            },
            pluralization: {
                defaultRule: (count) => count === 0 ? 'zero' : count === 1 ? 'one' : 'other',
                rules: {
                    'en-US': (count) => count === 1 ? 'one' : 'other',
                    'zh-CN': () => 'other',
                    'ja-JP': () => 'other',
                    'ko-KR': () => 'other',
                },
            },
        };
        this.currentLocale = this.config.defaultLocale;
        this.initialize();
    }
    static getInstance() {
        if (!I18nManager.instance) {
            I18nManager.instance = new I18nManager();
        }
        return I18nManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 加载保存的语言设置
                const savedLocale = yield storage_1.storageManager.getItem('app_locale');
                if (savedLocale && this.isValidLocale(savedLocale)) {
                    this.currentLocale = savedLocale;
                }
                // 加载默认语言包
                yield this.loadLocale(this.currentLocale);
                // 如果当前语言不是默认语言，预加载默认语言包作为后备
                if (this.currentLocale !== this.config.fallbackLocale) {
                    yield this.loadLocale(this.config.fallbackLocale);
                }
                logger_1.logger.info('I18nManager', 'Initialized successfully', {
                    currentLocale: this.currentLocale,
                    loadedLocales: Array.from(this.loadedLocales),
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('I18nManager', 'Initialization failed', actualError);
                throw actualError;
            }
        });
    }
    // 切换语言
    setLocale(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                if (!this.isValidLocale(locale)) {
                    throw new Error(`Invalid locale: ${locale}`);
                }
                // 加载新语言包
                yield this.loadLocale(locale);
                // 更新当前语言
                this.currentLocale = locale;
                // 保存语言设置
                yield storage_1.storageManager.setItem('app_locale', locale);
                yield performance_1.performanceManager.recordMetric('i18n', 'setLocale', performance.now() - startTime, {
                    locale,
                    success: true,
                });
                // 触发语言变更事件
                this.emitLocaleChange(locale);
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('I18nManager', 'Failed to set locale', actualError);
                yield performance_1.performanceManager.recordMetric('i18n', 'setLocale', performance.now() - startTime, {
                    locale,
                    success: false,
                    error: actualError.message,
                });
                throw actualError;
            }
        });
    }
    // 获取翻译
    translate(key, params, options) {
        try {
            const locale = (options === null || options === void 0 ? void 0 : options.locale) || this.currentLocale;
            const translations = this.translations.get(locale);
            if (!translations) {
                return this.handleMissingTranslation(key, options === null || options === void 0 ? void 0 : options.defaultValue);
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
                return this.handleMissingTranslation(key, options === null || options === void 0 ? void 0 : options.defaultValue);
            }
            // 处理复数形式
            if ((options === null || options === void 0 ? void 0 : options.count) !== undefined) {
                translation = this.handlePluralization(translation, options.count, locale);
            }
            // 替换参数
            if (params) {
                translation = this.interpolate(translation, params);
            }
            return translation;
        }
        catch (error) {
            const actualError = error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('I18nManager', 'Translation failed', actualError);
            return this.handleMissingTranslation(key, options === null || options === void 0 ? void 0 : options.defaultValue);
        }
    }
    // 获取当前语言
    getCurrentLocale() {
        return this.currentLocale;
    }
    // 获取支持的语言列表
    getSupportedLocales() {
        return ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'];
    }
    // 检查语言包是否已加载
    isLocaleLoaded(locale) {
        return this.loadedLocales.has(locale);
    }
    loadLocale(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            // 如果已经加载，直接返回
            if (this.loadedLocales.has(locale)) {
                return;
            }
            // 如果正在加载，等待加载完成
            if (this.loadingPromises.has(locale)) {
                return this.loadingPromises.get(locale);
            }
            const startTime = performance.now();
            const loadingPromise = (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    // 首先尝试从缓存加载
                    const cached = yield this.loadFromCache(locale);
                    if (cached) {
                        this.translations.set(locale, cached.translations);
                        this.loadedLocales.add(locale);
                        return;
                    }
                    // 从服务器加载
                    const translations = yield this.fetchTranslations(locale);
                    // 保存到缓存
                    yield this.saveToCache(locale, translations);
                    this.translations.set(locale, translations);
                    this.loadedLocales.add(locale);
                    yield performance_1.performanceManager.recordMetric('i18n', 'loadLocale', performance.now() - startTime, {
                        locale,
                        success: true,
                        cached: !!cached,
                    });
                }
                catch (error) {
                    const actualError = error instanceof Error ? error : new Error(String(error));
                    logger_1.logger.error('I18nManager', 'Failed to load locale', actualError);
                    yield performance_1.performanceManager.recordMetric('i18n', 'loadLocale', performance.now() - startTime, {
                        locale,
                        success: false,
                        error: actualError.message,
                    });
                    throw actualError;
                }
                finally {
                    this.loadingPromises.delete(locale);
                }
            }))();
            this.loadingPromises.set(locale, loadingPromise);
            return loadingPromise;
        });
    }
    loadFromCache(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `i18n_${locale}`;
            const cached = yield storage_1.storageManager.getItem(cacheKey);
            if (cached && this.isCacheValid(cached)) {
                return cached;
            }
            return null;
        });
    }
    saveToCache(locale, translations) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `i18n_${locale}`;
            const resource = {
                locale,
                translations,
                metadata: {
                    lastModified: Date.now(),
                    version: '1.0.0',
                },
            };
            yield storage_1.storageManager.setItem(cacheKey, resource, {
                ttl: this.config.cacheExpiry,
            });
        });
    }
    isCacheValid(cached) {
        var _a;
        if (!((_a = cached.metadata) === null || _a === void 0 ? void 0 : _a.lastModified)) {
            return false;
        }
        return Date.now() - cached.metadata.lastModified < this.config.cacheExpiry;
    }
    fetchTranslations(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.config.loadPath.replace('{{locale}}', locale);
            const response = yield fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load translations for locale: ${locale}`);
            }
            return response.json();
        });
    }
    getNestedTranslation(translations, key) {
        const keys = key.split('.');
        let current = translations;
        for (const k of keys) {
            if (!current || typeof current !== 'object') {
                return undefined;
            }
            current = current[k];
        }
        return typeof current === 'string' ? current : undefined;
    }
    handlePluralization(translation, count, locale) {
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
    interpolate(translation, params) {
        const { prefix, suffix } = this.config.interpolation;
        return translation.replace(new RegExp(`${prefix}([\\w.]+)${suffix}`, 'g'), (_, key) => { var _a; return String((_a = params[key]) !== null && _a !== void 0 ? _a : `${prefix}${key}${suffix}`); });
    }
    handleMissingTranslation(key, defaultValue) {
        logger_1.logger.warn('I18nManager', 'Missing translation', { key, locale: this.currentLocale });
        return defaultValue || key;
    }
    isValidLocale(locale) {
        return ['en-US', 'zh-CN', 'ja-JP', 'ko-KR'].includes(locale);
    }
    emitLocaleChange(locale) {
        const event = new CustomEvent('localeChange', { detail: { locale } });
        window.dispatchEvent(event);
    }
    // 清理资源
    dispose() {
        this.translations.clear();
        this.loadedLocales.clear();
        this.loadingPromises.clear();
    }
}
I18nManager.instance = null;
exports.i18nManager = I18nManager.getInstance();
