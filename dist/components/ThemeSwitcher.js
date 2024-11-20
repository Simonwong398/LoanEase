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
const ThemeContext_1 = require("../theme/ThemeContext");
const themeManager_1 = require("../theme/themeManager");
const colorSchemes = [
    {
        name: 'Default',
        colors: {
            primary: '#1976D2',
            secondary: '#424242',
        },
    },
    {
        name: 'Dark',
        colors: {
            primary: '#90CAF9',
            secondary: '#B0BEC5',
            background: '#121212',
            surface: '#1E1E1E',
            text: {
                primary: '#FFFFFF',
                secondary: '#B0BEC5',
                hint: '#78909C',
            },
        },
    },
    {
        name: 'Nature',
        colors: {
            primary: '#4CAF50',
            secondary: '#81C784',
        },
    },
];
const ThemeSwitcher = () => {
    const theme = (0, ThemeContext_1.useTheme)();
    const handleSchemePress = (scheme) => __awaiter(void 0, void 0, void 0, function* () {
        yield themeManager_1.themeManager.setThemeColors(scheme.colors);
    });
    return (<react_native_1.View style={styles.container}>
      {colorSchemes.map((scheme) => (<react_native_1.TouchableOpacity key={scheme.name} style={[
                styles.schemeButton,
                { backgroundColor: scheme.colors.primary },
            ]} onPress={() => handleSchemePress(scheme)}>
          <react_native_1.Text style={styles.schemeName}>{scheme.name}</react_native_1.Text>
        </react_native_1.TouchableOpacity>))}
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 16,
    },
    schemeButton: {
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    schemeName: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
exports.default = ThemeSwitcher;
