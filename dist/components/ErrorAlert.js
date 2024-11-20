"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ErrorAlert = ({ error, onDismiss }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    if (!error)
        return null;
    return (<react_native_1.Modal transparent visible={!!error} animationType="fade" onRequestClose={onDismiss}>
      <react_native_1.View style={styles.overlay}>
        <react_native_1.View style={styles.container}>
          <react_native_1.Text style={styles.title}>{t('error.title')}</react_native_1.Text>
          <react_native_1.Text style={styles.message}>{error.message}</react_native_1.Text>
          {error.field && (<react_native_1.Text style={styles.field}>
              {t(`error.field.${error.field}`)}
            </react_native_1.Text>)}
          <react_native_1.TouchableOpacity style={styles.button} onPress={onDismiss}>
            <react_native_1.Text style={styles.buttonText}>{t('error.dismiss')}</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
const styles = react_native_1.StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg, width: '80%', maxWidth: 400 }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme_1.theme.colors.error,
        marginBottom: theme_1.theme.spacing.md,
    },
    message: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.md,
    },
    field: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.md,
    },
    button: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = ErrorAlert;
