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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUserSettings = useUserSettings;
const useAsyncStorage_1 = require("./useAsyncStorage");
const DEFAULT_SETTINGS = {
    language: 'zh',
    theme: 'system',
    defaultLoanType: 'commercialHouse',
    defaultCity: 'beijing',
    defaultTerm: 30,
    showChart: true,
    showSchedule: false,
    lastUsedValues: {},
};
const SETTINGS_KEY = 'user_settings';
function useUserSettings() {
    const [settings, setSettings, loading] = (0, useAsyncStorage_1.useAsyncStorage)(SETTINGS_KEY, DEFAULT_SETTINGS);
    const updateSettings = (newSettings) => __awaiter(this, void 0, void 0, function* () {
        const updatedSettings = Object.assign(Object.assign({}, settings), newSettings);
        yield setSettings(updatedSettings);
    });
    const updateLastUsedValues = (values) => __awaiter(this, void 0, void 0, function* () {
        const updatedSettings = Object.assign(Object.assign({}, settings), { lastUsedValues: Object.assign(Object.assign({}, settings.lastUsedValues), values) });
        yield setSettings(updatedSettings);
    });
    const resetSettings = () => __awaiter(this, void 0, void 0, function* () {
        yield setSettings(DEFAULT_SETTINGS);
    });
    return {
        settings,
        loading,
        updateSettings,
        updateLastUsedValues,
        resetSettings,
    };
}
