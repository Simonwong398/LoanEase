"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsValidator = void 0;
class SettingsValidator {
    constructor() { }
    static getInstance() {
        if (!SettingsValidator.instance) {
            SettingsValidator.instance = new SettingsValidator();
        }
        return SettingsValidator.instance;
    }
    validateSettings(settings) {
        const errors = [];
        // 验证基本结构
        if (!this.validateStructure(settings, errors)) {
            return { isValid: false, errors };
        }
        // 验证计算器配置
        this.validateCalculatorConfig(settings.calculator, errors);
        // 验证UI配置
        this.validateUIPreferences(settings.ui, errors);
        // 验证同步配置
        this.validateSyncConfig(settings.sync, errors);
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    validateStructure(settings, errors) {
        if (!settings) {
            errors.push({
                path: '',
                message: 'Settings object is required',
            });
            return false;
        }
        const requiredSections = ['calculator', 'ui', 'sync', 'lastModified'];
        for (const section of requiredSections) {
            if (!settings[section]) {
                errors.push({
                    path: section,
                    message: `Missing required section: ${section}`,
                });
                return false;
            }
        }
        return true;
    }
    validateCalculatorConfig(config, errors) {
        if (typeof config.maxLoanAmount !== 'number' || config.maxLoanAmount <= 0) {
            errors.push({
                path: 'calculator.maxLoanAmount',
                message: 'Invalid max loan amount',
            });
        }
        if (typeof config.maxTerm !== 'number' || config.maxTerm <= 0) {
            errors.push({
                path: 'calculator.maxTerm',
                message: 'Invalid max term',
            });
        }
        if (typeof config.roundingDecimals !== 'number' || config.roundingDecimals < 0) {
            errors.push({
                path: 'calculator.roundingDecimals',
                message: 'Invalid rounding decimals',
            });
        }
    }
    validateUIPreferences(preferences, errors) {
        const validThemes = ['light', 'dark', 'system'];
        if (!validThemes.includes(preferences.theme)) {
            errors.push({
                path: 'ui.theme',
                message: 'Invalid theme value',
            });
        }
        if (typeof preferences.showChart !== 'boolean') {
            errors.push({
                path: 'ui.showChart',
                message: 'Invalid showChart value',
            });
        }
        if (typeof preferences.showSchedule !== 'boolean') {
            errors.push({
                path: 'ui.showSchedule',
                message: 'Invalid showSchedule value',
            });
        }
    }
    validateSyncConfig(config, errors) {
        if (typeof config.syncEnabled !== 'boolean') {
            errors.push({
                path: 'sync.syncEnabled',
                message: 'Invalid sync enabled value',
            });
        }
        if (typeof config.syncInterval !== 'number' || config.syncInterval < 0) {
            errors.push({
                path: 'sync.syncInterval',
                message: 'Invalid sync interval',
            });
        }
        if (!config.syncItems || typeof config.syncItems !== 'object') {
            errors.push({
                path: 'sync.syncItems',
                message: 'Invalid sync items configuration',
            });
        }
    }
}
exports.settingsValidator = SettingsValidator.getInstance();
