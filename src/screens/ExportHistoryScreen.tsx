import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useExportHistory } from '../hooks/useExportHistory';
import { theme } from '../theme/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { Share } from 'react-native';
import { ExportHistory } from '../types/export';
import RNFS from 'react-native-fs';

const ExportHistoryScreen: React.FC = () => {
  const { t } = useLanguage();
  const { history, loading, clearHistory, deleteHistoryItem } = useExportHistory();

  const shareFile = async (item: ExportHistory) => {
    if (!item.filePath) return;
    
    try {
      const exists = await RNFS.exists(item.filePath);
      if (!exists) {
        console.error('File not found:', item.filePath);
        return;
      }

      await Share.share({
        url: `file://${item.filePath}`,
        title: item.templateId,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  const renderItem = ({ item }: { item: ExportHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.templateId}</Text>
        <Text style={[
          styles.status,
          item.status === 'success' ? styles.successStatus : styles.failedStatus
        ]}>
          {t(`export.status.${item.status}`)}
        </Text>
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemDetail}>
          {t('export.date')}: {formatDate(item.timestamp)}
        </Text>
        <Text style={styles.itemDetail}>
          {t('export.format')}: {item.format}
        </Text>
        {item.fileSize && (
          <Text style={styles.itemDetail}>
            {t('export.size')}: {formatFileSize(item.fileSize)}
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'success' && (
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => shareFile(item)}
          >
            <Text style={styles.buttonText}>{t('export.share')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteHistoryItem(item.id)}
        >
          <Text style={styles.buttonText}>{t('export.delete')}</Text>
        </TouchableOpacity>
      </View>

      {item.error && (
        <Text style={styles.errorMessage}>{item.error}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('export.history.title')}</Text>
        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearButtonText}>
              {t('export.history.clear')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>{t('export.history.loading')}</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('export.history.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  clearButtonText: {
    color: theme.colors.error,
    fontSize: 14,
  },
  list: {
    padding: theme.spacing.md,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  successStatus: {
    backgroundColor: theme.colors.success + '20',
    color: theme.colors.success,
  },
  failedStatus: {
    backgroundColor: theme.colors.error + '20',
    color: theme.colors.error,
  },
  itemDetails: {
    marginBottom: theme.spacing.md,
  },
  itemDetail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '500',
  },
  errorMessage: {
    marginTop: theme.spacing.sm,
    color: theme.colors.error,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
});

export default ExportHistoryScreen; 