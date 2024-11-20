"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const ExportFormatSelector = ({ onSelect, onClose, selectedFormat, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const formats = [
        { id: 'csv', label: 'CSV', icon: '📄' },
        { id: 'excel', label: 'Excel', icon: '📊' },
        { id: 'pdf', label: 'PDF', icon: '📑' },
    ];
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('export.selectFormat')}</react_native_1.Text>
      <react_native_1.View style={styles.formatList}>
        {formats.map(format => (<react_native_1.TouchableOpacity key={format.id} style={[
                styles.formatButton,
                selectedFormat === format.id && styles.selectedFormat
            ]} onPress={() => onSelect(format.id)}>
            <react_native_1.Text style={styles.formatIcon}>{format.icon}</react_native_1.Text>
            <react_native_1.Text style={[
                styles.formatLabel,
                selectedFormat === format.id && styles.selectedFormatLabel
            ]}>
              {format.label}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.View>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        backgroundColor: theme_1.theme.colors.surface,
        borderRadius: theme_1.theme.borderRadius.md,
        padding: theme_1.theme.spacing.lg,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.lg,
        color: theme_1.theme.colors.text.primary,
        textAlign: 'center',
    },
    formatList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: theme_1.theme.spacing.lg,
    },
    formatButton: {
        alignItems: 'center',
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
    },
    selectedFormat: {
        backgroundColor: `${theme_1.theme.colors.primary}10`,
        borderColor: theme_1.theme.colors.primary,
    },
    formatIcon: {
        fontSize: 24,
        marginBottom: theme_1.theme.spacing.sm,
    },
    formatLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.primary,
    },
    selectedFormatLabel: {
        color: theme_1.theme.colors.primary,
        fontWeight: '600',
    },
});
exports.default = ExportFormatSelector;
