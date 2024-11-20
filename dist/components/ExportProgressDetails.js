"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ExportProgressDetails = ({ visible, stages, currentStage, totalProgress, onClose, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const getStageIcon = (status) => {
        switch (status) {
            case 'completed':
                return '✓';
            case 'error':
                return '✗';
            case 'processing':
                return '⋯';
            default:
                return '○';
        }
    };
    return (<react_native_1.Modal transparent visible={visible} animationType="fade">
      <react_native_1.View style={styles.overlay}>
        <react_native_1.View style={styles.container}>
          <react_native_1.Text style={styles.title}>{t('export.progress.title')}</react_native_1.Text>
          
          <react_native_1.View style={styles.progressBar}>
            <react_native_1.View style={[
            styles.progressFill,
            { width: `${totalProgress * 100}%` }
        ]}/>
          </react_native_1.View>
          
          <react_native_1.Text style={styles.percentage}>
            {Math.round(totalProgress * 100)}%
          </react_native_1.Text>

          <react_native_1.View style={styles.stagesList}>
            {stages.map(stage => (<react_native_1.View key={stage.id} style={[
                styles.stageItem,
                currentStage === stage.id && styles.currentStage
            ]}>
                <react_native_1.Text style={styles.stageIcon}>
                  {getStageIcon(stage.status)}
                </react_native_1.Text>
                <react_native_1.View style={styles.stageInfo}>
                  <react_native_1.Text style={styles.stageName}>
                    {t(`export.stages.${stage.name}`)}
                  </react_native_1.Text>
                  {stage.status === 'processing' && (<react_native_1.ActivityIndicator size="small" color={theme_1.theme.colors.primary}/>)}
                  {stage.error && (<react_native_1.Text style={styles.errorText}>{stage.error}</react_native_1.Text>)}
                </react_native_1.View>
                {stage.status === 'completed' && (<react_native_1.Text style={styles.completedText}>100%</react_native_1.Text>)}
              </react_native_1.View>))}
          </react_native_1.View>

          {stages.some(stage => stage.status === 'error') && (<react_native_1.Text style={styles.retryHint}>
              {t('export.progress.retryHint')}
            </react_native_1.Text>)}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
const styles = react_native_1.StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: Object.assign({ backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md, padding: theme_1.theme.spacing.lg, width: '90%', maxWidth: 400 }, theme_1.theme.shadows.medium),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: theme_1.theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: theme_1.theme.spacing.sm,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme_1.theme.colors.primary,
    },
    percentage: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme_1.theme.spacing.lg,
    },
    stagesList: {
        gap: theme_1.theme.spacing.md,
    },
    stageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme_1.theme.spacing.sm,
        borderRadius: theme_1.theme.borderRadius.sm,
    },
    currentStage: {
        backgroundColor: `${theme_1.theme.colors.primary}10`,
    },
    stageIcon: {
        width: 24,
        textAlign: 'center',
        marginRight: theme_1.theme.spacing.md,
        fontSize: 16,
    },
    stageInfo: {
        flex: 1,
    },
    stageName: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
    },
    completedText: {
        fontSize: 12,
        color: theme_1.theme.colors.success,
    },
    errorText: {
        fontSize: 12,
        color: theme_1.theme.colors.error,
        marginTop: theme_1.theme.spacing.xs,
    },
    retryHint: {
        fontSize: 12,
        color: theme_1.theme.colors.text.hint,
        textAlign: 'center',
        marginTop: theme_1.theme.spacing.lg,
        fontStyle: 'italic',
    },
});
exports.default = ExportProgressDetails;
