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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessibilityManager = void 0;
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
class AccessibilityManager {
    constructor() {
        this.config = {
            isScreenReaderEnabled: false,
            isVoiceOverEnabled: false,
            isReduceMotionEnabled: false,
            isBoldTextEnabled: false,
            isHighContrastEnabled: false,
            fontScale: 1,
        };
        this.theme = {
            fontSize: {
                small: 12,
                medium: 16,
                large: 20,
                extraLarge: 24,
            },
            contrast: {
                normal: {
                    text: '#000000',
                    background: '#FFFFFF',
                },
                high: {
                    text: '#FFFFFF',
                    background: '#000000',
                },
            },
        };
        this.subscribers = new Set();
        this.handleScreenReaderChange = (isEnabled) => {
            this.config.isScreenReaderEnabled = isEnabled;
            this.notifySubscribers();
        };
        this.handleReduceMotionChange = (isEnabled) => {
            this.config.isReduceMotionEnabled = isEnabled;
            this.notifySubscribers();
        };
        this.handleBoldTextChange = (isEnabled) => {
            this.config.isBoldTextEnabled = isEnabled;
            this.notifySubscribers();
        };
        this.initialize();
    }
    static getInstance() {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 加载保存的配置
                const savedConfig = yield async_storage_1.default.getItem('@accessibility_config');
                if (savedConfig) {
                    this.config = Object.assign(Object.assign({}, this.config), JSON.parse(savedConfig));
                }
                // 检查系统辅助功能状态
                yield this.checkAccessibilityFeatures();
                // 添加监听器
                this.setupEventListeners();
                yield auditManager_1.auditManager.logEvent({
                    type: 'accessibility',
                    action: 'initialize',
                    status: 'success',
                    details: { config: this.config },
                });
            }
            catch (error) {
                console.error('Accessibility initialization failed:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'accessibility',
                    action: 'initialize',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    checkAccessibilityFeatures() {
        return __awaiter(this, void 0, void 0, function* () {
            const [screenReader, reduceMotion, boldText,] = yield Promise.all([
                react_native_1.AccessibilityInfo.isScreenReaderEnabled(),
                react_native_1.AccessibilityInfo.isReduceMotionEnabled(),
                react_native_1.AccessibilityInfo.isBoldTextEnabled(),
            ]);
            this.config = Object.assign(Object.assign({}, this.config), { isScreenReaderEnabled: screenReader, isReduceMotionEnabled: reduceMotion, isBoldTextEnabled: boldText });
            this.notifySubscribers();
        });
    }
    setupEventListeners() {
        react_native_1.AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
        react_native_1.AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChange);
        if (react_native_1.Platform.OS === 'ios') {
            react_native_1.AccessibilityInfo.addEventListener('boldTextChanged', this.handleBoldTextChange);
        }
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.config));
        this.saveConfig();
    }
    saveConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem('@accessibility_config', JSON.stringify(this.config));
            }
            catch (error) {
                console.error('Failed to save accessibility config:', error);
            }
        });
    }
    // 字体大小相关方法
    getFontSize(size) {
        return this.theme.fontSize[size] * this.config.fontScale;
    }
    getTextStyle(size) {
        return {
            fontSize: this.getFontSize(size),
            fontWeight: this.config.isBoldTextEnabled ? 'bold' : 'normal',
            color: this.getTextColor(),
        };
    }
    // 对比度相关方法
    getTextColor() {
        return this.config.isHighContrastEnabled
            ? this.theme.contrast.high.text
            : this.theme.contrast.normal.text;
    }
    getBackgroundColor() {
        return this.config.isHighContrastEnabled
            ? this.theme.contrast.high.background
            : this.theme.contrast.normal.background;
    }
    // 辅助功能标签生成
    generateA11yLabel(label, role, state) {
        let fullLabel = label;
        if (role) {
            fullLabel += `, ${role}`;
        }
        if (state) {
            Object.entries(state).forEach(([key, value]) => {
                if (value) {
                    fullLabel += `, ${key}`;
                }
            });
        }
        return fullLabel;
    }
    // 订阅配置变化
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    // 配置方法
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
        this.notifySubscribers();
    }
    getConfig() {
        return Object.assign({}, this.config);
    }
    // 动画控制
    shouldEnableAnimations() {
        return !this.config.isReduceMotionEnabled;
    }
    // 屏幕阅读器支持
    isScreenReaderActive() {
        return this.config.isScreenReaderEnabled;
    }
    announceForAccessibility(message) {
        if (this.config.isScreenReaderEnabled) {
            react_native_1.AccessibilityInfo.announceForAccessibility(message);
        }
    }
}
exports.accessibilityManager = AccessibilityManager.getInstance();
