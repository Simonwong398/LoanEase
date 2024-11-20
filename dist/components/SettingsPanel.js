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
const theme_1 = require("../theme/theme");
const LanguageContext_1 = require("../i18n/LanguageContext");
const settingsManager_1 = require("../utils/settingsManager");
const settingsSyncManager_1 = require("../utils/settingsSyncManager");
const react_native_picker_select_1 = __importDefault(require("react-native-picker-select"));
const SettingsPanel = () => {
    const { t } = (0, LanguageContext_1.useLanguage)();
    const [settings, setSettings] = react_1.default.useState(settingsManager_1.settingsManager.getSettings());
    react_1.default.useEffect(() => {
        const unsubscribe = settingsManager_1.settingsManager.subscribe(setSettings);
        return unsubscribe;
    }, []);
    const handleCalculatorUpdate = (updates) => __awaiter(void 0, void 0, void 0, function* () {
        yield settingsManager_1.settingsManager.updateCalculatorConfig(updates);
    });
    const handleUIUpdate = (updates) => __awaiter(void 0, void 0, void 0, function* () {
        yield settingsManager_1.settingsManager.updateUIPreferences(updates);
    });
    const handleSyncUpdate = (updates) => __awaiter(void 0, void 0, void 0, function* () {
        yield settingsManager_1.settingsManager.updateSyncConfig(updates);
        if (updates.syncEnabled !== undefined) {
            if (updates.syncEnabled) {
                yield settingsSyncManager_1.settingsSyncManager.enableSync();
            }
            else {
                yield settingsSyncManager_1.settingsSyncManager.disableSync();
            }
        }
    });
    const handleExportSettings = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const settingsJson = yield settingsManager_1.settingsManager.exportSettings();
            // 实现导出逻辑
        }
        catch (error) {
            console.error('Failed to export settings:', error);
        }
    });
    const handleImportSettings = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // 实现导入逻辑
            // const settingsJson = await showFilePicker();
            // await settingsManager.importSettings(settingsJson);
        }
        catch (error) {
            console.error('Failed to import settings:', error);
        }
    });
    return (<react_native_1.ScrollView style={styles.container}>
      {/* 计算器设置 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.calculator.title')}</react_native_1.Text>
        
        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.label}>{t('settings.calculator.defaultLoanType')}</react_native_1.Text>
          <react_native_picker_select_1.default value={settings.calculator.defaultLoanType} onValueChange={(value) => handleCalculatorUpdate({ defaultLoanType: value })} items={[
            { label: t('loanType.commercialHouse.name'), value: 'commercialHouse' },
            { label: t('loanType.providentFund.name'), value: 'providentFund' },
        ]} style={pickerSelectStyles}/>
        </react_native_1.View>

        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.label}>{t('settings.calculator.defaultCity')}</react_native_1.Text>
          <react_native_picker_select_1.default value={settings.calculator.defaultCity} onValueChange={(value) => handleCalculatorUpdate({ defaultCity: value })} items={[
            { label: '北京', value: 'beijing' },
            { label: '上海', value: 'shanghai' },
        ]} style={pickerSelectStyles}/>
        </react_native_1.View>
      </react_native_1.View>

      {/* UI设置 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.ui.title')}</react_native_1.Text>
        
        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.label}>{t('settings.ui.theme')}</react_native_1.Text>
          <react_native_picker_select_1.default value={settings.ui.theme} onValueChange={(value) => handleUIUpdate({ theme: value })} items={[
            { label: t('settings.ui.theme.light'), value: 'light' },
            { label: t('settings.ui.theme.dark'), value: 'dark' },
            { label: t('settings.ui.theme.system'), value: 'system' },
        ]} style={pickerSelectStyles}/>
        </react_native_1.View>

        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.label}>{t('settings.ui.showChart')}</react_native_1.Text>
          <react_native_1.Switch value={settings.ui.showChart} onValueChange={(value) => handleUIUpdate({ showChart: value })}/>
        </react_native_1.View>
      </react_native_1.View>

      {/* 同步设置 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.sync.title')}</react_native_1.Text>
        
        <react_native_1.View style={styles.settingRow}>
          <react_native_1.Text style={styles.label}>{t('settings.sync.enabled')}</react_native_1.Text>
          <react_native_1.Switch value={settings.sync.syncEnabled} onValueChange={(value) => handleSyncUpdate({ syncEnabled: value })}/>
        </react_native_1.View>

        {settings.sync.syncEnabled && (<>
            <react_native_1.View style={styles.settingRow}>
              <react_native_1.Text style={styles.label}>{t('settings.sync.history')}</react_native_1.Text>
              <react_native_1.Switch value={settings.sync.syncItems.history} onValueChange={(value) => handleSyncUpdate({
                syncItems: Object.assign(Object.assign({}, settings.sync.syncItems), { history: value })
            })}/>
            </react_native_1.View>

            <react_native_1.View style={styles.settingRow}>
              <react_native_1.Text style={styles.label}>{t('settings.sync.settings')}</react_native_1.Text>
              <react_native_1.Switch value={settings.sync.syncItems.settings} onValueChange={(value) => handleSyncUpdate({
                syncItems: Object.assign(Object.assign({}, settings.sync.syncItems), { settings: value })
            })}/>
            </react_native_1.View>
          </>)}
      </react_native_1.View>

      {/* 导入导出 */}
      <react_native_1.View style={styles.section}>
        <react_native_1.Text style={styles.sectionTitle}>{t('settings.dataManagement')}</react_native_1.Text>
        
        <react_native_1.View style={styles.buttonContainer}>
          <react_native_1.TouchableOpacity style={styles.button} onPress={handleExportSettings}>
            <react_native_1.Text style={styles.buttonText}>
              {t('settings.exportSettings')}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>

          <react_native_1.TouchableOpacity style={styles.button} onPress={handleImportSettings}>
            <react_native_1.Text style={styles.buttonText}>
              {t('settings.importSettings')}
            </react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
      </react_native_1.View>

      {/* 重置按钮 */}
      <react_native_1.TouchableOpacity style={styles.resetButton} onPress={() => settingsManager_1.settingsManager.resetSettings()}>
        <react_native_1.Text style={styles.resetButtonText}>
          {t('settings.resetAll')}
        </react_native_1.Text>
      </react_native_1.TouchableOpacity>
    </react_native_1.ScrollView>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    section: Object.assign({ margin: theme_1.theme.spacing.md, padding: theme_1.theme.spacing.md, backgroundColor: theme_1.theme.colors.surface, borderRadius: theme_1.theme.borderRadius.md }, theme_1.theme.shadows.small),
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.text.primary,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme_1.theme.spacing.md,
    },
    label: {
        fontSize: 16,
        color: theme_1.theme.colors.text.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme_1.theme.spacing.md,
    },
    button: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.primary,
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.sm,
        alignItems: 'center',
    },
    buttonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    resetButton: {
        margin: theme_1.theme.spacing.md,
        padding: theme_1.theme.spacing.md,
        backgroundColor: theme_1.theme.colors.error,
        borderRadius: theme_1.theme.borderRadius.md,
        alignItems: 'center',
    },
    resetButtonText: {
        color: theme_1.theme.colors.surface,
        fontSize: 16,
        fontWeight: '600',
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
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: theme_1.theme.spacing.md,
        paddingVertical: theme_1.theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.sm,
        color: theme_1.theme.colors.text.primary,
        paddingRight: 30,
    },
});
exports.default = SettingsPanel;
