import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { platformStyles } from '../utils/platformStyles';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /**
   * 状态栏背景色
   */
  statusBarColor?: string;
  /**
   * 状态栏内容是否为亮色
   */
  statusBarLight?: boolean;
}

/**
 * 安全区域容器组件
 * 处理不同设备的安全区域和状态栏
 */
const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({
  children,
  style,
  statusBarColor,
  statusBarLight = false,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle={statusBarLight ? 'light-content' : 'dark-content'}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...platformStyles.select(
      {
        // iOS特定样式
      },
      {
        // Android特定样式
        paddingTop: StatusBar.currentHeight,
      }
    ),
  },
});

export default SafeAreaContainer; 