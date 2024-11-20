"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const performanceOptimizationAdvisor_1 = require("../utils/performanceOptimizationAdvisor");
const performanceMetrics_1 = require("../utils/performanceMetrics");
const OptimizationSuggestions = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [suggestions, setSuggestions] = react_1.default.useState([]);
    react_1.default.useEffect(() => {
        const interval = setInterval(() => {
            const metrics = performanceMetrics_1.performanceMetricsCollector.getMetrics();
            const newSuggestions = performanceOptimizationAdvisor_1.performanceOptimizationAdvisor.generateSuggestions(metrics);
            setSuggestions(performanceOptimizationAdvisor_1.performanceOptimizationAdvisor.sortSuggestionsByPriority(newSuggestions));
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return theme_1.theme.colors.error;
            case 'medium': return theme_1.theme.colors.warning;
            case 'low': return theme_1.theme.colors.success;
            default: return theme_1.theme.colors.text.secondary;
        }
    };
    if (suggestions.length === 0) {
        return null;
    }
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('optimization.suggestions.title')}</react_native_1.Text>
      <react_native_1.ScrollView style={styles.suggestionsList}>
        {suggestions.map(suggestion => (<react_native_1.View key={suggestion.id} style={[
                styles.suggestionCard,
                { borderLeftColor: getPriorityColor(suggestion.priority) }
            ]}>
            <react_native_1.View style={styles.header}>
              <react_native_1.Text style={styles.suggestionTitle}>{suggestion.title}</react_native_1.Text>
              <react_native_1.Text style={[
                styles.priority,
                { color: getPriorityColor(suggestion.priority) }
            ]}>
                {t(`optimization.priority.${suggestion.priority}`)}
              </react_native_1.Text>
            </react_native_1.View>
            
            <react_native_1.Text style={styles.description}>{suggestion.description}</react_native_1.Text>

            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>{t('optimization.impact')}</react_native_1.Text>
              {suggestion.impact.map((item, index) => (<react_native_1.Text key={index} style={styles.listItem}>• {item}</react_native_1.Text>))}
            </react_native_1.View>

            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>{t('optimization.actions')}</react_native_1.Text>
              {suggestion.actions.map((item, index) => (<react_native_1.Text key={index} style={styles.listItem}>• {item}</react_native_1.Text>))}
            </react_native_1.View>
          </react_native_1.View>))}
      </react_native_1.ScrollView>
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
    suggestionsList: {
        maxHeight: 400,
    },
    suggestionCard: {
        marginBottom: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.background,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderLeftWidth: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    priority: {
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.md,
    },
    section: {
        marginTop: theme_1.theme.spacing.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    listItem: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginLeft: theme_1.theme.spacing.md,
        marginBottom: theme_1.theme.spacing.xs,
    },
});
exports.default = OptimizationSuggestions;
