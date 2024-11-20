import { Dimensions, ScaledSize, Platform } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// 设计稿基准尺寸
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

/**
 * 响应式布局工具
 * 用于处理不同屏幕尺寸的适配
 */
export const responsive = {
  /**
   * 水平方向自适应
   * @param size 设计稿尺寸
   * @returns 适配后的尺寸
   */
  w: (size: number): number => {
    return (WINDOW_WIDTH / DESIGN_WIDTH) * size;
  },

  /**
   * 垂直方向自适应
   * @param size 设计稿尺寸
   * @returns 适配后的尺寸
   */
  h: (size: number): number => {
    return (WINDOW_HEIGHT / DESIGN_HEIGHT) * size;
  },

  /**
   * 字体大小自适应
   * @param size 设计稿字体大小
   * @returns 适配后的字体大小
   */
  font: (size: number): number => {
    return Platform.select({
      ios: responsive.w(size),
      android: responsive.w(size) * 0.9, // Android字体略小
    }) as number;
  },

  /**
   * 判断是否是平板设备
   * @returns 是否是平板
   */
  isTablet: (): boolean => {
    return WINDOW_WIDTH >= 768;
  },

  /**
   * 获取屏幕方向
   * @returns 屏幕方向
   */
  getOrientation: (): 'portrait' | 'landscape' => {
    return WINDOW_WIDTH > WINDOW_HEIGHT ? 'landscape' : 'portrait';
  },
}; 