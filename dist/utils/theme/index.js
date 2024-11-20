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
exports.themeManager = void 0;
const logger_1 = require("../logger");
const storage_1 = require("../storage");
const performance_1 = require("../performance");
class ThemeManager {
    constructor() {
        this.themes = new Map();
        this.styleElement = null;
        this.STORAGE_KEY = 'app_theme';
        this.DARK_MODE_MEDIA = window.matchMedia('(prefers-color-scheme: dark)');
        this.currentTheme = this.getDefaultTheme();
        this.initialize();
    }
    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 注册默认主题
                this.registerDefaultThemes();
                // 创建样式元素
                this.createStyleElement();
                // 加载保存的主题
                yield this.loadSavedTheme();
                // 监听系统主题变化
                this.watchSystemTheme();
                logger_1.logger.info('ThemeManager', 'Initialized successfully');
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('ThemeManager', 'Initialization failed', actualError);
                throw actualError;
            }
        });
    }
    // 注册主题
    registerTheme(theme) {
        try {
            if (this.themes.has(theme.name)) {
                throw new Error(`Theme "${theme.name}" already exists`);
            }
            this.validateTheme(theme);
            this.themes.set(theme.name, theme);
            logger_1.logger.info('ThemeManager', 'Theme registered', { name: theme.name });
        }
        catch (error) {
            const actualError = error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('ThemeManager', 'Failed to register theme', actualError);
            throw actualError;
        }
    }
    // 切换主题
    setTheme(themeName) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const theme = this.themes.get(themeName);
                if (!theme) {
                    throw new Error(`Theme "${themeName}" not found`);
                }
                const previousTheme = this.currentTheme;
                this.currentTheme = theme;
                // 更新样式
                yield this.updateStyles();
                // 保存主题设置
                yield storage_1.storageManager.setItem(this.STORAGE_KEY, themeName);
                // 触发主题变更事件
                this.emitThemeChange({
                    previousTheme: previousTheme.name,
                    newTheme: theme.name,
                    isDark: theme.isDark,
                });
                yield performance_1.performanceManager.recordMetric('theme', 'change', performance.now() - startTime, {
                    from: previousTheme.name,
                    to: theme.name,
                });
                logger_1.logger.info('ThemeManager', 'Theme changed', {
                    from: previousTheme.name,
                    to: theme.name,
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('ThemeManager', 'Failed to set theme', actualError);
                throw actualError;
            }
        });
    }
    // 切换明暗模式
    toggleDarkMode() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTheme = this.currentTheme;
            const targetTheme = this.findMatchingTheme(Object.assign(Object.assign({}, currentTheme), { isDark: !currentTheme.isDark }));
            if (targetTheme) {
                yield this.setTheme(targetTheme.name);
            }
        });
    }
    // 获取当前主题
    getCurrentTheme() {
        return Object.assign({}, this.currentTheme);
    }
    // 获取所有主题
    getAllThemes() {
        return Array.from(this.themes.values()).map(theme => (Object.assign({}, theme)));
    }
    registerDefaultThemes() {
        // 注册浅色主题
        this.registerTheme({
            name: 'light',
            colors: {
                primary: '#1976d2',
                secondary: '#dc004e',
                success: '#4caf50',
                warning: '#ff9800',
                error: '#f44336',
                info: '#2196f3',
                background: {
                    primary: '#ffffff',
                    secondary: '#f5f5f5',
                    tertiary: '#e0e0e0',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                    disabled: 'rgba(0, 0, 0, 0.38)',
                },
                border: 'rgba(0, 0, 0, 0.12)',
                divider: 'rgba(0, 0, 0, 0.12)',
            },
            spacing: {
                xs: 4,
                sm: 8,
                md: 16,
                lg: 24,
                xl: 32,
            },
            borderRadius: {
                xs: 2,
                sm: 4,
                md: 8,
                lg: 12,
                xl: 16,
                circle: 9999,
            },
            typography: {
                fontFamily: {
                    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    secondary: 'Georgia, "Times New Roman", serif',
                    monospace: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
                fontSize: {
                    xs: 12,
                    sm: 14,
                    md: 16,
                    lg: 20,
                    xl: 24,
                },
                fontWeight: {
                    light: 300,
                    regular: 400,
                    medium: 500,
                    bold: 700,
                },
                lineHeight: {
                    xs: 1.2,
                    sm: 1.4,
                    md: 1.6,
                    lg: 1.8,
                    xl: 2,
                },
            },
            isDark: false,
        });
        // 注册深色主题
        this.registerTheme({
            name: 'dark',
            colors: {
                primary: '#90caf9',
                secondary: '#f48fb1',
                success: '#81c784',
                warning: '#ffb74d',
                error: '#e57373',
                info: '#64b5f6',
                background: {
                    primary: '#121212',
                    secondary: '#1e1e1e',
                    tertiary: '#2c2c2c',
                },
                text: {
                    primary: 'rgba(255, 255, 255, 0.87)',
                    secondary: 'rgba(255, 255, 255, 0.6)',
                    disabled: 'rgba(255, 255, 255, 0.38)',
                },
                border: 'rgba(255, 255, 255, 0.12)',
                divider: 'rgba(255, 255, 255, 0.12)',
            },
            spacing: {
                xs: 4,
                sm: 8,
                md: 16,
                lg: 24,
                xl: 32,
            },
            borderRadius: {
                xs: 2,
                sm: 4,
                md: 8,
                lg: 12,
                xl: 16,
                circle: 9999,
            },
            typography: {
                fontFamily: {
                    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    secondary: 'Georgia, "Times New Roman", serif',
                    monospace: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
                fontSize: {
                    xs: 12,
                    sm: 14,
                    md: 16,
                    lg: 20,
                    xl: 24,
                },
                fontWeight: {
                    light: 300,
                    regular: 400,
                    medium: 500,
                    bold: 700,
                },
                lineHeight: {
                    xs: 1.2,
                    sm: 1.4,
                    md: 1.6,
                    lg: 1.8,
                    xl: 2,
                },
            },
            isDark: true,
        });
    }
    getDefaultTheme() {
        return {
            name: 'light',
            colors: {
                primary: '#1976d2',
                secondary: '#dc004e',
                success: '#4caf50',
                warning: '#ff9800',
                error: '#f44336',
                info: '#2196f3',
                background: {
                    primary: '#ffffff',
                    secondary: '#f5f5f5',
                    tertiary: '#e0e0e0',
                },
                text: {
                    primary: 'rgba(0, 0, 0, 0.87)',
                    secondary: 'rgba(0, 0, 0, 0.6)',
                    disabled: 'rgba(0, 0, 0, 0.38)',
                },
                border: 'rgba(0, 0, 0, 0.12)',
                divider: 'rgba(0, 0, 0, 0.12)',
            },
            spacing: {
                xs: 4,
                sm: 8,
                md: 16,
                lg: 24,
                xl: 32,
            },
            borderRadius: {
                xs: 2,
                sm: 4,
                md: 8,
                lg: 12,
                xl: 16,
                circle: 9999,
            },
            typography: {
                fontFamily: {
                    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    secondary: 'Georgia, "Times New Roman", serif',
                    monospace: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                },
                fontSize: {
                    xs: 12,
                    sm: 14,
                    md: 16,
                    lg: 20,
                    xl: 24,
                },
                fontWeight: {
                    light: 300,
                    regular: 400,
                    medium: 500,
                    bold: 700,
                },
                lineHeight: {
                    xs: 1.2,
                    sm: 1.4,
                    md: 1.6,
                    lg: 1.8,
                    xl: 2,
                },
            },
            isDark: false,
        };
    }
    createStyleElement() {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'app-theme';
            document.head.appendChild(this.styleElement);
        }
    }
    loadSavedTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedTheme = yield storage_1.storageManager.getItem(this.STORAGE_KEY);
                if (savedTheme && this.themes.has(savedTheme)) {
                    yield this.setTheme(savedTheme);
                }
                else {
                    // 使用系统主题偏好
                    const prefersDark = this.DARK_MODE_MEDIA.matches;
                    const defaultTheme = prefersDark ? 'dark' : 'light';
                    yield this.setTheme(defaultTheme);
                }
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('ThemeManager', 'Failed to load saved theme', actualError);
            }
        });
    }
    watchSystemTheme() {
        this.DARK_MODE_MEDIA.addEventListener('change', (event) => __awaiter(this, void 0, void 0, function* () {
            if (!(yield storage_1.storageManager.getItem(this.STORAGE_KEY))) {
                // 只有在用户没有明确设置主题时才跟随系统
                const prefersDark = event.matches;
                yield this.setTheme(prefersDark ? 'dark' : 'light');
            }
        }));
    }
    updateStyles() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.styleElement)
                return;
            const css = this.generateCSS(this.currentTheme);
            this.styleElement.textContent = css;
            // 更新 body 类名
            document.body.classList.remove('theme-light', 'theme-dark');
            document.body.classList.add(`theme-${this.currentTheme.name}`);
        });
    }
    generateCSS(theme) {
        return `
      :root {
        ${this.generateColorVariables(theme.colors)}
        ${this.generateSpacingVariables(theme.spacing)}
        ${this.generateBorderRadiusVariables(theme.borderRadius)}
        ${this.generateTypographyVariables(theme.typography)}
      }

      body {
        background-color: var(--color-background-primary);
        color: var(--color-text-primary);
        font-family: var(--font-family-primary);
        font-size: var(--font-size-md);
        line-height: var(--line-height-md);
        transition: background-color 0.3s ease, color 0.3s ease;
      }
    `;
    }
    generateColorVariables(colors) {
        return `
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};
      --color-background-primary: ${colors.background.primary};
      --color-background-secondary: ${colors.background.secondary};
      --color-background-tertiary: ${colors.background.tertiary};
      --color-text-primary: ${colors.text.primary};
      --color-text-secondary: ${colors.text.secondary};
      --color-text-disabled: ${colors.text.disabled};
      --color-border: ${colors.border};
      --color-divider: ${colors.divider};
    `;
    }
    generateSpacingVariables(spacing) {
        return `
      --spacing-xs: ${spacing.xs}px;
      --spacing-sm: ${spacing.sm}px;
      --spacing-md: ${spacing.md}px;
      --spacing-lg: ${spacing.lg}px;
      --spacing-xl: ${spacing.xl}px;
    `;
    }
    generateBorderRadiusVariables(borderRadius) {
        return `
      --radius-xs: ${borderRadius.xs}px;
      --radius-sm: ${borderRadius.sm}px;
      --radius-md: ${borderRadius.md}px;
      --radius-lg: ${borderRadius.lg}px;
      --radius-xl: ${borderRadius.xl}px;
      --radius-circle: ${borderRadius.circle}px;
    `;
    }
    generateTypographyVariables(typography) {
        return `
      --font-family-primary: ${typography.fontFamily.primary};
      --font-family-secondary: ${typography.fontFamily.secondary};
      --font-family-monospace: ${typography.fontFamily.monospace};
      --font-size-xs: ${typography.fontSize.xs}px;
      --font-size-sm: ${typography.fontSize.sm}px;
      --font-size-md: ${typography.fontSize.md}px;
      --font-size-lg: ${typography.fontSize.lg}px;
      --font-size-xl: ${typography.fontSize.xl}px;
      --font-weight-light: ${typography.fontWeight.light};
      --font-weight-regular: ${typography.fontWeight.regular};
      --font-weight-medium: ${typography.fontWeight.medium};
      --font-weight-bold: ${typography.fontWeight.bold};
      --line-height-xs: ${typography.lineHeight.xs};
      --line-height-sm: ${typography.lineHeight.sm};
      --line-height-md: ${typography.lineHeight.md};
      --line-height-lg: ${typography.lineHeight.lg};
      --line-height-xl: ${typography.lineHeight.xl};
    `;
    }
    validateTheme(theme) {
        // 实现主题验证逻辑
    }
    findMatchingTheme(criteria) {
        return Array.from(this.themes.values()).find(theme => Object.entries(criteria).every(([key, value]) => theme[key] === value));
    }
    emitThemeChange(event) {
        window.dispatchEvent(new CustomEvent('themeChange', { detail: event }));
    }
    // 清理资源
    dispose() {
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
        this.themes.clear();
    }
}
ThemeManager.instance = null;
exports.themeManager = ThemeManager.getInstance();
