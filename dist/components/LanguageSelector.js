"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_picker_select_1 = __importDefault(require("react-native-picker-select"));
const LanguageContext_1 = require("../i18n/LanguageContext");
const LanguageSelector = () => {
    const { language, setLanguage } = (0, LanguageContext_1.useLanguage)();
    const languages = [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: '中文', value: 'zh' },
    ];
    return (<react_native_1.View style={styles.container}>
      <react_native_picker_select_1.default value={language} onValueChange={(value) => setLanguage(value)} items={languages} style={pickerSelectStyles}/>
    </react_native_1.View>);
};
const styles = react_native_1.StyleSheet.create({
    container: {
        padding: 8,
    },
});
const pickerSelectStyles = react_native_1.StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        color: 'black',
    },
});
exports.default = LanguageSelector;
