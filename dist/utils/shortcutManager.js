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
exports.shortcutManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class ShortcutManager {
    constructor() {
        this.shortcuts = [];
        this.subscribers = new Set();
        this.loadShortcuts();
    }
    static getInstance() {
        if (!ShortcutManager.instance) {
            ShortcutManager.instance = new ShortcutManager();
        }
        return ShortcutManager.instance;
    }
    loadShortcuts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedShortcuts = yield async_storage_1.default.getItem('@shortcuts');
                if (savedShortcuts) {
                    this.shortcuts = JSON.parse(savedShortcuts);
                    this.notifySubscribers();
                }
            }
            catch (error) {
                console.error('Failed to load shortcuts:', error);
            }
        });
    }
    saveShortcuts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem('@shortcuts', JSON.stringify(this.shortcuts));
            }
            catch (error) {
                console.error('Failed to save shortcuts:', error);
            }
        });
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.shortcuts));
    }
    addShortcut(shortcut) {
        return __awaiter(this, void 0, void 0, function* () {
            const newShortcut = Object.assign(Object.assign({}, shortcut), { id: Date.now().toString(), order: this.shortcuts.length });
            this.shortcuts.push(newShortcut);
            yield this.saveShortcuts();
            this.notifySubscribers();
        });
    }
    removeShortcut(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.shortcuts = this.shortcuts.filter(s => s.id !== id);
            yield this.saveShortcuts();
            this.notifySubscribers();
        });
    }
    reorderShortcuts(orderedIds) {
        return __awaiter(this, void 0, void 0, function* () {
            this.shortcuts = orderedIds
                .map((id, index) => {
                const shortcut = this.shortcuts.find(s => s.id === id);
                return shortcut ? Object.assign(Object.assign({}, shortcut), { order: index }) : null;
            })
                .filter((s) => s !== null);
            yield this.saveShortcuts();
            this.notifySubscribers();
        });
    }
    getShortcuts() {
        return [...this.shortcuts].sort((a, b) => a.order - b.order);
    }
}
exports.shortcutManager = ShortcutManager.getInstance();
