import { logger } from '../logger';
import { storageManager } from '../storage';
import { performanceManager } from '../performance';

// 颜色类型
type ColorValue = string;

// 颜色配置
interface ColorPalette {
  primary: ColorValue;
  secondary: ColorValue;
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
  background: {
    primary: ColorValue;
    secondary: ColorValue;
    tertiary: ColorValue;
  };
  text: {
    primary: ColorValue;
    secondary: ColorValue;
    disabled: ColorValue;
  };
  border: ColorValue;
  divider: ColorValue;
}

// 间距配置
interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

// 圆角配置
interface BorderRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  circle: number;
}

// 字体配置
interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// 主题配置
interface Theme {
  name: string;
  colors: ColorPalette;
  spacing: Spacing;
  borderRadius: BorderRadius;
  typography: Typography;
  isDark: boolean;
}

// 主题变更事件
interface ThemeChangeEvent {
  previousTheme: string;
  newTheme: string;
  isDark: boolean;
}

class ThemeManager {
  private static instance: ThemeManager | null = null;
  private currentTheme: Theme;
  private themes: Map<string, Theme> = new Map();
  private styleElement: HTMLStyleElement | null = null;
  private readonly STORAGE_KEY = 'app_theme';
  private readonly DARK_MODE_MEDIA = window.matchMedia('(prefers-color-scheme: dark)');

  private constructor() {
    this.currentTheme = this.getDefaultTheme();
    this.initialize();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 注册默认主题
      this.registerDefaultThemes();

      // 创建样式元素
      this.createStyleElement();

      // 加载保存的主题
      await this.loadSavedTheme();

      // 监听系统主题变化
      this.watchSystemTheme();

      logger.info('ThemeManager', 'Initialized successfully');
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ThemeManager', 'Initialization failed', actualError);
      throw actualError;
    }
  }

  // 注册主题
  registerTheme(theme: Theme): void {
    try {
      if (this.themes.has(theme.name)) {
        throw new Error(`Theme "${theme.name}" already exists`);
      }

      this.validateTheme(theme);
      this.themes.set(theme.name, theme);

      logger.info('ThemeManager', 'Theme registered', { name: theme.name });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ThemeManager', 'Failed to register theme', actualError);
      throw actualError;
    }
  }

  // 切换主题
  async setTheme(themeName: string): Promise<void> {
    const startTime = performance.now();

    try {
      const theme = this.themes.get(themeName);
      if (!theme) {
        throw new Error(`Theme "${themeName}" not found`);
      }

      const previousTheme = this.currentTheme;
      this.currentTheme = theme;

      // 更新样式
      await this.updateStyles();

      // 保存主题设置
      await storageManager.setItem(this.STORAGE_KEY, themeName);

      // 触发主题变更事件
      this.emitThemeChange({
        previousTheme: previousTheme.name,
        newTheme: theme.name,
        isDark: theme.isDark,
      });

      await performanceManager.recordMetric('theme', 'change', performance.now() - startTime, {
        from: previousTheme.name,
        to: theme.name,
      });

      logger.info('ThemeManager', 'Theme changed', {
        from: previousTheme.name,
        to: theme.name,
      });
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ThemeManager', 'Failed to set theme', actualError);
      throw actualError;
    }
  }

  // 切换明暗模式
  async toggleDarkMode(): Promise<void> {
    const currentTheme = this.currentTheme;
    const targetTheme = this.findMatchingTheme({
      ...currentTheme,
      isDark: !currentTheme.isDark,
    });

    if (targetTheme) {
      await this.setTheme(targetTheme.name);
    }
  }

  // 获取当前主题
  getCurrentTheme(): Theme {
    return { ...this.currentTheme };
  }

  // 获取所有主题
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values()).map(theme => ({ ...theme }));
  }

  private registerDefaultThemes(): void {
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

  private getDefaultTheme(): Theme {
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

  private createStyleElement(): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'app-theme';
      document.head.appendChild(this.styleElement);
    }
  }

  private async loadSavedTheme(): Promise<void> {
    try {
      const savedTheme = await storageManager.getItem<string>(this.STORAGE_KEY);
      if (savedTheme && this.themes.has(savedTheme)) {
        await this.setTheme(savedTheme);
      } else {
        // 使用系统主题偏好
        const prefersDark = this.DARK_MODE_MEDIA.matches;
        const defaultTheme = prefersDark ? 'dark' : 'light';
        await this.setTheme(defaultTheme);
      }
    } catch (error) {
      const actualError = error instanceof Error ? error : new Error(String(error));
      logger.error('ThemeManager', 'Failed to load saved theme', actualError);
    }
  }

  private watchSystemTheme(): void {
    this.DARK_MODE_MEDIA.addEventListener('change', async event => {
      if (!await storageManager.getItem(this.STORAGE_KEY)) {
        // 只有在用户没有明确设置主题时才跟随系统
        const prefersDark = event.matches;
        await this.setTheme(prefersDark ? 'dark' : 'light');
      }
    });
  }

  private async updateStyles(): Promise<void> {
    if (!this.styleElement) return;

    const css = this.generateCSS(this.currentTheme);
    this.styleElement.textContent = css;

    // 更新 body 类名
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${this.currentTheme.name}`);
  }

  private generateCSS(theme: Theme): string {
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

  private generateColorVariables(colors: ColorPalette): string {
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

  private generateSpacingVariables(spacing: Spacing): string {
    return `
      --spacing-xs: ${spacing.xs}px;
      --spacing-sm: ${spacing.sm}px;
      --spacing-md: ${spacing.md}px;
      --spacing-lg: ${spacing.lg}px;
      --spacing-xl: ${spacing.xl}px;
    `;
  }

  private generateBorderRadiusVariables(borderRadius: BorderRadius): string {
    return `
      --radius-xs: ${borderRadius.xs}px;
      --radius-sm: ${borderRadius.sm}px;
      --radius-md: ${borderRadius.md}px;
      --radius-lg: ${borderRadius.lg}px;
      --radius-xl: ${borderRadius.xl}px;
      --radius-circle: ${borderRadius.circle}px;
    `;
  }

  private generateTypographyVariables(typography: Typography): string {
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

  private validateTheme(theme: Theme): void {
    // 实现主题验证逻辑
  }

  private findMatchingTheme(criteria: Partial<Theme>): Theme | undefined {
    return Array.from(this.themes.values()).find(theme => 
      Object.entries(criteria).every(([key, value]) => 
        theme[key as keyof Theme] === value
      )
    );
  }

  private emitThemeChange(event: ThemeChangeEvent): void {
    window.dispatchEvent(
      new CustomEvent('themeChange', { detail: event })
    );
  }

  // 清理资源
  dispose(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    this.themes.clear();
  }
}

export const themeManager = ThemeManager.getInstance();
export type { Theme, ThemeChangeEvent, ColorPalette, Spacing, BorderRadius, Typography }; 