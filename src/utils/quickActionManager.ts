type ActionHandler = () => void;

interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  handler: ActionHandler;
  category?: string;
  order?: number;
}

class QuickActionManager {
  private static instance: QuickActionManager;
  private actions: Map<string, QuickAction> = new Map();
  private shortcuts: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): QuickActionManager {
    if (!QuickActionManager.instance) {
      QuickActionManager.instance = new QuickActionManager();
    }
    return QuickActionManager.instance;
  }

  registerAction(action: QuickAction): void {
    this.actions.set(action.id, action);
    if (action.shortcut) {
      this.shortcuts.set(action.shortcut, action.id);
    }
  }

  unregisterAction(actionId: string): void {
    const action = this.actions.get(actionId);
    if (action?.shortcut) {
      this.shortcuts.delete(action.shortcut);
    }
    this.actions.delete(actionId);
  }

  executeAction(actionId: string): void {
    const action = this.actions.get(actionId);
    if (action) {
      action.handler();
    }
  }

  executeShortcut(shortcut: string): boolean {
    const actionId = this.shortcuts.get(shortcut);
    if (actionId) {
      this.executeAction(actionId);
      return true;
    }
    return false;
  }

  getActions(category?: string): QuickAction[] {
    const actions = Array.from(this.actions.values());
    if (category) {
      return actions.filter(action => action.category === category);
    }
    return actions;
  }

  getShortcuts(): Map<string, string> {
    return new Map(this.shortcuts);
  }
}

export const quickActionManager = QuickActionManager.getInstance(); 