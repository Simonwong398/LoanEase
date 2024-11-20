import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { securityManager } from './securityManager';
import { auditManager } from './auditManager';
import * as CryptoJS from 'crypto-js';
import { AppError, ResourceError } from '../types/errors';
import { withErrorHandling } from '../utils/errorHandler';
import { resourceManager } from '../utils/resourceManager';
import { sanitizeData, generateHash } from '../utils/security/index';
import { ConcurrencyManager } from './concurrency';
import { withTimeout, withTimeoutSignal } from './timeout';
import { logger } from './logger';

// 定义自己的 ValidationError，而不是导入
class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// 加强类型定义
interface BackupMetadata {
  readonly id: string;
  readonly timestamp: number;
  readonly size: number;
  readonly checksum: string;
  readonly encrypted: boolean;
  readonly version: string;
  readonly type: 'full' | 'incremental';
}

interface BackupOptions {
  readonly type: BackupMetadata['type'];
  readonly encrypt?: boolean;
  readonly compress?: boolean;
}

type BackupResult = Readonly<{
  id: string;
  metadata: BackupMetadata;
  path: string;
}>;

// 定义 SecurityManager 接口
interface ISecurityManager {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
}

class BackupManager {
  private static instance: BackupManager | null = null;
  private backupPath: string;
  private metadata: Map<string, BackupMetadata>;
  private cleanupInterval: NodeJS.Timeout | null;
  private isDisposed: boolean;
  private activeOperations: Set<Promise<unknown>>;
  private readonly concurrencyManager: ConcurrencyManager;

  private static readonly OPERATION_TIMEOUT = 30000;
  private static readonly MAX_METADATA_SIZE = 1000;
  private static readonly MAX_BACKUP_FILES = 50;
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  private static readonly BACKUP_TIMEOUT = 30000; // 30 seconds
  private static readonly CLEANUP_TIMEOUT = 60000; // 60 seconds

  private constructor() {
    this.backupPath = `${RNFS.DocumentDirectoryPath}/backups`;
    this.metadata = new Map();
    this.cleanupInterval = null;
    this.isDisposed = false;
    this.activeOperations = new Set();
    this.concurrencyManager = new ConcurrencyManager(3);
    this.initialize();
  }

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
      
      // 添加进程退出时的清理
      process.on('beforeExit', async () => {
        if (BackupManager.instance) {
          await BackupManager.instance.dispose();
        }
      });
    }
    return BackupManager.instance;
  }

  private async initialize(): Promise<void> {
    await this.initializeBackupDirectory();
    this.startCleanupSchedule();
    
    // 注册资源清理
    resourceManager.registerCleanup(async () => {
      await this.dispose();
    });
  }

  private async initializeBackupDirectory(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.backupPath);
      if (!exists) {
        await RNFS.writeFile(this.backupPath, '', 'utf8');
      }
    } catch (error) {
      await auditManager.logEvent({
        type: 'backup',
        action: 'init_directory',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw new AppError(
        'Failed to initialize backup directory',
        'INIT_DIRECTORY_FAILED'
      );
    }
  }

  private async executeWithTimeout<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number = BackupManager.OPERATION_TIMEOUT
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await operation(controller.signal);
      clearTimeout(timeout);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('Operation timed out', 'TIMEOUT');
      }
      throw error;
    }
  }

  public async dispose(): Promise<void> {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;

    try {
      await Promise.all(Array.from(this.activeOperations));

      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      await this.saveMetadata(this.metadata);
      this.metadata.clear();
      this.activeOperations.clear();

      await auditManager.logEvent({
        type: 'backup',
        action: 'dispose',
        status: 'success',
        details: { timestamp: Date.now() }
      });
    } catch (error) {
      await auditManager.logEvent({
        type: 'backup',
        action: 'dispose',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw new ResourceError('Failed to cleanup backup manager', { cause: error });
    }
  }

  private async trackOperation<T>(operation: Promise<T>): Promise<T> {
    if (this.isDisposed) {
      throw new Error('BackupManager has been disposed');
    }

    this.activeOperations.add(operation);
    try {
      return await operation;
    } finally {
      this.activeOperations.delete(operation);
    }
  }

  public async createBackup(encrypt: boolean = true): Promise<string> {
    logger.info('BackupManager', 'Starting backup creation', { encrypt });

    return this.concurrencyManager.add(async () => {
      try {
        const result = await withTimeout(
          this._createBackup(encrypt),
          BackupManager.BACKUP_TIMEOUT,
          'Backup creation'
        );
        
        logger.info('BackupManager', 'Backup created successfully', {
          backupId: result
        });
        
        return result;
      } catch (error) {
        logger.error('BackupManager', 'Backup creation failed', 
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    });
  }

  private async _createBackup(encrypt: boolean): Promise<string> {
    return this.executeWithTimeout(async (signal) => {
      // 验证备份条件
      if (!this.isBackupAvailable()) {
        throw new AppError('Backup conditions not met', 'CONDITIONS_NOT_MET');
      }

      const data = await this.collectBackupData();
      const backupId = Date.now().toString();
      const fileName = `backup_${backupId}.json`;
      const filePath = `${this.backupPath}/${fileName}`;

      let fileContent = JSON.stringify(data);
      let checksum = await this.calculateChecksum(fileContent);
      
      if (encrypt) {
        // 使用双重类型断言
        const secureManager = (securityManager as unknown) as ISecurityManager;
        fileContent = await this.executeWithTimeout(
          async () => await secureManager.encrypt(fileContent),
          5000 // 加密操作使用较短的超时时间
        );
      }

      await RNFS.writeFile(filePath, fileContent, 'utf8');

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: Date.now(),
        size: fileContent.length,
        checksum,
        encrypted: encrypt,
        version: '1.0',
        type: 'full',
      };
      
      this.metadata.set(backupId, metadata);
      await this.saveMetadata(this.metadata);

      await auditManager.logEvent({
        type: 'backup',
        action: 'create',
        status: 'success',
        details: { backupId, encrypted: encrypt },
      });

      return backupId;
    });
  }

  private async checkSystemStatus(): Promise<void> {
    try {
      const stats = await RNFS.stat(RNFS.DocumentDirectoryPath);
      const freeSpace = stats.size || 0;

      if (freeSpace < 1024 * 1024 * 100) {
        throw new AppError('Insufficient storage space', 'NO_SPACE');
      }
    } catch (error) {
      await auditManager.logEvent({
        type: 'backup',
        action: 'check_system',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = Array.from(this.metadata.entries())
        .sort(([, a], [, b]) => b.timestamp - a.timestamp);
      
      // 保留最新的 5 个备份
      const toDelete = backups.slice(5);
      
      for (const [id, backup] of toDelete) {
        const filePath = `${this.backupPath}/backup_${id}.json`;
        await RNFS.unlink(filePath);
        this.metadata.delete(id);
      }
      
      await this.saveMetadata(this.metadata);
    } catch (error) {
      await auditManager.logEvent({
        type: 'backup',
        action: 'cleanup',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  private async saveMetadata(metadata: BackupMetadata | Map<string, BackupMetadata>): Promise<void> {
    return withErrorHandling(async () => {
      // 验证和清理数
      const sanitizedData = metadata instanceof Map ?
        new Map(Array.from(metadata.entries()).map(([key, value]) => [
          sanitizeData(key),
          this.sanitizeMetadata(value)
        ])) :
        this.sanitizeMetadata(metadata);

      // 加密数据
      const dataToEncrypt = sanitizedData instanceof Map ? 
        Array.from(sanitizedData.entries()) : 
        [[sanitizedData.id, sanitizedData]];

      const secureManager = (securityManager as unknown) as ISecurityManager;
      const encryptedData = await secureManager.encrypt(JSON.stringify(dataToEncrypt));

      // 安全存储
      await AsyncStorage.setItem('@backup_metadata_encrypted', encryptedData);
    }, { context: 'BackupManager', operation: 'saveMetadata' });
  }

  private sanitizeMetadata(metadata: BackupMetadata): BackupMetadata {
    return {
      id: sanitizeData(metadata.id),
      timestamp: Number(metadata.timestamp),
      size: Number(metadata.size),
      checksum: sanitizeData(metadata.checksum),
      encrypted: Boolean(metadata.encrypted),
      version: sanitizeData(metadata.version || '1.0'),
      type: metadata.type || 'full'
    };
  }

  private validateMetadata(metadata: unknown): asserts metadata is BackupMetadata {
    if (!metadata || typeof metadata !== 'object') {
      throw new ValidationError('Invalid metadata format');
    }

    const md = metadata as Record<string, unknown>;
    
    if (typeof md.id !== 'string' || 
        typeof md.timestamp !== 'number' ||
        typeof md.size !== 'number' ||
        typeof md.checksum !== 'string' ||
        typeof md.encrypted !== 'boolean') {
      throw new ValidationError('Invalid field types in metadata');
    }
  }

  private async loadMetadata(): Promise<void> {
    try {
      const encryptedData = await AsyncStorage.getItem('@backup_metadata_encrypted');
      if (encryptedData) {
        const secureManager = (securityManager as unknown) as ISecurityManager;
        const decryptedData = await this.executeWithTimeout(
          async () => await secureManager.decrypt(encryptedData),
          5000
        );
        
        this.metadata = new Map(JSON.parse(decryptedData));
      }
    } catch (error) {
      await auditManager.logEvent({
        type: 'backup',
        action: 'load_metadata',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  private calculateChecksum(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  private isBackupAvailable(): boolean {
    return true;
  }

  private async collectBackupData(): Promise<unknown> {
    return {};
  }

  private async cleanMetadataCache(): Promise<void> {
    if (this.metadata.size <= BackupManager.MAX_METADATA_SIZE) return;

    const sortedEntries = Array.from(this.metadata.entries())
      .sort(([, a], [, b]) => b.timestamp - a.timestamp);
    
    // 使用批处理删除过期数据
    const entriesToDelete = sortedEntries.slice(BackupManager.MAX_METADATA_SIZE);
    await this.processBatch(entriesToDelete, async ([key]) => {
      this.metadata.delete(key);
    });

    await this.saveMetadata(this.metadata);
  }

  private async cleanBackupFiles(): Promise<void> {
    logger.debug('BackupManager', 'Starting backup cleanup');

    return withTimeoutSignal(async (signal) => {
      try {
        const files = await RNFS.readDir(this.backupPath);
        if (files.length > BackupManager.MAX_BACKUP_FILES) {
          const sortedFiles = files.sort((a, b) => {
            const timeA = new Date(a.mtime).getTime();
            const timeB = new Date(b.mtime).getTime();
            return timeB - timeA;
          });
          
          const filesToDelete = sortedFiles.slice(BackupManager.MAX_BACKUP_FILES);
          await this.concurrencyManager.processBatch(
            filesToDelete,
            async (file) => {
              if (signal.aborted) {
                throw new Error('Cleanup operation aborted');
              }
              await RNFS.unlink(file.path);
            },
            5
          );
        }
        
        logger.info('BackupManager', 'Backup cleanup completed');
      } catch (error) {
        logger.error('BackupManager', 'Backup cleanup failed', 
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      }
    }, BackupManager.CLEANUP_TIMEOUT, 'Backup cleanup');
  }

  private startCleanupSchedule(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanMetadataCache();
    }, BackupManager.CLEANUP_INTERVAL);
  }

  // 添加批处理支持
  private async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(processor));
    }
  }

  // 添加缓存支持
  private cache = new Map<string, { data: any; timestamp: number }>();

  private async getCachedData<T>(
    key: string,
    generator: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < BackupManager.CACHE_TTL) {
      return cached.data as T;
    }

    const data = await generator();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}

export const backupManager = BackupManager.getInstance(); 