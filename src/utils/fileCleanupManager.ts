import RNFS from 'react-native-fs';
import { ExportHistory } from '../types/export';

interface CleanupConfig {
  maxFileAge: number;        // 文件最大保存时间(毫秒)
  maxStorageSize: number;    // 最大存储空间(字节)
  minKeepFiles: number;      // 最少保留文件数
  cleanupInterval: number;   // 清理间隔(毫秒)
}

interface StorageStats {
  totalSize: number;
  fileCount: number;
  oldestFile: Date | null;
  usagePercentage: number;
  lastCleanup: Date | null;
}

class FileCleanupManager {
  private static instance: FileCleanupManager;
  private readonly config: CleanupConfig = {
    maxFileAge: 7 * 24 * 60 * 60 * 1000, // 7天
    maxStorageSize: 100 * 1024 * 1024,    // 100MB
    minKeepFiles: 10,
    cleanupInterval: 24 * 60 * 60 * 1000, // 24小时
  };

  private lastCleanupTime: number = 0;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoCleanup();
  }

  static getInstance(): FileCleanupManager {
    if (!FileCleanupManager.instance) {
      FileCleanupManager.instance = new FileCleanupManager();
    }
    return FileCleanupManager.instance;
  }

  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(
      () => this.performAutoCleanup(),
      this.config.cleanupInterval
    );
  }

  private async performAutoCleanup(): Promise<void> {
    const stats = await this.getStorageStats();
    if (stats.usagePercentage > 80) { // 当存储使用率超过80%时自动清理
      await this.cleanupFiles([]);
    }
  }

  async cleanupFiles(history: ExportHistory[]): Promise<void> {
    try {
      const exportDir = `${RNFS.DocumentDirectoryPath}/exports`;
      const files = await RNFS.readDir(exportDir);
      
      // 按修改时间排序
      const sortedFiles = files.sort(
        (a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime()
      );

      // 保留最新的文件
      const filesToKeep = new Set(
        history
          .slice(-this.config.minKeepFiles)
          .map(item => item.filePath)
      );

      const now = Date.now();
      for (const file of sortedFiles) {
        if (filesToKeep.has(file.path)) continue;

        const fileAge = now - new Date(file.mtime).getTime();
        if (fileAge > this.config.maxFileAge) {
          await RNFS.unlink(file.path);
        }
      }

      this.lastCleanupTime = now;
    } catch (error) {
      console.error('File cleanup failed:', error);
    }
  }

  async getStorageStats(): Promise<StorageStats> {
    try {
      const exportDir = `${RNFS.DocumentDirectoryPath}/exports`;
      const files = await RNFS.readDir(exportDir);
      
      let totalSize = 0;
      let oldestDate: Date | null = null;

      for (const file of files) {
        totalSize += file.size;
        const fileDate = new Date(file.mtime);
        if (!oldestDate || fileDate < oldestDate) {
          oldestDate = fileDate;
        }
      }

      return {
        totalSize,
        fileCount: files.length,
        oldestFile: oldestDate,
        usagePercentage: (totalSize / this.config.maxStorageSize) * 100,
        lastCleanup: this.lastCleanupTime ? new Date(this.lastCleanupTime) : null,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        oldestFile: null,
        usagePercentage: 0,
        lastCleanup: null,
      };
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

export const fileCleanupManager = FileCleanupManager.getInstance(); 