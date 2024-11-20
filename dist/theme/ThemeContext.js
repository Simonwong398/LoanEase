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
exports.useTheme = exports.ThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const themeManager_1 = require("./themeManager");
const defaultTheme_1 = require("./defaultTheme");
const ThemeContext = (0, react_1.createContext)(defaultTheme_1.DefaultTheme);
const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = (0, react_1.useState)(defaultTheme_1.DefaultTheme);
    (0, react_1.useEffect)(() => {
        return themeManager_1.themeManager.subscribe(setTheme);
    }, []);
    return (<ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>);
};
exports.ThemeProvider = ThemeProvider;
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
