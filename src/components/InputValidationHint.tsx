import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';

interface InputValidationHintProps {
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  visible: boolean;
}

const InputValidationHint: React.FC<InputValidationHintProps> = ({
  message,
  type = 'error',
  visible,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const getIndicatorColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.error;
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'success':
        return theme.colors.success;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.error;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
      <Text style={[styles.message, { color: getMessageColor() }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  indicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
  },
  message: {
    fontSize: 12,
    flex: 1,
  },
});

export default InputValidationHint; 