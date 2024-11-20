import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Shortcut {
  id: string;
  name: string;
  type: 'calculation' | 'navigation' | 'action';
  params: Record<string, any>;
  icon?: string;
  order: number;
}

class ShortcutManager {
  private static instance: ShortcutManager;
  private shortcuts: Shortcut[] = [];
  private subscribers: Set<(shortcuts: Shortcut[]) => void> = new Set();

  private constructor() {
    this.loadShortcuts();
  }

  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  private async loadShortcuts(): Promise<void> {
    try {
      const savedShortcuts = await AsyncStorage.getItem('@shortcuts');
      if (savedShortcuts) {
        this.shortcuts = JSON.parse(savedShortcuts);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
    }
  }

  private async saveShortcuts(): Promise<void> {
    try {
      await AsyncStorage.setItem('@shortcuts', JSON.stringify(this.shortcuts));
    } catch (error) {
      console.error('Failed to save shortcuts:', error);
    }
  }

  subscribe(callback: (shortcuts: Shortcut[]) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.shortcuts));
  }

  async addShortcut(shortcut: Omit<Shortcut, 'id' | 'order'>): Promise<void> {
    const newShortcut: Shortcut = {
      ...shortcut,
      id: Date.now().toString(),
      order: this.shortcuts.length,
    };
    this.shortcuts.push(newShortcut);
    await this.saveShortcuts();
    this.notifySubscribers();
  }

  async removeShortcut(id: string): Promise<void> {
    this.shortcuts = this.shortcuts.filter(s => s.id !== id);
    await this.saveShortcuts();
    this.notifySubscribers();
  }

  async reorderShortcuts(orderedIds: string[]): Promise<void> {
    this.shortcuts = orderedIds
      .map((id, index) => {
        const shortcut = this.shortcuts.find(s => s.id === id);
        return shortcut ? { ...shortcut, order: index } : null;
      })
      .filter((s): s is Shortcut => s !== null);
    await this.saveShortcuts();
    this.notifySubscribers();
  }

  getShortcuts(): Shortcut[] {
    return [...this.shortcuts].sort((a, b) => a.order - b.order);
  }
}

export const shortcutManager = ShortcutManager.getInstance(); 