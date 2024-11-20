"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const accessibility_1 = require("../utils/accessibility");
const theme_1 = require("../theme/theme");
const AccessibleButton = ({ onPress, label, hint, disabled = false, style, textStyle, role = 'button', }) => {
    const minSize = accessibility_1.accessibility.getMinimumTouchSize();
    return (<react_native_1.TouchableOpacity onPress={onPress} disabled={disabled} style={[
            styles.button,
            { minWidth: minSize.width, minHeight: minSize.height },
            disabled && styles.disabledButton,
            style,
        ]} accessible={true} accessibilityLabel={label} accessibilityHint={hint} accessibilityRole={role} accessibilityState={{
            disabled,
            selected: false,
        }} {...react_native_1.Platform.select({
        ios: {
            accessibilityElementsHidden: false,
            importantForAccessibility: 'yes',
        },
        android: {
            importantForAccessibility: 'yes',
        },
    })}>
      <react_native_1.Text style={[
            styles.text,
            disabled && styles.disabledButtonText,
            textStyle,
        ]}>
        {label}
      </react_native_1.Text>
    </react_native_1.TouchableOpacity>);
};
const styles = react_native_1.StyleSheet.create({
    button: {
        padding: theme_1.theme.spacing.sm,
        backgroundColor: theme_1.theme.colors.primary,
        borderRadius: theme_1.theme.borderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: theme_1.theme.colors.border,
    },
    text: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButtonText: {
        color: theme_1.theme.colors.text.secondary,
    },
});
exports.default = AccessibleButton;
