"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ExportFormatSelector_1 = __importDefault(require("./ExportFormatSelector"));
const ExportOptionsModal = ({ visible, onClose, onExport, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [format, setFormat] = (0, react_1.useState)('csv');
    const [includeSchedule, setIncludeSchedule] = (0, react_1.useState)(true);
    const [includeTimestamp, setIncludeTimestamp] = (0, react_1.useState)(true);
    const handleExport = () => {
        onExport({
            format,
            includeSchedule,
            includeTimestamp,
        });
        onClose();
    };
    return (<react_native_1.Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <react_native_1.View style={styles.overlay}>
        <react_native_1.View style={styles.container}>
          <react_native_1.Text style={styles.title}>{t('export.options.title')}</react_native_1.Text>

          <react_native_1.View style={styles.section}>
            <react_native_1.Text style={styles.sectionTitle}>{t('export.options.format')}</react_native_1.Text>
            <ExportFormatSelector_1.default onSelect={setFormat} selectedFormat={format}/>
          </react_native_1.View>

          <react_native_1.View style={styles.section}>
            <react_native_1.View style={styles.optionRow}>
              <react_native_1.Text style={styles.optionLabel}>
                {t('export.options.includeSchedule')}
              </react_native_1.Text>
              <react_native_1.Switch value={includeSchedule} onValueChange={setIncludeSchedule} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
            </react_native_1.View>

            <react_native_1.View style={styles.optionRow}>
              <react_native_1.Text style={styles.optionLabel}>
                {t('export.options.includeTimestamp')}
              </react_native_1.Text>
              <react_native_1.Switch value={includeTimestamp} onValueChange={setIncludeTimestamp} trackColor={{ false: theme_1.theme.colors.border, true: theme_1.theme.colors.primary }}/>
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.buttonContainer}>
            <react_native_1.TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <react_native_1.Text style={styles.buttonText}>{t('common.cancel')}</react_native_1.Text>
            </react_native_1.TouchableOpacity>
            <react_native_1.TouchableOpacity style={[styles.button, styles.exportButton]} onPress={handleExport}>
              <react_native_1.Text style={[styles.buttonText, styles.exportButtonText]}>
                {t('export.options.export')}
              </react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
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
    section: {
        marginBottom: theme_1.theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.md,
    },
    optionLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme_1.theme.spacing.lg,
    },
    button: {
        flex: 1,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
        marginHorizontal: theme_1.theme.spacing.xs,
    },
    cancelButton: {
        backgroundColor: theme_1.theme.colors.border,
    },
    exportButton: {
        backgroundColor: theme_1.theme.colors.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    exportButtonText: {
        color: theme_1.theme.colors.surface,
    },
});
exports.default = ExportOptionsModal;
