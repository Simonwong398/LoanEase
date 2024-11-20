"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThemeMode = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const useThemeMode = () => {
    const systemColorScheme = (0, react_native_1.useColorScheme)();
    const [themeMode, setThemeMode] = (0, react_1.useState)(systemColorScheme || 'light');
    (0, react_1.useEffect)(() => {
        if (systemColorScheme) {
            setThemeMode(systemColorScheme);
        }
    }, [systemColorScheme]);
    return [themeMode, setThemeMode];
};
exports.useThemeMode = useThemeMode;
