import { Platform, Dimensions, ScaledSize, StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';
import { useDeviceAdaptation } from '../hooks/useDeviceAdaptation';

type Style = ViewStyle | TextStyle | ImageStyle;

export interface MobileAdaptationConfig {
  baseWidth: number;
  baseHeight: number;
  baseFontSize: number;
  baseSpacing: number;
  minScale: number;
  maxScale: number;
}

export class MobileAdapter {
  private config: MobileAdaptationConfig;
  private window: ScaledSize;
  private isTablet: boolean;

  constructor(config: Partial<MobileAdaptationConfig> = {}) {
    this.config = {
      baseWidth: 375,
      baseHeight: 667,
      baseFontSize: 14,
      baseSpacing: 8,
      minScale: 0.85,
      maxScale: 1.2,
      ...config,
    };
    this.window = Dimensions.get('window');
    this.isTablet = this.checkIsTablet();
  }

  private checkIsTablet(): boolean {
    const { width, height } = this.window;
    const screenSize = Math.sqrt(width * width + height * height);
    return Platform.OS === 'ios' ? Platform.isPad : screenSize >= 1200;
  }

  scaleSize(size: number): number {
    const { width } = this.window;
    const scale = width / this.config.baseWidth;
    const scaledSize = size * scale;

    // 限制缩放范围
    return Math.min(
      Math.max(scaledSize, size * this.config.minScale),
      size * this.config.maxScale
    );
  }

  scaleFontSize(size: number): number {
    const scaledSize = this.scaleSize(size);
    // 平板设备字体稍大
    return this.isTablet ? scaledSize * 1.1 : scaledSize;
  }

  scaleSpacing(spacing: number): number {
    const scaledSpacing = this.scaleSize(spacing);
    // 平板设备间距稍大
    return this.isTablet ? scaledSpacing * 1.15 : scaledSpacing;
  }

  getResponsiveValue<T>(options: {
    small: T;
    medium: T;
    large: T;
    tablet?: T;
  }): T {
    const { width } = this.window;
    
    if (this.isTablet && options.tablet) {
      return options.tablet;
    }

    if (width < 360) {
      return options.small;
    } else if (width < 768) {
      return options.medium;
    } else {
      return options.large;
    }
  }

  getLayoutStyle(options: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    padding?: number;
    margin?: number;
  }) {
    const { width, height } = this.window;
    const style: any = {};

    if (options.maxWidth) {
      style.maxWidth = Math.min(width * 0.9, options.maxWidth);
    }
    if (options.maxHeight) {
      style.maxHeight = Math.min(height * 0.9, options.maxHeight);
    }
    if (options.minWidth) {
      style.minWidth = Math.min(width * 0.3, options.minWidth);
    }
    if (options.minHeight) {
      style.minHeight = Math.min(height * 0.3, options.minHeight);
    }
    if (options.padding) {
      style.padding = this.scaleSpacing(options.padding);
    }
    if (options.margin) {
      style.margin = this.scaleSpacing(options.margin);
    }

    return style;
  }

  getInputStyle(options: {
    fontSize?: number;
    padding?: number;
    height?: number;
  }) {
    return {
      fontSize: options.fontSize ? 
        this.scaleFontSize(options.fontSize) : 
        this.scaleFontSize(16),
      padding: options.padding ? 
        this.scaleSpacing(options.padding) : 
        this.scaleSpacing(8),
      height: options.height ? 
        this.scaleSize(options.height) : 
        this.scaleSize(44),
    };
  }

  getButtonStyle(options: {
    width?: number;
    height?: number;
    fontSize?: number;
    padding?: number;
    borderRadius?: number;
  }) {
    return {
      width: options.width ? this.scaleSize(options.width) : undefined,
      height: options.height ? 
        this.scaleSize(options.height) : 
        this.scaleSize(44),
      padding: options.padding ? 
        this.scaleSpacing(options.padding) : 
        this.scaleSpacing(12),
      borderRadius: options.borderRadius ? 
        this.scaleSize(options.borderRadius) : 
        this.scaleSize(6),
      fontSize: options.fontSize ? 
        this.scaleFontSize(options.fontSize) : 
        this.scaleFontSize(16),
    };
  }

  getTextStyle(options: {
    fontSize: number;
    lineHeight?: number;
    letterSpacing?: number;
  }) {
    const scaledFontSize = this.scaleFontSize(options.fontSize);
    return {
      fontSize: scaledFontSize,
      lineHeight: options.lineHeight ? 
        this.scaleSize(options.lineHeight) : 
        scaledFontSize * 1.5,
      letterSpacing: options.letterSpacing ? 
        this.scaleSize(options.letterSpacing) : 
        undefined,
    };
  }

  getIconSize(size: number): number {
    return this.scaleSize(size);
  }

  getScreenSize() {
    return {
      width: this.window.width,
      height: this.window.height,
      isTablet: this.isTablet,
      scale: this.window.scale,
      fontScale: this.window.fontScale,
    };
  }

  adaptStyle<T extends Style>(style: T): T {
    const adapted: any = {};

    Object.entries(style).forEach(([key, value]) => {
      if (typeof value === 'number') {
        if (key.toLowerCase().includes('padding') || 
            key.toLowerCase().includes('margin') ||
            key.toLowerCase().includes('gap') ||
            key === 'width' ||
            key === 'height') {
          adapted[key] = this.scaleSpacing(value);
        } else if (key.toLowerCase().includes('font') || key === 'lineHeight') {
          adapted[key] = this.scaleFontSize(value);
        } else {
          adapted[key] = value;
        }
      } else {
        adapted[key] = value;
      }
    });

    return adapted as T;
  }

  createStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    styles: T | StyleSheet.NamedStyles<T>
  ): T {
    const adaptedStyles: { [K in keyof T]: any } = {} as any;

    (Object.entries(styles) as Array<[keyof T, any]>).forEach(([key, style]) => {
      adaptedStyles[key] = this.adaptStyle(style);
    });

    return StyleSheet.create(adaptedStyles);
  }
}

// 创建一个默认实例
export const mobileAdapter = new MobileAdapter();

// 创建一个自定义 hook 用于组件中
export const useMobileAdapter = (config?: Partial<MobileAdaptationConfig>) => {
  const deviceAdaptation = useDeviceAdaptation();
  return new MobileAdapter({
    ...config,
    baseFontSize: deviceAdaptation.baseFontSize,
    baseSpacing: deviceAdaptation.baseSpacing,
  });
}; 