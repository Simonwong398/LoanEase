"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const CalculationProgress = ({ visible, progress, message, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    if (!visible)
        return null;
    return (<react_native_1.Modal transparent visible={visible} animationType="fade">
      <react_native_1.View style={styles.overlay}>
        <react_native_1.View style={styles.container}>
          <react_native_1.ActivityIndicator size="large" color={theme_1.theme.colors.primary}/>
          {progress !== undefined && (<react_native_1.View style={styles.progressContainer}>
              <react_native_1.View style={[
                styles.progressBar,
                { width: `${progress * 100}%` }
            ]}/>
            </react_native_1.View>)}
          <react_native_1.Text style={styles.message}>
            {message || t('calculation.progress')}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
const styles = react_native_1.StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg, alignItems: 'center', minWidth: 200 }, theme_1.theme.shadows.medium),
    progressContainer: {
        width: '100%',
        height: 4,
        backgroundColor: theme_1.theme.colors.border,
        marginVertical: theme_1.theme.spacing.md,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: theme_1.theme.colors.primary,
    },
    message: {
        marginTop: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
        fontSize: 14,
    },
});
exports.default = CalculationProgress;
