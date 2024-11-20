import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';

interface InputErrorMessageProps {
  message?: string;
  visible: boolean;
}

const InputErrorMessage: React.FC<InputErrorMessageProps> = ({
  message,
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

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xs,
  },
  message: {
    fontSize: 12,
    color: theme.colors.error,
    fontStyle: 'italic',
  },
});

export default InputErrorMessage; 