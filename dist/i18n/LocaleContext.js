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
exports.useLocale = exports.LocaleProvider = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const formatters_1 = require("./formatters");
const LocaleContext = (0, react_1.createContext)({
    locale: 'zh-CN',
    isRTL: false,
    config: formatters_1.localeConfigs['zh-CN'],
    setLocale: () => __awaiter(void 0, void 0, void 0, function* () { }),
});
const LocaleProvider = ({ children }) => {
    const [locale, setLocaleState] = (0, react_1.useState)('zh-CN');
    const config = formatters_1.localeConfigs[locale];
    const setLocale = (0, react_1.useCallback)((newLocale) => __awaiter(void 0, void 0, void 0, function* () {
        const newConfig = formatters_1.localeConfigs[newLocale];
        // 处理 RTL 切换
        if (react_native_1.I18nManager.isRTL !== newConfig.isRTL) {
            yield react_native_1.I18nManager.forceRTL(newConfig.isRTL);
            // 需要重启应用以应用 RTL 更改
        }
        setLocaleState(newLocale);
    }), []);
    return (<LocaleContext.Provider value={{
            locale,
            isRTL: config.isRTL,
            config,
            setLocale,
        }}>
      {children}
    </LocaleContext.Provider>);
};
exports.LocaleProvider = LocaleProvider;
const useLocale = () => (0, react_1.useContext)(LocaleContext);
exports.useLocale = useLocale;
