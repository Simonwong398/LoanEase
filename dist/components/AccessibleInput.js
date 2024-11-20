"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const AccessibleInput = ({ label, value, onChangeText, error, hint, style, inputStyle, keyboardType = 'default', returnKeyType = 'done', onSubmitEditing, }) => {
    const [isFocused, setIsFocused] = (0, react_1.useState)(false);
    return (<react_native_1.View style={[styles.container, style]} accessible={true} accessibilityLabel={`${label}${error ? `, ${error}` : ''}`} accessibilityRole="none" accessibilityHint={hint}>
      <react_native_1.Text style={[
            styles.label,
            isFocused && styles.focusedLabel,
            error && styles.errorLabel,
        ]} accessibilityRole="text">
        {label}
      </react_native_1.Text>
      
      <react_native_1.TextInput value={value} onChangeText={onChangeText} style={[
            styles.input,
            isFocused && styles.focusedInput,
            error && styles.errorInput,
            inputStyle,
        ]} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} keyboardType={keyboardType} returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing} accessible={true} accessibilityLabel={label} accessibilityRole="adjustable" accessibilityHint={hint} accessibilityState={{
            disabled: false,
            selected: isFocused,
        }} {...react_native_1.Platform.select({
        ios: {
            accessibilityElementsHidden: false,
            importantForAccessibility: 'yes',
        },
        android: {
            importantForAccessibility: 'yes',
        },
    })}/>
      
      {error && (<react_native_1.Text style={styles.errorText} accessibilityRole="alert" accessible={true}>
          {error}
        </react_native_1.Text>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        marginBottom: theme_1.theme.spacing.md,
    },
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    focusedLabel: {
        color: theme_1.theme.colors.primary,
    },
    errorLabel: {
        color: theme_1.theme.colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
        minHeight: 44, // iOS最小触摸目标
    },
    focusedInput: {
        borderColor: theme_1.theme.colors.primary,
    },
    errorInput: {
        borderColor: theme_1.theme.colors.error,
    },
    errorText: {
        fontSize: 12,
        color: theme_1.theme.colors.error,
        marginTop: theme_1.theme.spacing.xs,
    },
});
exports.default = AccessibleInput;
