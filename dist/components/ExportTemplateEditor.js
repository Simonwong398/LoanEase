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
const react_native_picker_select_1 = __importDefault(require("react-native-picker-select"));
const ExportTemplateEditor = ({ template, onUpdate, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [name, setName] = (0, react_1.useState)(template.name);
    const [format, setFormat] = (0, react_1.useState)(template.format);
    const [sections, setSections] = (0, react_1.useState)(template.sections);
    const handleSectionToggle = (index) => {
        const newSections = [...sections];
        newSections[index].enabled = !newSections[index].enabled;
        setSections(newSections);
        updateTemplate(newSections);
    };
    const handleSectionOptionChange = (index, key, value) => {
        const newSections = [...sections];
        if (!newSections[index].options) {
            newSections[index].options = {};
        }
        newSections[index].options[key] = value;
        setSections(newSections);
        updateTemplate(newSections);
    };
    const updateTemplate = (newSections) => {
        onUpdate(Object.assign(Object.assign({}, template), { name,
            format, sections: newSections, updatedAt: Date.now() }));
    };
    return (<react_native_1.ScrollView style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('export.template.edit')}</react_native_1.Text>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.label}>{t('export.template.name')}</react_native_1.Text>
        <react_native_1.TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('export.template.namePlaceholder')}/>
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.label}>{t('export.template.format')}</react_native_1.Text>
        <react_native_picker_select_1.default value={format} onValueChange={(value) => setFormat(value)} items={[
            { label: 'PDF', value: 'pdf' },
            { label: 'Excel', value: 'excel' },
            { label: 'CSV', value: 'csv' },
        ]} style={pickerSelectStyles}/>
      </react_native_1.View>

      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('export.template.sections')}</react_native_1.Text>
        {sections.map((section, index) => {
            var _a, _b;
            return (<react_native_1.View key={section.id} style={styles.sectionItem}>
            <react_native_1.View style={styles.sectionHeader}>
              <react_native_1.Text style={styles.sectionName}>
                {t(`export.section.${section.type}`)}
              </react_native_1.Text>
              <react_native_1.Switch value={section.enabled} onValueChange={() => handleSectionToggle(index)}/>
            </react_native_1.View>
            {section.enabled && (<react_native_1.View style={styles.sectionOptions}>
                {section.type === 'schedule' && (<react_native_1.View style={styles.optionItem}>
                    <react_native_1.Text style={styles.optionLabel}>
                      {t('export.options.detailLevel')}
                    </react_native_1.Text>
                    <react_native_picker_select_1.default value={((_a = section.options) === null || _a === void 0 ? void 0 : _a.detailLevel) || 'summary'} onValueChange={(value) => handleSectionOptionChange(index, 'detailLevel', value)} items={[
                            { label: t('export.options.summary'), value: 'summary' },
                            { label: t('export.options.detailed'), value: 'detailed' },
                        ]} style={pickerSelectStyles}/>
                  </react_native_1.View>)}
                {(section.type === 'analysis' || section.type === 'comparison') && (<react_native_1.View style={styles.optionItem}>
                    <react_native_1.Text style={styles.optionLabel}>
                      {t('export.options.includeCharts')}
                    </react_native_1.Text>
                    <react_native_1.Switch value={((_b = section.options) === null || _b === void 0 ? void 0 : _b.includeCharts) || false} onValueChange={(value) => handleSectionOptionChange(index, 'includeCharts', value)}/>
                  </react_native_1.View>)}
              </react_native_1.View>)}
          </react_native_1.View>);
        })}
      </react_native_1.View>
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        margin: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    section: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    label: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
        marginBottom: theme_1.theme.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        padding: theme_1.theme.spacing.sm,
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    sectionItem: {
        marginBottom: theme_1.theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    sectionName: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
    },
    sectionOptions: {
        marginLeft: theme_1.theme.spacing.md,
        marginTop: theme_1.theme.spacing.sm,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.sm,
    },
    optionLabel: {
        fontSize: 14,
        color: theme_1.theme.colors.text.secondary,
    },
});
const pickerSelectStyles = react_native_1.StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.sm,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: theme_1.theme.colors.surface,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: theme_1.theme.spacing.sm,
        paddingHorizontal: theme_1.theme.spacing.md,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
        backgroundColor: theme_1.theme.colors.surface,
    },
});
exports.default = ExportTemplateEditor;
