"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const useExportHistory_1 = require("../hooks/useExportHistory");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const react_native_2 = require("react-native");
const react_native_fs_1 = __importDefault(require("react-native-fs"));
const ExportHistoryScreen = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const { history, loading, clearHistory, deleteHistoryItem } = (0, useExportHistory_1.useExportHistory)();
    const shareFile = (item) => __awaiter(void 0, void 0, void 0, function* () {
        if (!item.filePath)
            return;
        try {
            const exists = yield react_native_fs_1.default.exists(item.filePath);
            if (!exists) {
                console.error('File not found:', item.filePath);
                return;
            }
            yield react_native_2.Share.share({
                url: `file://${item.filePath}`,
                title: item.templateId,
            });
        }
        catch (error) {
            console.error('Share failed:', error);
        }
    });
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };
    const formatFileSize = (size) => {
        if (!size)
            return '';
        if (size < 1024)
            return `${size}B`;
        if (size < 1024 * 1024)
            return `${(size / 1024).toFixed(1)}KB`;
        return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    };
    const renderItem = ({ item }) => (<react_native_1.View style={styles.historyItem}>
      <react_native_1.View style={styles.itemHeader}>
        <react_native_1.Text style={styles.itemTitle}>{item.templateId}</react_native_1.Text>
        <react_native_1.Text style={[
            styles.status,
            item.status === 'success' ? styles.successStatus : styles.failedStatus
        ]}>
          {t(`export.status.${item.status}`)}
        </react_native_1.Text>
      </react_native_1.View>

      <react_native_1.View style={styles.itemDetails}>
        <react_native_1.Text style={styles.itemDetail}>
          {t('export.date')}: {formatDate(item.timestamp)}
        </react_native_1.Text>
        <react_native_1.Text style={styles.itemDetail}>
          {t('export.format')}: {item.format}
        </react_native_1.Text>
        {item.fileSize && (<react_native_1.Text style={styles.itemDetail}>
            {t('export.size')}: {formatFileSize(item.fileSize)}
          </react_native_1.Text>)}
      </react_native_1.View>

      <react_native_1.View style={styles.actionButtons}>
        {item.status === 'success' && (<react_native_1.TouchableOpacity style={styles.shareButton} onPress={() => shareFile(item)}>
            <react_native_1.Text style={styles.buttonText}>{t('export.share')}</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
        <react_native_1.TouchableOpacity style={styles.deleteButton} onPress={() => deleteHistoryItem(item.id)}>
          <react_native_1.Text style={styles.buttonText}>{t('export.delete')}</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>

      {item.error && (<react_native_1.Text style={styles.errorMessage}>{item.error}</react_native_1.Text>)}
    </react_native_1.View>);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>{t('export.history.title')}</react_native_1.Text>
        {history.length > 0 && (<react_native_1.TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <react_native_1.Text style={styles.clearButtonText}>
              {t('export.history.clear')}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>

      {loading ? (<react_native_1.View style={styles.loadingContainer}>
          <react_native_1.Text>{t('export.history.loading')}</react_native_1.Text>
        </react_native_1.View>) : history.length === 0 ? (<react_native_1.View style={styles.emptyContainer}>
          <react_native_1.Text style={styles.emptyText}>
            {t('export.history.empty')}
          </react_native_1.Text>
        </react_native_1.View>) : (<react_native_1.FlatList data={history} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.list}/>)}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme_1.theme.spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    clearButton: {
        padding: theme_1.theme.spacing.sm,
    },
    clearButtonText: {
        color: theme_1.theme.colors.error,
        fontSize: 14,
    },
    list: {
        padding: theme_1.theme.spacing.md,
    },
    historyItem: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.md, marginBottom: theme_1.theme.spacing.md }, theme_1.theme.shadows.small),
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme_1.theme.colors.text.primary,
    },
    status: {
        fontSize: 12,
        fontWeight: '500',
        paddingHorizontal: theme_1.theme.spacing.sm,
        paddingVertical: theme_1.theme.spacing.xs,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    successStatus: {
        backgroundColor: theme_1.theme.colors.success + '20',
        color: theme_1.theme.colors.success,
    },
    failedStatus: {
        backgroundColor: theme_1.theme.colors.error + '20',
        color: theme_1.theme.colors.error,
    },
    itemDetails: {
        marginBottom: theme_1.theme.spacing.md,
    },
    itemDetail: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme_1.theme.spacing.sm,
    },
    shareButton: {
        backgroundColor: theme_1.theme.colors.primary,
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    deleteButton: {
        backgroundColor: theme_1.theme.colors.error,
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 14,
        fontWeight: '500',
    },
    errorMessage: {
        marginTop: theme_1.theme.spacing.sm,
        color: theme_1.theme.colors.error,
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
        color: theme_1.theme.colors.text.secondary,
        fontSize: 16,
    },
});
exports.default = ExportHistoryScreen;
