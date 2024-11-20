import { settingsManager } from './settingsManager';
import { UserSettings } from '../types/settings';
import { errorManager } from './errorManager';

interface SyncResult {
  success: boolean;
  timestamp: number;
  error?: string;
  changes?: {
    added: number;
    updated: number;
    deleted: number;
  };
}

interface SyncConflict {
  key: string;
  local: any;
  remote: any;
  resolved?: any;
}

class SettingsSyncManager {
  private static instance: SettingsSyncManager;
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTimestamp: number = 0;
  private conflicts: SyncConflict[] = [];
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {
    this.startAutoSync();
  }

  static getInstance(): SettingsSyncManager {
    if (!SettingsSyncManager.instance) {
      SettingsSyncManager.instance = new SettingsSyncManager();
    }
    return SettingsSyncManager.instance;
  }

  private startAutoSync(): void {
    const settings = settingsManager.getSettings();
    if (settings.sync.syncEnabled) {
      this.syncTimer = setInterval(
        () => this.syncSettings(),
        settings.sync.syncInterval
      );
    }
  }

  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  async syncSettings(): Promise<SyncResult> {
    const settings = settingsManager.getSettings();
    if (!settings.sync.syncEnabled) {
      return {
        success: false,
        timestamp: Date.now(),
        error: 'Sync is disabled',
      };
    }

    try {
      // 检查是否需要同步
      if (!this.shouldSync(settings)) {
        return {
          success: true,
          timestamp: Date.now(),
          changes: { added: 0, updated: 0, deleted: 0 },
        };
      }

      // 获取远程设置
      const remoteSettings = await this.fetchRemoteSettings();
      
      // 解决冲突
      const resolvedSettings = await this.resolveConflicts(settings, remoteSettings);
      
      // 保存合并后的设置
      await this.saveResolvedSettings(resolvedSettings);

      this.lastSyncTimestamp = Date.now();
      this.retryCount = 0;

      return {
        success: true,
        timestamp: this.lastSyncTimestamp,
        changes: this.calculateChanges(settings, resolvedSettings),
      };
    } catch (error) {
      console.error('Settings sync failed:', error);
      
      // 重试逻辑
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(resolve => 
          setTimeout(resolve, this.RETRY_DELAY * this.retryCount)
        );
        return this.syncSettings();
      }

      errorManager.handleError(error);
      return {
        success: false,
        timestamp: Date.now(),
        error: error.message,
      };
    }
  }

  private shouldSync(settings: UserSettings): boolean {
    // 检查是否有足够的更改需要同步
    const timeSinceLastSync = Date.now() - this.lastSyncTimestamp;
    const hasEnoughChanges = settings.lastModified > this.lastSyncTimestamp;
    return timeSinceLastSync >= settings.sync.syncInterval || hasEnoughChanges;
  }

  private async fetchRemoteSettings(): Promise<UserSettings> {
    // 实现远程设置获取逻辑
    return {} as UserSettings;
  }

  private async resolveConflicts(
    local: UserSettings,
    remote: UserSettings
  ): Promise<UserSettings> {
    const resolved = { ...local };
    this.conflicts = [];

    // 检查每个设置项是否有冲突
    Object.entries(remote).forEach(([key, value]) => {
      if (JSON.stringify(local[key]) !== JSON.stringify(value)) {
        this.conflicts.push({
          key,
          local: local[key],
          remote: value,
        });
      }
    });

    // 解决冲突
    if (this.conflicts.length > 0) {
      for (const conflict of this.conflicts) {
        conflict.resolved = await this.resolveConflict(
          conflict.key,
          conflict.local,
          conflict.remote
        );
        resolved[conflict.key] = conflict.resolved;
      }
    }

    return resolved;
  }

  private async resolveConflict(
    key: string,
    local: any,
    remote: any
  ): Promise<any> {
    // 实现冲突解决策略
    // 这里使用简单的策略：保留最新的修改
    const localTime = local.lastModified || 0;
    const remoteTime = remote.lastModified || 0;
    return localTime > remoteTime ? local : remote;
  }

  private async saveResolvedSettings(settings: UserSettings): Promise<void> {
    await settingsManager.importSettings(JSON.stringify(settings));
  }

  private calculateChanges(
    oldSettings: UserSettings,
    newSettings: UserSettings
  ): { added: number; updated: number; deleted: number } {
    // 实现变更计算逻辑
    return {
      added: 0,
      updated: 0,
      deleted: 0,
    };
  }

  async enableSync(): Promise<void> {
    await settingsManager.updateSyncConfig({
      syncEnabled: true,
    });
    this.startAutoSync();
  }

  async disableSync(): Promise<void> {
    await settingsManager.updateSyncConfig({
      syncEnabled: false,
    });
    this.stopAutoSync();
  }

  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  destroy(): void {
    this.stopAutoSync();
  }
}

export const settingsSyncManager = SettingsSyncManager.getInstance(); 