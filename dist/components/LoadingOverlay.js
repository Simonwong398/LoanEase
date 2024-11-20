"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const LoadingOverlay = ({ visible, message, progress, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    if (!visible)
        return null;
    return (<react_native_1.Modal transparent visible={visible} animationType="fade">
      <react_native_1.View style={styles.overlay}>
        <react_native_1.View style={styles.container}>
          <react_native_1.ActivityIndicator size="large" color={theme_1.theme.colors.primary}/>
          {progress !== undefined && (<react_native_1.View style={styles.progressContainer}>
              <react_native_1.View style={styles.progressBar}>
                <react_native_1.View style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
            ]}/>
              </react_native_1.View>
              <react_native_1.Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </react_native_1.Text>
            </react_native_1.View>)}
          <react_native_1.Text style={styles.message}>
            {message || t('loading.default')}
          </react_native_1.Text>
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
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, padding: theme_1.theme.spacing.lg, borderRadius: theme_1.theme.borderRadius.md, alignItems: 'center', minWidth: 200 }, theme_1.theme.shadows.medium),
    progressContainer: {
        width: '100%',
        marginTop: theme_1.theme.spacing.md,
    },
    progressBar: {
        height: 4,
        backgroundColor: theme_1.theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme_1.theme.colors.primary,
    },
    progressText: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme_1.theme.spacing.xs,
    },
    message: {
        marginTop: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
        fontSize: 14,
        textAlign: 'center',
    },
});
exports.default = LoadingOverlay;
