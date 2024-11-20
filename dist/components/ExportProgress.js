"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ExportProgress = ({ progress, status, fileName, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('export.progress.title')}</react_native_1.Text>
      
      <react_native_1.View style={styles.progressBar}>
        <react_native_1.View style={[
            styles.progressFill,
            { width: `${progress * 100}%` }
        ]}/>
      </react_native_1.View>
      
      <react_native_1.Text style={styles.percentage}>
        {Math.round(progress * 100)}%
      </react_native_1.Text>
      
      <react_native_1.Text style={styles.status}>
        {t(`export.progress.${status}`)}
      </react_native_1.Text>
      
      {fileName && (<react_native_1.Text style={styles.fileName}>
          {fileName}
        </react_native_1.Text>)}
      
      {progress < 1 && (<react_native_1.ActivityIndicator color={theme_1.theme.colors.primary} style={styles.spinner}/>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    progressBar: {
        height: 4,
        backgroundColor: theme_1.theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: theme_1.theme.spacing.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme_1.theme.colors.primary,
    },
    percentage: {
        fontSize: 24,
        fontWeight: '700',
        color: theme_1.theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    status: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme_1.theme.spacing.md,
    },
    fileName: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    spinner: {
        marginTop: theme_1.theme.spacing.md,
    },
});
exports.default = ExportProgress;
