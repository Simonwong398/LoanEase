"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const InputValidation = ({ value, rules, fieldName, showValidation, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const fadeAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    react_1.default.useEffect(() => {
        if (showValidation) {
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
        else {
            react_native_1.Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [showValidation]);
    const validationResults = rules.map(rule => ({
        valid: rule.test(value),
        message: rule.message,
    }));
    const isValid = validationResults.every(result => result.valid);
    return (<react_native_1.Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {showValidation && (<>
          <react_native_1.Text style={styles.fieldName}>
            {t(`validation.${fieldName}.title`)}
          </react_native_1.Text>
          {validationResults.map((result, index) => (<react_native_1.View key={index} style={styles.validationItem}>
              <react_native_1.View style={[
                    styles.indicator,
                    result.valid ? styles.validIndicator : styles.invalidIndicator
                ]}/>
              <react_native_1.Text style={[
                    styles.message,
                    result.valid ? styles.validMessage : styles.invalidMessage
                ]}>
                {t(result.message)}
              </react_native_1.Text>
            </react_native_1.View>))}
          {isValid && (<react_native_1.Text style={styles.successMessage}>
              {t(`validation.${fieldName}.valid`)}
            </react_native_1.Text>)}
        </>)}
    </react_native_1.Animated.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        marginTop: theme_1.theme.spacing.xs,
        padding: theme_1.theme.spacing.sm,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    fieldName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    validationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.xs,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme_1.theme.spacing.sm,
    },
    validIndicator: {
        backgroundColor: theme_1.theme.colors.success,
    },
    invalidIndicator: {
        backgroundColor: theme_1.theme.colors.error,
    },
    message: {
        fontSize: 12,
    },
    validMessage: {
        color: theme_1.theme.colors.text.secondary,
    },
    invalidMessage: {
        color: theme_1.theme.colors.error,
    },
    successMessage: {
        fontSize: 12,
        color: theme_1.theme.colors.success,
        fontStyle: 'italic',
        marginTop: theme_1.theme.spacing.sm,
    },
});
exports.default = InputValidation;
