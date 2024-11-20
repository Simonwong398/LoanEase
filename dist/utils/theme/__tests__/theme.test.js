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
const index_1 = require("../index");
describe('ThemeManager', () => {
    it('should initialize with light theme', () => {
        const theme = index_1.themeManager.getCurrentTheme();
        expect(theme.name).toBe('light');
        expect(theme.isDark).toBe(false);
    });
    it('should switch to dark theme', () => __awaiter(void 0, void 0, void 0, function* () {
        yield index_1.themeManager.setTheme('dark');
        const theme = index_1.themeManager.getCurrentTheme();
        expect(theme.name).toBe('dark');
        expect(theme.isDark).toBe(true);
    }));
    it('should handle custom themes', () => __awaiter(void 0, void 0, void 0, function* () {
        const customTheme = {
            name: 'custom',
            colors: index_1.themeManager.getCurrentTheme().colors,
            spacing: index_1.themeManager.getCurrentTheme().spacing,
            borderRadius: index_1.themeManager.getCurrentTheme().borderRadius,
            typography: index_1.themeManager.getCurrentTheme().typography,
            isDark: false,
        };
        yield index_1.themeManager.addCustomTheme(customTheme);
        const themes = index_1.themeManager.getCustomThemes();
        expect(themes).toContainEqual(customTheme);
    }));
});
