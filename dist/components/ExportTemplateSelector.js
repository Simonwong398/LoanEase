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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const exportManager_1 = require("../utils/exportManager");
const ExportTemplateSelector = ({ onSelect, }) => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [templates, setTemplates] = (0, react_1.useState)(exportManager_1.exportManager.getTemplates());
    const handleCreateTemplate = () => __awaiter(void 0, void 0, void 0, function* () {
        const newTemplate = yield exportManager_1.exportManager.createTemplate({
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
        setTemplates(exportManager_1.exportManager.getTemplates());
        onSelect(newTemplate);
    });
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>{t('export.selectTemplate')}</react_native_1.Text>
      <react_native_1.ScrollView style={styles.templateList}>
        {templates.map(template => (<react_native_1.TouchableOpacity key={template.id} style={styles.templateItem} onPress={() => onSelect(template)}>
            <react_native_1.View style={styles.templateInfo}>
              <react_native_1.Text style={styles.templateName}>{template.name}</react_native_1.Text>
              <react_native_1.Text style={styles.templateFormat}>
                {t(`export.format.${template.format}`)}
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.Text style={styles.templateDate}>
              {new Date(template.updatedAt).toLocaleDateString()}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>))}
      </react_native_1.ScrollView>
      <react_native_1.TouchableOpacity style={styles.createButton} onPress={handleCreateTemplate}>
        <react_native_1.Text style={styles.createButtonText}>
          {t('export.createTemplate')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    templateList: {
        maxHeight: 300,
    },
    templateItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme_1.theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme_1.theme.colors.border,
    },
    templateInfo: {
        flex: 1,
    },
    templateName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme_1.theme.colors.text.primary,
        marginBottom: theme_1.theme.spacing.xs,
    },
    templateFormat: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    templateDate: {
        fontSize: 12,
        color: theme_1.theme.colors.text.secondary,
    },
    createButton: {
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
        marginTop: theme_1.theme.spacing.md,
    },
    createButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});
exports.default = ExportTemplateSelector;
