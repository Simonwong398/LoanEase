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
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsSyncManager = void 0;
const settingsManager_1 = require("./settingsManager");
const errorManager_1 = require("./errorManager");
class SettingsSyncManager {
    constructor() {
        this.syncTimer = null;
        this.lastSyncTimestamp = 0;
        this.conflicts = [];
        this.retryCount = 0;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
        this.startAutoSync();
    }
    static getInstance() {
        if (!SettingsSyncManager.instance) {
            SettingsSyncManager.instance = new SettingsSyncManager();
        }
        return SettingsSyncManager.instance;
    }
    startAutoSync() {
        const settings = settingsManager_1.settingsManager.getSettings();
        if (settings.sync.syncEnabled) {
            this.syncTimer = setInterval(() => this.syncSettings(), settings.sync.syncInterval);
        }
    }
    stopAutoSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }
    syncSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = settingsManager_1.settingsManager.getSettings();
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
                const remoteSettings = yield this.fetchRemoteSettings();
                // 解决冲突
                const resolvedSettings = yield this.resolveConflicts(settings, remoteSettings);
                // 保存合并后的设置
                yield this.saveResolvedSettings(resolvedSettings);
                this.lastSyncTimestamp = Date.now();
                this.retryCount = 0;
                return {
                    success: true,
                    timestamp: this.lastSyncTimestamp,
                    changes: this.calculateChanges(settings, resolvedSettings),
                };
            }
            catch (error) {
                console.error('Settings sync failed:', error);
                // 重试逻辑
                if (this.retryCount < this.MAX_RETRIES) {
                    this.retryCount++;
                    yield new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * this.retryCount));
                    return this.syncSettings();
                }
                errorManager_1.errorManager.handleError(error);
                return {
                    success: false,
                    timestamp: Date.now(),
                    error: error.message,
                };
            }
        });
    }
    shouldSync(settings) {
        // 检查是否有足够的更改需要同步
        const timeSinceLastSync = Date.now() - this.lastSyncTimestamp;
        const hasEnoughChanges = settings.lastModified > this.lastSyncTimestamp;
        return timeSinceLastSync >= settings.sync.syncInterval || hasEnoughChanges;
    }
    fetchRemoteSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现远程设置获取逻辑
            return {};
        });
    }
    resolveConflicts(local, remote) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolved = Object.assign({}, local);
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
                    conflict.resolved = yield this.resolveConflict(conflict.key, conflict.local, conflict.remote);
                    resolved[conflict.key] = conflict.resolved;
                }
            }
            return resolved;
        });
    }
    resolveConflict(key, local, remote) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现冲突解决策略
            // 这里使用简单的策略：保留最新的修改
            const localTime = local.lastModified || 0;
            const remoteTime = remote.lastModified || 0;
            return localTime > remoteTime ? local : remote;
        });
    }
    saveResolvedSettings(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            yield settingsManager_1.settingsManager.importSettings(JSON.stringify(settings));
        });
    }
    calculateChanges(oldSettings, newSettings) {
        // 实现变更计算逻辑
        return {
            added: 0,
            updated: 0,
            deleted: 0,
        };
    }
    enableSync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield settingsManager_1.settingsManager.updateSyncConfig({
                syncEnabled: true,
            });
            this.startAutoSync();
        });
    }
    disableSync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield settingsManager_1.settingsManager.updateSyncConfig({
                syncEnabled: false,
            });
            this.stopAutoSync();
        });
    }
    getConflicts() {
        return [...this.conflicts];
    }
    destroy() {
        this.stopAutoSync();
    }
}
exports.settingsSyncManager = SettingsSyncManager.getInstance();
