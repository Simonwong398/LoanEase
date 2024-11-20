import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { theme } from '../theme/theme';

interface ActionHintProps {
  message: string;
  icon?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  onDismiss?: () => void;
}

const ActionHint: React.FC<ActionHintProps> = ({
  message,
  icon,
  duration = 3000,
  position = 'bottom',
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (duration > 0) {
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <Animated.View
        style={[
          styles.container,
          position === 'top' ? styles.top : styles.bottom,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  top: {
    top: theme.spacing.xl,
  },
  bottom: {
    bottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
});

export default ActionHint; 