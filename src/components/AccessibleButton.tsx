import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { accessibility } from '../utils/accessibility';
import { theme } from '../theme/theme';

interface AccessibleButtonProps {
  onPress: () => void;
  label: string;
  hint?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  role?: AccessibilityRole;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onPress,
  label,
  hint,
  disabled = false,
  style,
  textStyle,
  role = 'button',
}) => {
  const minSize = accessibility.getMinimumTouchSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { minWidth: minSize.width, minHeight: minSize.height },
        disabled && styles.disabledButton,
        style,
      ]}
      accessible={true}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole={role}
      accessibilityState={{
        disabled,
        selected: false,
      }}
      {...Platform.select({
        ios: {
          accessibilityElementsHidden: false,
          importantForAccessibility: 'yes',
        },
        android: {
          importantForAccessibility: 'yes',
        },
      })}
    >
      <Text
        style={[
          styles.text,
          disabled && styles.disabledButtonText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  text: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: theme.colors.text.secondary,
  },
});

export default AccessibleButton; 