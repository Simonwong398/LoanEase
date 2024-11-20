import { Platform, Dimensions, ScaledSize } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auditManager } from './auditManager';

interface PlatformConfig {
  platform: 'mobile' | 'tablet' | 'desktop' | 'web';
  orientation: 'portrait' | 'landscape';
  screenSize: ScaledSize;
  density: number;
  isOnline: boolean;
  lastSync: number;
}

interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // 毫秒
  conflictResolution: 'local' | 'remote' | 'manual';
  maxRetries: number;
}

class PlatformManager {
  private static instance: PlatformManager;
  private config: PlatformConfig;
  private syncConfig: SyncConfig = {
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5分钟
    conflictResolution: 'manual',
    maxRetries: 3,
  };

  private constructor() {
    this.config = {
      platform: this.detectPlatform(),
      orientation: this.getOrientation(),
      screenSize: Dimensions.get('window'),
      density: Dimensions.get('window').scale,
      isOnline: true,
      lastSync: 0,
    };

    this.initialize();
  }

  static getInstance(): PlatformManager {
    if (!PlatformManager.instance) {
      PlatformManager.instance = new PlatformManager();
    }
    return PlatformManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // 监听屏幕变化
      Dimensions.addEventListener('change', this.handleDimensionsChange);

      // 监听网络状态
      this.setupNetworkMonitoring();

      // 加载同步配置
      await this.loadSyncConfig();

      // 启动自动同步
      if (this.syncConfig.autoSync) {
        this.startAutoSync();
      }

      await auditManager.logEvent({
        type: 'platform',
        action: 'initialize',
        status: 'success',
        details: { config: this.config },
      });
    } catch (error) {
      console.error('Platform manager initialization failed:', error);
      await auditManager.logEvent({
        type: 'platform',
        action: 'initialize',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private detectPlatform(): PlatformConfig['platform'] {
    if (Platform.OS === 'web') {
      return 'web';
    }

    const { width, height } = Dimensions.get('window');
    const screenSize = Math.sqrt(width * width + height * height);

    if (screenSize >= 1100) { // 对角线像素数
      return 'desktop';
    } else if (screenSize >= 700) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  }

  private getOrientation(): PlatformConfig['orientation'] {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'landscape' : 'portrait';
  }

  private handleDimensionsChange = ({ window }: { window: ScaledSize }): void => {
    this.config = {
      ...this.config,
      orientation: window.width > window.height ? 'landscape' : 'portrait',
      screenSize: window,
    };
  };

  private setupNetworkMonitoring(): void {
    // 实现网络状态监听
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.config.isOnline = true;
        this.handleNetworkChange(true);
      });
      window.addEventListener('offline', () => {
        this.config.isOnline = false;
        this.handleNetworkChange(false);
      });
    }
  }

  private async handleNetworkChange(isOnline: boolean): Promise<void> {
    if (isOnline && this.syncConfig.autoSync) {
      await this.syncData();
    }
  }

  private async loadSyncConfig(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('@platform_sync_config');
      if (savedConfig) {
        this.syncConfig = { ...this.syncConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load sync config:', error);
    }
  }

  private startAutoSync(): void {
    setInterval(async () => {
      if (this.config.isOnline) {
        await this.syncData();
      }
    }, this.syncConfig.syncInterval);
  }

  async syncData(): Promise<void> {
    if (!this.config.isOnline) return;

    try {
      // 获取上次同步后的变更
      const changes = await this.getChanges(this.config.lastSync);
      
      if (changes.length === 0) return;

      // 处理冲突
      const resolvedChanges = await this.resolveConflicts(changes);
      
      // 应用变更
      await this.applyChanges(resolvedChanges);
      
      this.config.lastSync = Date.now();

      await auditManager.logEvent({
        type: 'platform',
        action: 'sync',
        status: 'success',
        details: { changesCount: changes.length },
      });
    } catch (error) {
      await auditManager.logEvent({
        type: 'platform',
        action: 'sync',
        status: 'failure',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async getChanges(since: number): Promise<any[]> {
    // 实现获取变更的逻辑
    return [];
  }

  private async resolveConflicts(changes: any[]): Promise<any[]> {
    // 实现冲突解决逻辑
    return changes;
  }

  private async applyChanges(changes: any[]): Promise<void> {
    // 实现应用变更的逻辑
  }

  // 公共 API
  getPlatformInfo(): PlatformConfig {
    return { ...this.config };
  }

  isTablet(): boolean {
    return this.config.platform === 'tablet';
  }

  isDesktop(): boolean {
    return this.config.platform === 'desktop';
  }

  isWeb(): boolean {
    return this.config.platform === 'web';
  }

  isOnline(): boolean {
    return this.config.isOnline;
  }

  updateSyncConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };
    AsyncStorage.setItem('@platform_sync_config', JSON.stringify(this.syncConfig));
  }

  getResponsiveValue<T>(values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    web?: T;
    default: T;
  }): T {
    return values[this.config.platform] || values.default;
  }
}

export const platformManager = PlatformManager.getInstance(); 