"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickActionManager = void 0;
class QuickActionManager {
    constructor() {
        this.actions = new Map();
        this.shortcuts = new Map();
    }
    static getInstance() {
        if (!QuickActionManager.instance) {
            QuickActionManager.instance = new QuickActionManager();
        }
        return QuickActionManager.instance;
    }
    registerAction(action) {
        this.actions.set(action.id, action);
        if (action.shortcut) {
            this.shortcuts.set(action.shortcut, action.id);
        }
    }
    unregisterAction(actionId) {
        const action = this.actions.get(actionId);
        if (action === null || action === void 0 ? void 0 : action.shortcut) {
            this.shortcuts.delete(action.shortcut);
        }
        this.actions.delete(actionId);
    }
    executeAction(actionId) {
        const action = this.actions.get(actionId);
        if (action) {
            action.handler();
        }
    }
    executeShortcut(shortcut) {
        const actionId = this.shortcuts.get(shortcut);
        if (actionId) {
            this.executeAction(actionId);
            return true;
        }
        return false;
    }
    getActions(category) {
        const actions = Array.from(this.actions.values());
        if (category) {
            return actions.filter(action => action.category === category);
        }
        return actions;
    }
    getShortcuts() {
        return new Map(this.shortcuts);
    }
}
exports.quickActionManager = QuickActionManager.getInstance();
