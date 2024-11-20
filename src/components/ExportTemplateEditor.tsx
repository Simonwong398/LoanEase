import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView } from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportTemplate, ExportSection, ExportFormat } from '../types/export';
import RNPickerSelect from 'react-native-picker-select';

interface ExportTemplateEditorProps {
  template: ExportTemplate;
  onUpdate: (template: ExportTemplate) => void;
}

const ExportTemplateEditor: React.FC<ExportTemplateEditorProps> = ({
  template,
  onUpdate,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(template.name);
  const [format, setFormat] = useState<ExportFormat>(template.format);
  const [sections, setSections] = useState<ExportSection[]>(template.sections);

  const handleSectionToggle = (index: number) => {
    const newSections = [...sections];
    newSections[index].enabled = !newSections[index].enabled;
    setSections(newSections);
    updateTemplate(newSections);
  };

  const handleSectionOptionChange = (index: number, key: string, value: any) => {
    const newSections = [...sections];
    if (!newSections[index].options) {
      newSections[index].options = {};
    }
    newSections[index].options![key] = value;
    setSections(newSections);
    updateTemplate(newSections);
  };

  const updateTemplate = (newSections: ExportSection[]) => {
    onUpdate({
      ...template,
      name,
      format,
      sections: newSections,
      updatedAt: Date.now(),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('export.template.edit')}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('export.template.name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('export.template.namePlaceholder')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('export.template.format')}</Text>
        <RNPickerSelect
          value={format}
          onValueChange={(value) => setFormat(value)}
          items={[
            { label: 'PDF', value: 'pdf' },
            { label: 'Excel', value: 'excel' },
            { label: 'CSV', value: 'csv' },
          ]}
          style={pickerSelectStyles}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('export.template.sections')}</Text>
        {sections.map((section, index) => (
          <View key={section.id} style={styles.sectionItem}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionName}>
                {t(`export.section.${section.type}`)}
              </Text>
              <Switch
                value={section.enabled}
                onValueChange={() => handleSectionToggle(index)}
              />
            </View>
            {section.enabled && (
              <View style={styles.sectionOptions}>
                {section.type === 'schedule' && (
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>
                      {t('export.options.detailLevel')}
                    </Text>
                    <RNPickerSelect
                      value={section.options?.detailLevel || 'summary'}
                      onValueChange={(value) => 
                        handleSectionOptionChange(index, 'detailLevel', value)
                      }
                      items={[
                        { label: t('export.options.summary'), value: 'summary' },
                        { label: t('export.options.detailed'), value: 'detailed' },
                      ]}
                      style={pickerSelectStyles}
                    />
                  </View>
                )}
                {(section.type === 'analysis' || section.type === 'comparison') && (
                  <View style={styles.optionItem}>
                    <Text style={styles.optionLabel}>
                      {t('export.options.includeCharts')}
                    </Text>
                    <Switch
                      value={section.options?.includeCharts || false}
                      onValueChange={(value) =>
                        handleSectionOptionChange(index, 'includeCharts', value)
                      }
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  sectionItem: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionName: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  sectionOptions: {
    marginLeft: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.surface,
  },
});

export default ExportTemplateEditor; 