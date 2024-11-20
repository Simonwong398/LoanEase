import { AccessibilityInfo, Platform, TextStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isVoiceOverEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isBoldTextEnabled: boolean;
  isHighContrastEnabled: boolean;
  fontScale: number;
}

interface AccessibilityTheme {
  fontSize: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  contrast: {
    normal: {
      text: string;
      background: string;
    };
    high: {
      text: string;
      background: string;
    };
  };
}

class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isVoiceOverEnabled: false,
    isReduceMotionEnabled: false,
    isBoldTextEnabled: false,
    isHighContrastEnabled: false,
    fontScale: 1,
  };

  private theme: AccessibilityTheme = {
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

  private subscribers = new Set<(config: AccessibilityConfig) => void>();

  private constructor() {
    this.initialize();
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 加载保存的配置
      const savedConfig = await AsyncStorage.getItem('@accessibility_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      // 检查系统辅助功能状态
      await this.checkAccessibilityFeatures();

      // 添加监听器
      this.setupEventListeners();

      await auditManager.logEvent({
        type: 'accessibility',
        action: 'initialize',
        status: 'success',
        details: { config: this.config },
      });
    } catch (error) {
      console.error('Accessibility initialization failed:', error);
      await auditManager.logEvent({
        type: 'accessibility',
        action: 'initialize',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async checkAccessibilityFeatures(): Promise<void> {
    const [
      screenReader,
      reduceMotion,
      boldText,
    ] = await Promise.all([
      AccessibilityInfo.isScreenReaderEnabled(),
      AccessibilityInfo.isReduceMotionEnabled(),
      AccessibilityInfo.isBoldTextEnabled(),
    ]);

    this.config = {
      ...this.config,
      isScreenReaderEnabled: screenReader,
      isReduceMotionEnabled: reduceMotion,
      isBoldTextEnabled: boldText,
    };

    this.notifySubscribers();
  }

  private setupEventListeners(): void {
    AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      this.handleScreenReaderChange
    );

    AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      this.handleReduceMotionChange
    );

    if (Platform.OS === 'ios') {
      AccessibilityInfo.addEventListener(
        'boldTextChanged',
        this.handleBoldTextChange
      );
    }
  }

  private handleScreenReaderChange = (isEnabled: boolean): void => {
    this.config.isScreenReaderEnabled = isEnabled;
    this.notifySubscribers();
  };

  private handleReduceMotionChange = (isEnabled: boolean): void => {
    this.config.isReduceMotionEnabled = isEnabled;
    this.notifySubscribers();
  };

  private handleBoldTextChange = (isEnabled: boolean): void => {
    this.config.isBoldTextEnabled = isEnabled;
    this.notifySubscribers();
  };

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.config));
    this.saveConfig();
  }

  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        '@accessibility_config',
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.error('Failed to save accessibility config:', error);
    }
  }

  // 字体大小相关方法
  getFontSize(size: keyof AccessibilityTheme['fontSize']): number {
    return this.theme.fontSize[size] * this.config.fontScale;
  }

  getTextStyle(size: keyof AccessibilityTheme['fontSize']): TextStyle {
    return {
      fontSize: this.getFontSize(size),
      fontWeight: this.config.isBoldTextEnabled ? 'bold' : 'normal',
      color: this.getTextColor(),
    };
  }

  // 对比度相关方法
  getTextColor(): string {
    return this.config.isHighContrastEnabled
      ? this.theme.contrast.high.text
      : this.theme.contrast.normal.text;
  }

  getBackgroundColor(): string {
    return this.config.isHighContrastEnabled
      ? this.theme.contrast.high.background
      : this.theme.contrast.normal.background;
  }

  // 辅助功能标签生成
  generateA11yLabel(
    label: string,
    role?: string,
    state?: { [key: string]: boolean }
  ): string {
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
  subscribe(callback: (config: AccessibilityConfig) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // 配置方法
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    this.notifySubscribers();
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  // 动画控制
  shouldEnableAnimations(): boolean {
    return !this.config.isReduceMotionEnabled;
  }

  // 屏幕阅读器支持
  isScreenReaderActive(): boolean {
    return this.config.isScreenReaderEnabled;
  }

  announceForAccessibility(message: string): void {
    if (this.config.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }
}

export const accessibilityManager = AccessibilityManager.getInstance(); 