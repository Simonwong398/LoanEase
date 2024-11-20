import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { performanceOptimizationAdvisor } from '../utils/performanceOptimizationAdvisor';
import { performanceMetricsCollector } from '../utils/performanceMetrics';

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string[];
  actions: string[];
}

const OptimizationSuggestions: React.FC = () => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = React.useState<OptimizationSuggestion[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const metrics = performanceMetricsCollector.getMetrics();
      const newSuggestions = performanceOptimizationAdvisor.generateSuggestions(metrics);
      setSuggestions(performanceOptimizationAdvisor.sortSuggestionsByPriority(newSuggestions));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.text.secondary;
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('optimization.suggestions.title')}</Text>
      <ScrollView style={styles.suggestionsList}>
        {suggestions.map(suggestion => (
          <View 
            key={suggestion.id}
            style={[
              styles.suggestionCard,
              { borderLeftColor: getPriorityColor(suggestion.priority) }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <Text
                style={[
                  styles.priority,
                  { color: getPriorityColor(suggestion.priority) }
                ]}
              >
                {t(`optimization.priority.${suggestion.priority}`)}
              </Text>
            </View>
            
            <Text style={styles.description}>{suggestion.description}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('optimization.impact')}</Text>
              {suggestion.impact.map((item, index) => (
                <Text key={index} style={styles.listItem}>• {item}</Text>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('optimization.actions')}</Text>
              {suggestion.actions.map((item, index) => (
                <Text key={index} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  suggestionsList: {
    maxHeight: 400,
  },
  suggestionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  priority: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  listItem: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
});

export default OptimizationSuggestions; 