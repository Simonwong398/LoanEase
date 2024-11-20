import { DeviceAdaptation } from '../hooks/useDeviceAdaptation';
import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;
type StyleValue = number | string;

export class StyleAdapter {
  private deviceAdaptation: DeviceAdaptation;

  constructor(deviceAdaptation: DeviceAdaptation) {
    this.deviceAdaptation = deviceAdaptation;
  }

  adaptSpacing(value: number): number {
    const { baseSpacing, isTablet, isLandscape } = this.deviceAdaptation;
    let adapted = value * (baseSpacing / 8); // 8是基准值

    if (isTablet && isLandscape) {
      adapted *= 1.2; // 平板横屏时增加间距
    }

    return Math.round(adapted);
  }

  adaptFontSize(size: number): number {
    const { baseFontSize, fontScale } = this.deviceAdaptation;
    const adapted = size * (baseFontSize / 14) * fontScale; // 14是基准字号
    return Math.round(adapted);
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
          adapted[key] = this.adaptSpacing(value);
        } else if (key.toLowerCase().includes('font') || key === 'lineHeight') {
          adapted[key] = this.adaptFontSize(value);
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
      adaptedStyles[key] = this.adaptStyle(style as Style);
    });

    return StyleSheet.create(adaptedStyles);
  }
} 