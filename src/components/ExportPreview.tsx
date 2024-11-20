import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportTemplate, ExportSection } from '../types/export';
import { PaymentMethod } from '../utils/loanCalculations';

interface ExportPreviewProps {
  template: ExportTemplate;
  loanData: PaymentMethod;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({
  template,
  loanData,
}) => {
  const { t } = useLanguage();

  const renderSection = (section: ExportSection) => {
    switch (section.type) {
      case 'basic':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('export.preview.basic')}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>{t('export.preview.amount')}</Text>
              <Text style={styles.value}>
                ¥{(loanData.totalPayment - loanData.totalInterest).toFixed(2)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('export.preview.monthlyPayment')}</Text>
              <Text style={styles.value}>¥{loanData.monthlyPayment.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t('export.preview.totalInterest')}</Text>
              <Text style={styles.value}>¥{loanData.totalInterest.toFixed(2)}</Text>
            </View>
          </View>
        );

      case 'schedule':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('export.preview.schedule')}</Text>
            {section.options?.detailLevel === 'detailed' ? (
              <ScrollView style={styles.scheduleContainer}>
                {loanData.schedule.slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.scheduleRow}>
                    <Text style={styles.scheduleCell}>{item.month}</Text>
                    <Text style={styles.scheduleCell}>¥{item.payment.toFixed(2)}</Text>
                    <Text style={styles.scheduleCell}>¥{item.principal.toFixed(2)}</Text>
                    <Text style={styles.scheduleCell}>¥{item.interest.toFixed(2)}</Text>
                  </View>
                ))}
                <Text style={styles.previewNote}>
                  {t('export.preview.moreItems', { count: loanData.schedule.length - 5 })}
                </Text>
              </ScrollView>
            ) : (
              <View>
                <Text style={styles.summaryText}>
                  {t('export.preview.scheduleSummary', {
                    months: loanData.schedule.length,
                    firstPayment: loanData.schedule[0].payment.toFixed(2),
                    lastPayment: loanData.schedule[loanData.schedule.length - 1].payment.toFixed(2),
                  })}
                </Text>
              </View>
            )}
          </View>
        );

      case 'analysis':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('export.preview.analysis')}</Text>
            {section.options?.includeCharts && (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>
                  {t('export.preview.chartPlaceholder')}
                </Text>
              </View>
            )}
            <Text style={styles.analysisText}>
              {t('export.preview.analysisContent')}
            </Text>
          </View>
        );

      case 'comparison':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('export.preview.comparison')}</Text>
            <Text style={styles.comparisonText}>
              {t('export.preview.comparisonContent')}
            </Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{template.name}</Text>
      {template.sections
        .filter(section => section.enabled)
        .map((section, index) => (
          <View key={index}>
            {renderSection(section)}
          </View>
        ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    margin: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  section: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  scheduleContainer: {
    maxHeight: 200,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  scheduleCell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    color: theme.colors.text.primary,
  },
  previewNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  placeholderText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  analysisText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  comparisonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
});

export default ExportPreview; 