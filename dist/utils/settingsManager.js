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
exports.settingsManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const settings_1 = require("../types/settings");
class SettingsManager {
    constructor() {
        this.STORAGE_KEY = '@user_settings';
        this.settings = settings_1.DEFAULT_SETTINGS;
        this.listeners = new Set();
        this.loadSettings();
    }
    static getInstance() {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.STORAGE_KEY);
                if (data) {
                    this.settings = Object.assign(Object.assign({}, settings_1.DEFAULT_SETTINGS), JSON.parse(data));
                    this.notifyListeners();
                }
            }
            catch (error) {
                console.error('Failed to load settings:', error);
            }
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.settings.lastModified = Date.now();
                yield async_storage_1.default.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
                this.notifyListeners();
            }
            catch (error) {
                console.error('Failed to save settings:', error);
            }
        });
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.settings));
    }
    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.settings);
        return () => this.listeners.delete(listener);
    }
    updateCalculatorConfig(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings.calculator = Object.assign(Object.assign({}, this.settings.calculator), updates);
            yield this.saveSettings();
        });
    }
    updateUIPreferences(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings.ui = Object.assign(Object.assign({}, this.settings.ui), updates);
            yield this.saveSettings();
        });
    }
    updateSyncConfig(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings.sync = Object.assign(Object.assign({}, this.settings.sync), updates);
            yield this.saveSettings();
        });
    }
    resetSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = settings_1.DEFAULT_SETTINGS;
            yield this.saveSettings();
        });
    }
    exportSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.stringify(this.settings, null, 2);
        });
    }
    importSettings(settingsJson) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newSettings = JSON.parse(settingsJson);
                // 验证设置格式
                if (this.validateSettings(newSettings)) {
                    this.settings = Object.assign(Object.assign({}, settings_1.DEFAULT_SETTINGS), newSettings);
                    yield this.saveSettings();
                }
            }
            catch (error) {
                console.error('Failed to import settings:', error);
                throw new Error('Invalid settings format');
            }
        });
    }
    validateSettings(settings) {
        // 实现设置验证逻辑
        return true;
    }
    getSettings() {
        return Object.assign({}, this.settings);
    }
}
exports.settingsManager = SettingsManager.getInstance();
