import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  AccessibilityRole,
} from 'react-native';
import { theme } from '../theme/theme';

interface AccessibleInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  returnKeyType?: 'done' | 'next' | 'search';
  onSubmitEditing?: () => void;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  hint,
  style,
  inputStyle,
  keyboardType = 'default',
  returnKeyType = 'done',
  onSubmitEditing,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityLabel={`${label}${error ? `, ${error}` : ''}`}
      accessibilityRole="none"
      accessibilityHint={hint}
    >
      <Text
        style={[
          styles.label,
          isFocused && styles.focusedLabel,
          error && styles.errorLabel,
        ]}
        accessibilityRole="text"
      >
        {label}
      </Text>
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.input,
          isFocused && styles.focusedInput,
          error && styles.errorInput,
          inputStyle,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        accessible={true}
        accessibilityLabel={label}
        accessibilityRole="adjustable"
        accessibilityHint={hint}
        accessibilityState={{
          disabled: false,
          selected: isFocused,
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
      />
      
      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessible={true}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  focusedLabel: {
    color: theme.colors.primary,
  },
  errorLabel: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
    minHeight: 44, // iOS最小触摸目标
  },
  focusedInput: {
    borderColor: theme.colors.primary,
  },
  errorInput: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default AccessibleInput; 