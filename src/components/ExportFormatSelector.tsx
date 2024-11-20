import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportFormat } from '../utils/exportResults';

interface ExportFormatSelectorProps {
  onSelect: (format: ExportFormat) => void;
  onClose?: () => void;
  selectedFormat: ExportFormat;
}

const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  onSelect,
  onClose,
  selectedFormat,
}) => {
  const { t } = useLanguage();

  const formats: { id: ExportFormat; label: string; icon: string }[] = [
    { id: 'csv', label: 'CSV', icon: '📄' },
    { id: 'excel', label: 'Excel', icon: '📊' },
    { id: 'pdf', label: 'PDF', icon: '📑' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('export.selectFormat')}</Text>
      <View style={styles.formatList}>
        {formats.map(format => (
          <TouchableOpacity
            key={format.id}
            style={[
              styles.formatButton,
              selectedFormat === format.id && styles.selectedFormat
            ]}
            onPress={() => onSelect(format.id)}
          >
            <Text style={styles.formatIcon}>{format.icon}</Text>
            <Text style={[
              styles.formatLabel,
              selectedFormat === format.id && styles.selectedFormatLabel
            ]}>
              {format.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  formatList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  formatButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedFormat: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
  },
  formatIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  formatLabel: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  selectedFormatLabel: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default ExportFormatSelector; 