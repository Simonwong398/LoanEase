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
exports.platformManager = void 0;
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
class PlatformManager {
    constructor() {
        this.syncConfig = {
            autoSync: true,
            syncInterval: 5 * 60 * 1000, // 5分钟
            conflictResolution: 'manual',
            maxRetries: 3,
        };
        this.handleDimensionsChange = ({ window }) => {
            this.config = Object.assign(Object.assign({}, this.config), { orientation: window.width > window.height ? 'landscape' : 'portrait', screenSize: window });
        };
        this.config = {
            platform: this.detectPlatform(),
            orientation: this.getOrientation(),
            screenSize: react_native_1.Dimensions.get('window'),
            density: react_native_1.Dimensions.get('window').scale,
            isOnline: true,
            lastSync: 0,
        };
        this.initialize();
    }
    static getInstance() {
        if (!PlatformManager.instance) {
            PlatformManager.instance = new PlatformManager();
        }
        return PlatformManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 监听屏幕变化
                react_native_1.Dimensions.addEventListener('change', this.handleDimensionsChange);
                // 监听网络状态
                this.setupNetworkMonitoring();
                // 加载同步配置
                yield this.loadSyncConfig();
                // 启动自动同步
                if (this.syncConfig.autoSync) {
                    this.startAutoSync();
                }
                yield auditManager_1.auditManager.logEvent({
                    type: 'platform',
                    action: 'initialize',
                    status: 'success',
                    details: { config: this.config },
                });
            }
            catch (error) {
                console.error('Platform manager initialization failed:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'platform',
                    action: 'initialize',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    detectPlatform() {
        if (react_native_1.Platform.OS === 'web') {
            return 'web';
        }
        const { width, height } = react_native_1.Dimensions.get('window');
        const screenSize = Math.sqrt(width * width + height * height);
        if (screenSize >= 1100) { // 对角线像素数
            return 'desktop';
        }
        else if (screenSize >= 700) {
            return 'tablet';
        }
        else {
            return 'mobile';
        }
    }
    getOrientation() {
        const { width, height } = react_native_1.Dimensions.get('window');
        return width > height ? 'landscape' : 'portrait';
    }
    setupNetworkMonitoring() {
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
    handleNetworkChange(isOnline) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isOnline && this.syncConfig.autoSync) {
                yield this.syncData();
            }
        });
    }
    loadSyncConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedConfig = yield async_storage_1.default.getItem('@platform_sync_config');
                if (savedConfig) {
                    this.syncConfig = Object.assign(Object.assign({}, this.syncConfig), JSON.parse(savedConfig));
                }
            }
            catch (error) {
                console.error('Failed to load sync config:', error);
            }
        });
    }
    startAutoSync() {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            if (this.config.isOnline) {
                yield this.syncData();
            }
        }), this.syncConfig.syncInterval);
    }
    syncData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.isOnline)
                return;
            try {
                // 获取上次同步后的变更
                const changes = yield this.getChanges(this.config.lastSync);
                if (changes.length === 0)
                    return;
                // 处理冲突
                const resolvedChanges = yield this.resolveConflicts(changes);
                // 应用变更
                yield this.applyChanges(resolvedChanges);
                this.config.lastSync = Date.now();
                yield auditManager_1.auditManager.logEvent({
                    type: 'platform',
                    action: 'sync',
                    status: 'success',
                    details: { changesCount: changes.length },
                });
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'platform',
                    action: 'sync',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    getChanges(since) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取变更的逻辑
            return [];
        });
    }
    resolveConflicts(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现冲突解决逻辑
            return changes;
        });
    }
    applyChanges(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现应用变更的逻辑
        });
    }
    // 公共 API
    getPlatformInfo() {
        return Object.assign({}, this.config);
    }
    isTablet() {
        return this.config.platform === 'tablet';
    }
    isDesktop() {
        return this.config.platform === 'desktop';
    }
    isWeb() {
        return this.config.platform === 'web';
    }
    isOnline() {
        return this.config.isOnline;
    }
    updateSyncConfig(config) {
        this.syncConfig = Object.assign(Object.assign({}, this.syncConfig), config);
        async_storage_1.default.setItem('@platform_sync_config', JSON.stringify(this.syncConfig));
    }
    getResponsiveValue(values) {
        return values[this.config.platform] || values.default;
    }
}
exports.platformManager = PlatformManager.getInstance();
