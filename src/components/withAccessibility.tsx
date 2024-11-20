import React from 'react';
import { Platform } from 'react-native';
import { accessibility } from '../utils/accessibility';

interface AccessibilityProps {
  label?: string;
  role?: string;
  state?: { [key: string]: boolean };
  hint?: string;
}

export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AccessibleComponent(
    props: P & AccessibilityProps
  ) {
    const { label, role, state, hint, ...rest } = props;

    const accessibilityProps = {
      accessible: true,
      accessibilityLabel: label 
        ? accessibility.generateA11yLabel(label, role, state)
        : undefined,
      accessibilityRole: role,
      accessibilityHint: hint,
      accessibilityState: state,
      ...Platform.select({
        ios: {
          accessibilityElementsHidden: false,
          importantForAccessibility: 'yes',
        },
        android: {
          importantForAccessibility: 'yes',
        },
      }),
    };

    return <WrappedComponent {...rest as P} {...accessibilityProps} />;
  };
} 