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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLanguage = exports.LanguageProvider = void 0;
const react_1 = __importStar(require("react"));
const translations_1 = require("./translations");
const LanguageContext = (0, react_1.createContext)({
    language: 'en',
    setLanguage: () => { },
    t: () => '',
});
const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = (0, react_1.useState)('en');
    const t = (key, params) => {
        const keys = key.split('.');
        let value = translations_1.translations[language];
        for (const k of keys) {
            value = value[k];
        }
        if (typeof value === 'string' && params) {
            return Object.entries(params).reduce((str, [key, val]) => {
                return str.replace(`{${key}}`, val.toString());
            }, value);
        }
        return value || key;
    };
    return (<LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>);
};
exports.LanguageProvider = LanguageProvider;
const useLanguage = () => (0, react_1.useContext)(LanguageContext);
exports.useLanguage = useLanguage;
