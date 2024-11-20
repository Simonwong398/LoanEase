"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localizationManager = void 0;
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
const defaultConfigs = {
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
    constructor() {
        this.translations = {};
        this.subscribers = new Set();
        this.currentLocale = 'en-US';
        this.config = defaultConfigs[this.currentLocale];
        this.initialize();
    }
    static getInstance() {
        if (!LocalizationManager.instance) {
            LocalizationManager.instance = new LocalizationManager();
        }
        return LocalizationManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试加载保存的语言设置
                const savedLocale = yield async_storage_1.default.getItem('@app_locale');
                if (savedLocale) {
                    yield this.setLocale(savedLocale);
                }
                else {
                    // 使用系统语言
                    const deviceLocale = this.getDeviceLocale();
                    yield this.setLocale(this.getSupportedLocale(deviceLocale));
                }
                yield auditManager_1.auditManager.logEvent({
                    type: 'localization',
                    action: 'initialize',
                    status: 'success',
                    details: { locale: this.currentLocale },
                });
            }
            catch (error) {
                console.error('Localization initialization failed:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'localization',
                    action: 'initialize',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    getDeviceLocale() {
        if (react_native_1.Platform.OS === 'ios') {
            return react_native_1.NativeModules.SettingsManager.settings.AppleLocale ||
                react_native_1.NativeModules.SettingsManager.settings.AppleLanguages[0];
        }
        else if (react_native_1.Platform.OS === 'android') {
            return react_native_1.NativeModules.I18nManager.localeIdentifier;
        }
        return 'en-US';
    }
    getSupportedLocale(locale) {
        const supported = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
        };
        const language = locale.split('-')[0].toLowerCase();
        return supported[language] || 'en-US';
    }
    setLocale(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.currentLocale = locale;
                this.config = defaultConfigs[locale];
                // 加载翻译文件
                yield this.loadTranslations(locale);
                // 保存设置
                yield async_storage_1.default.setItem('@app_locale', locale);
                // 通知订阅者
                this.subscribers.forEach(callback => callback(locale));
                yield auditManager_1.auditManager.logEvent({
                    type: 'localization',
                    action: 'change_locale',
                    status: 'success',
                    details: { locale },
                });
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'localization',
                    action: 'change_locale',
                    status: 'failure',
                    details: { locale, error: error instanceof Error ? error.message : 'Unknown error' },
                });
                throw error;
            }
        });
    }
    loadTranslations(locale) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 在实际应用中，这里应该从文件或API加载翻译
                const translations = yield Promise.resolve(`${`../translations/${locale}.json`}`).then(s => __importStar(require(s)));
                this.translations = translations.default;
            }
            catch (error) {
                console.error(`Failed to load translations for ${locale}:`, error);
            }
        });
    }
    // 格式化方法
    formatNumber(value, options) {
        return new Intl.NumberFormat(this.currentLocale, Object.assign(Object.assign({}, this.config.numberFormat), options)).format(value);
    }
    formatCurrency(value, options) {
        return new Intl.NumberFormat(this.currentLocale, Object.assign(Object.assign({}, this.config.currencyFormat), options)).format(value);
    }
    formatDate(date, options) {
        return new Intl.DateTimeFormat(this.currentLocale, Object.assign(Object.assign({}, this.config.dateFormat), options)).format(date);
    }
    formatTime(date, options) {
        return new Intl.DateTimeFormat(this.currentLocale, Object.assign({ hour: 'numeric', minute: 'numeric', second: 'numeric' }, options)).format(date);
    }
    // 时区转换
    toLocalTime(date) {
        return new Date(date.toLocaleString('en-US', { timeZone: this.config.timeZone }));
    }
    fromLocalTime(date) {
        const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        return new Date(utc.getTime() + (utc.getTimezoneOffset() * 60000));
    }
    // 翻译方法
    translate(key, params) {
        let text = this.translations[key] || key;
        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                text = text.replace(`{${param}}`, String(value));
            });
        }
        return text;
    }
    // 订阅语言变化
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    // 获取当前设置
    getCurrentLocale() {
        return this.currentLocale;
    }
    getConfig() {
        return Object.assign({}, this.config);
    }
    getSupportedLocales() {
        return Object.keys(defaultConfigs);
    }
}
exports.localizationManager = LocalizationManager.getInstance();
