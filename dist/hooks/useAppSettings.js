"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAppSettings = void 0;
const react_1 = require("react");
const settings_1 = require("../types/settings");
const settingsManager_1 = require("../utils/settingsManager");
const useAppSettings = () => {
    const [settings, setSettings] = (0, react_1.useState)(settings_1.DEFAULT_SETTINGS);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const unsubscribe = settingsManager_1.settingsManager.subscribe((newSettings) => {
            setSettings(newSettings);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    return {
        settings,
        loading,
    };
};
exports.useAppSettings = useAppSettings;
