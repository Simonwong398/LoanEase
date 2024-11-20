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
exports.themeManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const defaultTheme_1 = require("./defaultTheme");
class ThemeManager {
    constructor() {
        this.currentTheme = defaultTheme_1.DefaultTheme;
        this.subscribers = new Set();
        this.loadTheme();
    }
    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
    loadTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedTheme = yield async_storage_1.default.getItem('@theme');
                if (savedTheme) {
                    this.currentTheme = Object.assign(Object.assign({}, defaultTheme_1.DefaultTheme), JSON.parse(savedTheme));
                    this.notifySubscribers();
                }
            }
            catch (error) {
                console.error('Failed to load theme:', error);
            }
        });
    }
    saveTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem('@theme', JSON.stringify(this.currentTheme));
            }
            catch (error) {
                console.error('Failed to save theme:', error);
            }
        });
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.currentTheme);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentTheme));
    }
    updateTheme(updates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentTheme = Object.assign(Object.assign(Object.assign({}, this.currentTheme), updates), { colors: Object.assign(Object.assign({}, this.currentTheme.colors), (updates.colors || {})) });
            yield this.saveTheme();
            this.notifySubscribers();
        });
    }
    setThemeColors(colors) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateTheme({
                colors: Object.assign(Object.assign({}, this.currentTheme.colors), colors),
            });
        });
    }
    setSpacing(spacing) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateTheme({
                spacing: Object.assign(Object.assign({}, this.currentTheme.spacing), spacing),
            });
        });
    }
    setBorderRadius(borderRadius) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateTheme({
                borderRadius: Object.assign(Object.assign({}, this.currentTheme.borderRadius), borderRadius),
            });
        });
    }
    getTheme() {
        return this.currentTheme;
    }
    resetTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentTheme = defaultTheme_1.DefaultTheme;
            yield this.saveTheme();
            this.notifySubscribers();
        });
    }
}
exports.themeManager = ThemeManager.getInstance();
