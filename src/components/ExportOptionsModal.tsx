import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Switch,
} from 'react-native';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ExportFormat } from '../utils/exportResults';
import ExportFormatSelector from './ExportFormatSelector';

interface ExportOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export interface ExportOptions {
  format: ExportFormat;
  includeSchedule: boolean;
  includeTimestamp: boolean;
  customFileName?: string;
}

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  visible,
  onClose,
  onExport,
}) => {
  const { t } = useLanguage();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeSchedule, setIncludeSchedule] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);

  const handleExport = () => {
    onExport({
      format,
      includeSchedule,
      includeTimestamp,
    });
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('export.options.title')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('export.options.format')}</Text>
            <ExportFormatSelector
              onSelect={setFormat}
              selectedFormat={format}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>
                {t('export.options.includeSchedule')}
              </Text>
              <Switch
                value={includeSchedule}
                onValueChange={setIncludeSchedule}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>
                {t('export.options.includeTimestamp')}
              </Text>
              <Switch
                value={includeTimestamp}
                onValueChange={setIncludeTimestamp}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.exportButton]}
              onPress={handleExport}
            >
              <Text style={[styles.buttonText, styles.exportButtonText]}>
                {t('export.options.export')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...theme.shadows.medium,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  optionLabel: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: theme.colors.border,
  },
  exportButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  exportButtonText: {
    color: theme.colors.surface,
  },
});

export default ExportOptionsModal; 