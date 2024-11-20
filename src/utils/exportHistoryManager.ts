import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { ExportHistory } from '../types/export';

class ExportHistoryManager {
  private static instance: ExportHistoryManager;
  private readonly HISTORY_KEY = '@export_history';
  private history: ExportHistory[] = [];
  private readonly MAX_HISTORY_ITEMS = 100;

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): ExportHistoryManager {
    if (!ExportHistoryManager.instance) {
      ExportHistoryManager.instance = new ExportHistoryManager();
    }
    return ExportHistoryManager.instance;
  }

  private async loadHistory() {
    try {
      const data = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (data) {
        this.history = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  }

  private async saveHistory() {
    try {
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save export history:', error);
    }
  }

  async addHistoryItem(item: ExportHistory) {
    this.history.unshift(item);
    if (this.history.length > this.MAX_HISTORY_ITEMS) {
      // 删除旧的导出记录和相关文件
      const removedItems = this.history.splice(this.MAX_HISTORY_ITEMS);
      this.cleanupFiles(removedItems);
    }
    await this.saveHistory();
  }

  async cleanupFiles(items: ExportHistory[]) {
    for (const item of items) {
      if (item.filePath) {
        try {
          await RNFS.unlink(item.filePath);
        } catch (error) {
          console.error('Failed to delete export file:', error);
        }
      }
    }
  }

  getHistory(limit?: number): ExportHistory[] {
    return limit ? this.history.slice(0, limit) : this.history;
  }

  async clearHistory() {
    await this.cleanupFiles(this.history);
    this.history = [];
    await this.saveHistory();
  }

  async deleteHistoryItem(id: string) {
    const item = this.history.find(h => h.id === id);
    if (item?.filePath) {
      try {
        await RNFS.unlink(item.filePath);
      } catch (error) {
        console.error('Failed to delete export file:', error);
      }
    }
    this.history = this.history.filter(h => h.id !== id);
    await this.saveHistory();
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stat = await RNFS.stat(filePath);
      return stat.size;
    } catch (error) {
      console.error('Failed to get file size:', error);
      return 0;
    }
  }
}

export const exportHistoryManager = ExportHistoryManager.getInstance(); 