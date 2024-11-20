import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExportFormat } from './exportResults';

interface ExportState {
  id: string;
  format: ExportFormat;
  data: any;
  progress: number;
  currentStage: string;
  timestamp: number;
}

class ExportRecoveryManager {
  private static instance: ExportRecoveryManager;
  private readonly STORAGE_KEY = 'export_recovery_state';
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // 1秒

  private constructor() {}

  static getInstance(): ExportRecoveryManager {
    if (!ExportRecoveryManager.instance) {
      ExportRecoveryManager.instance = new ExportRecoveryManager();
    }
    return ExportRecoveryManager.instance;
  }

  async saveState(state: ExportState): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save export state:', error);
    }
  }

  async getState(): Promise<ExportState | null> {
    try {
      const state = await AsyncStorage.getItem(this.STORAGE_KEY);
      return state ? JSON.parse(state) : null;
    } catch (error) {
      console.error('Failed to get export state:', error);
      return null;
    }
  }

  async clearState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear export state:', error);
    }
  }

  async retryExport(
    exportFn: (data: any, format: ExportFormat) => Promise<void>,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const state = await this.getState();
    if (!state) return false;

    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        await exportFn(state.data, state.format);
        await this.clearState();
        return true;
      } catch (error) {
        if (attempt === this.MAX_RETRY_ATTEMPTS) {
          console.error('Max retry attempts reached:', error);
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
      }
    }

    return false;
  }

  isRecoveryAvailable(): Promise<boolean> {
    return this.getState().then(state => !!state);
  }
}

export const exportRecoveryManager = ExportRecoveryManager.getInstance(); 