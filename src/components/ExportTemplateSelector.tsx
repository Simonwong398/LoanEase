import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportTemplate } from '../types/export';
import { exportManager } from '../utils/exportManager';

interface ExportTemplateSelectorProps {
  onSelect: (template: ExportTemplate) => void;
}

const ExportTemplateSelector: React.FC<ExportTemplateSelectorProps> = ({
  onSelect,
}) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState(exportManager.getTemplates());

  const handleCreateTemplate = async () => {
    const newTemplate = await exportManager.createTemplate({
      name: t('export.newTemplate'),
      format: 'pdf',
      sections: [
        {
          id: 'basic',
          type: 'basic',
          enabled: true,
        },
        {
          id: 'schedule',
          type: 'schedule',
          enabled: true,
          options: {
            detailLevel: 'summary',
          },
        },
      ],
    });
    setTemplates(exportManager.getTemplates());
    onSelect(newTemplate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('export.selectTemplate')}</Text>
      <ScrollView style={styles.templateList}>
        {templates.map(template => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateItem}
            onPress={() => onSelect(template)}
          >
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateFormat}>
                {t(`export.format.${template.format}`)}
              </Text>
            </View>
            <Text style={styles.templateDate}>
              {new Date(template.updatedAt).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateTemplate}
      >
        <Text style={styles.createButtonText}>
          {t('export.createTemplate')}
        </Text>
      </TouchableOpacity>
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
  templateList: {
    maxHeight: 300,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  templateFormat: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  templateDate: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  createButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExportTemplateSelector; 