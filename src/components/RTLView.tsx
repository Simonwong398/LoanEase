import React from 'react';
import { View, ViewProps, I18nManager, StyleSheet } from 'react-native';
import { useLocale } from '../i18n';

interface RTLViewProps extends ViewProps {
  reverse?: boolean;
}

/**
 * RTL 支持的 View 组件
 */
const RTLView: React.FC<RTLViewProps> = ({
  children,
  style,
  reverse = false,
  ...props
}) => {
  const { isRTL } = useLocale();
  const shouldReverse = reverse ? !isRTL : isRTL;

  return (
    <View
      {...props}
      style={[
        shouldReverse && styles.reverse,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  reverse: {
    flexDirection: 'row-reverse',
  },
});

export default RTLView; 