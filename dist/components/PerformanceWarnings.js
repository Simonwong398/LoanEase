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
const LanguageContext_1 = require("../i18n/LanguageContext");
const performanceWarningSystem_1 = require("../utils/performanceWarningSystem");
const PerformanceWarnings = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [warnings, setWarnings] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const unsubscribe = performanceWarningSystem_1.performanceWarningSystem.subscribe(setWarnings);
        return unsubscribe;
    }, []);
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    if (warnings.length === 0) {
        return null;
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('performance.warnings.title')}</react_native_1.Text>
      <react_native_1.ScrollView style={styles.warningsList}>
        {warnings.map(warning => (<react_native_1.View key={warning.id} style={[
                styles.warningItem,
                warning.level === 'critical' ? styles.criticalWarning : styles.normalWarning
            ]}>
            <react_native_1.View style={styles.warningHeader}>
              <react_native_1.Text style={styles.warningTime}>
                {formatTime(warning.timestamp)}
              </react_native_1.Text>
              <react_native_1.Text style={[
                styles.warningLevel,
                warning.level === 'critical' ? styles.criticalText : styles.warningText
            ]}>
                {warning.level === 'critical' ? '严重' : '警告'}
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Text style={styles.warningMessage}>{warning.message}</react_native_1.Text>
            <react_native_1.Text style={styles.warningDetail}>
              当前值: {warning.value.toFixed(2)} / 阈值: {warning.threshold.toFixed(2)}
            </react_native_1.Text>
          </react_native_1.View>))}
      </react_native_1.ScrollView>
      <react_native_1.TouchableOpacity style={styles.clearButton} onPress={() => performanceWarningSystem_1.performanceWarningSystem.clearWarnings()}>
        <react_native_1.Text style={styles.clearButtonText}>{t('performance.warnings.clear')}</react_native_1.Text>
      </react_native_1.TouchableOpacity>
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
    warningsList: {
        maxHeight: 300,
    },
    warningItem: {
        padding: theme_1.theme.spacing.md,
        marginBottom: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderLeftWidth: 4,
    },
    normalWarning: {
        backgroundColor: `${theme_1.theme.colors.warning}10`,
        borderLeftColor: theme_1.theme.colors.warning,
    },
    criticalWarning: {
        backgroundColor: `${theme_1.theme.colors.error}10`,
        borderLeftColor: theme_1.theme.colors.error,
    },
    warningHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme_1.theme.spacing.sm,
    },
    warningTime: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    warningLevel: {
        fontSize: 12,
        fontWeight: '600',
    },
    warningText: {
        color: theme_1.theme.colors.warning,
    },
    criticalText: {
        color: theme_1.theme.colors.error,
    },
    warningMessage: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    warningDetail: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    clearButton: {
        marginTop: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.sm,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    clearButtonText: {
        color: theme_1.theme.colors.text.secondary,
    },
});
exports.default = PerformanceWarnings;
