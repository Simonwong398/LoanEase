"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsMigrationManager = void 0;
const settings_1 = require("../types/settings");
class SettingsMigrationManager {
    constructor() {
        this.CURRENT_VERSION = 2;
        this.migrations = [];
        this.initializeMigrations();
    }
    static getInstance() {
        if (!SettingsMigrationManager.instance) {
            SettingsMigrationManager.instance = new SettingsMigrationManager();
        }
        return SettingsMigrationManager.instance;
    }
    initializeMigrations() {
        // 版本1到2的迁移
        this.migrations.push({
            version: 2,
            migrate: (oldSettings) => {
                // 处理旧版本设置
                const settings = Object.assign(Object.assign({}, settings_1.DEFAULT_SETTINGS), { calculator: Object.assign(Object.assign({}, settings_1.DEFAULT_SETTINGS.calculator), { defaultLoanType: oldSettings.defaultLoanType || settings_1.DEFAULT_SETTINGS.calculator.defaultLoanType, defaultCity: oldSettings.defaultCity || settings_1.DEFAULT_SETTINGS.calculator.defaultCity }), ui: Object.assign(Object.assign({}, settings_1.DEFAULT_SETTINGS.ui), { theme: oldSettings.theme || settings_1.DEFAULT_SETTINGS.ui.theme, language: oldSettings.language || settings_1.DEFAULT_SETTINGS.ui.language }), sync: settings_1.DEFAULT_SETTINGS.sync, lastModified: Date.now() });
                return settings;
            },
        });
    }
    migrateSettings(settings, fromVersion) {
        let currentSettings = settings;
        // 按版本顺序执行迁移
        this.migrations
            .filter(step => step.version > fromVersion)
            .sort((a, b) => a.version - b.version)
            .forEach(step => {
            try {
                currentSettings = step.migrate(currentSettings);
            }
            catch (error) {
                console.error(`Migration to version ${step.version} failed:`, error);
                // 如果迁移失败，使用默认设置
                currentSettings = Object.assign({}, settings_1.DEFAULT_SETTINGS);
            }
        });
        return currentSettings;
    }
    getCurrentVersion() {
        return this.CURRENT_VERSION;
    }
    needsMigration(version) {
        return version < this.CURRENT_VERSION;
    }
}
exports.settingsMigrationManager = SettingsMigrationManager.getInstance();
