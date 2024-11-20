import { Platform, StyleSheet, Dimensions, ScaledSize } from 'react-native';

/**
 * 平台特定样式工具
 * 用于处理不同平台的样式差异
 */
export const platformStyles = {
  /**
   * 根据平台返回特定样式
   * @param ios iOS平台样式
   * @param android Android平台样式
   * @returns 平台特定样式
   */
  select: <T>(ios: T, android: T): T => {
    return Platform.select({
      ios,
      android,
    }) as T;
  },

  /**
   * 获取平台特定阴影样式
   * @param elevation Android阴影高度
   * @param opacity iOS阴影不透明度
   * @returns 平台特定阴影样式
   */
  shadow: (elevation: number = 4, opacity: number = 0.2) => {
    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: opacity,
        shadowRadius: elevation,
      },
      android: {
        elevation,
      },
    });
  },
}; 