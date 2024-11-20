"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.backupManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const react_native_fs_1 = __importDefault(require("react-native-fs"));
const securityManager_1 = require("./securityManager");
const auditManager_1 = require("./auditManager");
const CryptoJS = __importStar(require("crypto-js"));
const errors_1 = require("../types/errors");
const errorHandler_1 = require("../utils/errorHandler");
const resourceManager_1 = require("../utils/resourceManager");
const index_1 = require("../utils/security/index");
const concurrency_1 = require("./concurrency");
const timeout_1 = require("./timeout");
const logger_1 = require("./logger");
// 定义自己的 ValidationError，而不是导入
class ValidationError extends errors_1.AppError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
class BackupManager {
    constructor() {
        // 添加缓存支持
        this.cache = new Map();
        this.backupPath = `${react_native_fs_1.default.DocumentDirectoryPath}/backups`;
        this.metadata = new Map();
        this.cleanupInterval = null;
        this.isDisposed = false;
        this.activeOperations = new Set();
        this.concurrencyManager = new concurrency_1.ConcurrencyManager(3);
        this.initialize();
    }
    static getInstance() {
        if (!BackupManager.instance) {
            BackupManager.instance = new BackupManager();
            // 添加进程退出时的清理
            process.on('beforeExit', () => __awaiter(this, void 0, void 0, function* () {
                if (BackupManager.instance) {
                    yield BackupManager.instance.dispose();
                }
            }));
        }
        return BackupManager.instance;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeBackupDirectory();
            this.startCleanupSchedule();
            // 注册资源清理
            resourceManager_1.resourceManager.registerCleanup(() => __awaiter(this, void 0, void 0, function* () {
                yield this.dispose();
            }));
        });
    }
    initializeBackupDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exists = yield react_native_fs_1.default.exists(this.backupPath);
                if (!exists) {
                    yield react_native_fs_1.default.writeFile(this.backupPath, '', 'utf8');
                }
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'init_directory',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                throw new errors_1.AppError('Failed to initialize backup directory', 'INIT_DIRECTORY_FAILED');
            }
        });
    }
    executeWithTimeout(operation_1) {
        return __awaiter(this, arguments, void 0, function* (operation, timeoutMs = BackupManager.OPERATION_TIMEOUT) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const result = yield operation(controller.signal);
                clearTimeout(timeout);
                return result;
            }
            catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new errors_1.AppError('Operation timed out', 'TIMEOUT');
                }
                throw error;
            }
        });
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDisposed) {
                return;
            }
            this.isDisposed = true;
            try {
                yield Promise.all(Array.from(this.activeOperations));
                if (this.cleanupInterval) {
                    clearInterval(this.cleanupInterval);
                    this.cleanupInterval = null;
                }
                yield this.saveMetadata(this.metadata);
                this.metadata.clear();
                this.activeOperations.clear();
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'dispose',
                    status: 'success',
                    details: { timestamp: Date.now() }
                });
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'dispose',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                throw new errors_1.ResourceError('Failed to cleanup backup manager', { cause: error });
            }
        });
    }
    trackOperation(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isDisposed) {
                throw new Error('BackupManager has been disposed');
            }
            this.activeOperations.add(operation);
            try {
                return yield operation;
            }
            finally {
                this.activeOperations.delete(operation);
            }
        });
    }
    createBackup() {
        return __awaiter(this, arguments, void 0, function* (encrypt = true) {
            logger_1.logger.info('BackupManager', 'Starting backup creation', { encrypt });
            return this.concurrencyManager.add(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield (0, timeout_1.withTimeout)(this._createBackup(encrypt), BackupManager.BACKUP_TIMEOUT, 'Backup creation');
                    logger_1.logger.info('BackupManager', 'Backup created successfully', {
                        backupId: result
                    });
                    return result;
                }
                catch (error) {
                    logger_1.logger.error('BackupManager', 'Backup creation failed', error instanceof Error ? error : new Error(String(error)));
                    throw error;
                }
            }));
        });
    }
    _createBackup(encrypt) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeWithTimeout((signal) => __awaiter(this, void 0, void 0, function* () {
                // 验证备份条件
                if (!this.isBackupAvailable()) {
                    throw new errors_1.AppError('Backup conditions not met', 'CONDITIONS_NOT_MET');
                }
                const data = yield this.collectBackupData();
                const backupId = Date.now().toString();
                const fileName = `backup_${backupId}.json`;
                const filePath = `${this.backupPath}/${fileName}`;
                let fileContent = JSON.stringify(data);
                let checksum = yield this.calculateChecksum(fileContent);
                if (encrypt) {
                    // 使用双重类型断言
                    const secureManager = securityManager_1.securityManager;
                    fileContent = yield this.executeWithTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield secureManager.encrypt(fileContent); }), 5000 // 加密操作使用较短的超时时间
                    );
                }
                yield react_native_fs_1.default.writeFile(filePath, fileContent, 'utf8');
                const metadata = {
                    id: backupId,
                    timestamp: Date.now(),
                    size: fileContent.length,
                    checksum,
                    encrypted: encrypt,
                    version: '1.0',
                    type: 'full',
                };
                this.metadata.set(backupId, metadata);
                yield this.saveMetadata(this.metadata);
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'create',
                    status: 'success',
                    details: { backupId, encrypted: encrypt },
                });
                return backupId;
            }));
        });
    }
    checkSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield react_native_fs_1.default.stat(react_native_fs_1.default.DocumentDirectoryPath);
                const freeSpace = stats.size || 0;
                if (freeSpace < 1024 * 1024 * 100) {
                    throw new errors_1.AppError('Insufficient storage space', 'NO_SPACE');
                }
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'check_system',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                throw error;
            }
        });
    }
    cleanupOldBackups() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const backups = Array.from(this.metadata.entries())
                    .sort(([, a], [, b]) => b.timestamp - a.timestamp);
                // 保留最新的 5 个备份
                const toDelete = backups.slice(5);
                for (const [id, backup] of toDelete) {
                    const filePath = `${this.backupPath}/backup_${id}.json`;
                    yield react_native_fs_1.default.unlink(filePath);
                    this.metadata.delete(id);
                }
                yield this.saveMetadata(this.metadata);
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'cleanup',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
            }
        });
    }
    saveMetadata(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, errorHandler_1.withErrorHandling)(() => __awaiter(this, void 0, void 0, function* () {
                // 验证和清理数
                const sanitizedData = metadata instanceof Map ?
                    new Map(Array.from(metadata.entries()).map(([key, value]) => [
                        (0, index_1.sanitizeData)(key),
                        this.sanitizeMetadata(value)
                    ])) :
                    this.sanitizeMetadata(metadata);
                // 加密数据
                const dataToEncrypt = sanitizedData instanceof Map ?
                    Array.from(sanitizedData.entries()) :
                    [[sanitizedData.id, sanitizedData]];
                const secureManager = securityManager_1.securityManager;
                const encryptedData = yield secureManager.encrypt(JSON.stringify(dataToEncrypt));
                // 安全存储
                yield async_storage_1.default.setItem('@backup_metadata_encrypted', encryptedData);
            }), { context: 'BackupManager', operation: 'saveMetadata' });
        });
    }
    sanitizeMetadata(metadata) {
        return {
            id: (0, index_1.sanitizeData)(metadata.id),
            timestamp: Number(metadata.timestamp),
            size: Number(metadata.size),
            checksum: (0, index_1.sanitizeData)(metadata.checksum),
            encrypted: Boolean(metadata.encrypted),
            version: (0, index_1.sanitizeData)(metadata.version || '1.0'),
            type: metadata.type || 'full'
        };
    }
    validateMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object') {
            throw new ValidationError('Invalid metadata format');
        }
        const md = metadata;
        if (typeof md.id !== 'string' ||
            typeof md.timestamp !== 'number' ||
            typeof md.size !== 'number' ||
            typeof md.checksum !== 'string' ||
            typeof md.encrypted !== 'boolean') {
            throw new ValidationError('Invalid field types in metadata');
        }
    }
    loadMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const encryptedData = yield async_storage_1.default.getItem('@backup_metadata_encrypted');
                if (encryptedData) {
                    const secureManager = securityManager_1.securityManager;
                    const decryptedData = yield this.executeWithTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield secureManager.decrypt(encryptedData); }), 5000);
                    this.metadata = new Map(JSON.parse(decryptedData));
                }
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'backup',
                    action: 'load_metadata',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' }
                });
                throw error;
            }
        });
    }
    calculateChecksum(data) {
        return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    }
    isBackupAvailable() {
        return true;
    }
    collectBackupData() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    cleanMetadataCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.metadata.size <= BackupManager.MAX_METADATA_SIZE)
                return;
            const sortedEntries = Array.from(this.metadata.entries())
                .sort(([, a], [, b]) => b.timestamp - a.timestamp);
            // 使用批处理删除过期数据
            const entriesToDelete = sortedEntries.slice(BackupManager.MAX_METADATA_SIZE);
            yield this.processBatch(entriesToDelete, (_a) => __awaiter(this, [_a], void 0, function* ([key]) {
                this.metadata.delete(key);
            }));
            yield this.saveMetadata(this.metadata);
        });
    }
    cleanBackupFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug('BackupManager', 'Starting backup cleanup');
            return (0, timeout_1.withTimeoutSignal)((signal) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const files = yield react_native_fs_1.default.readDir(this.backupPath);
                    if (files.length > BackupManager.MAX_BACKUP_FILES) {
                        const sortedFiles = files.sort((a, b) => {
                            const timeA = new Date(a.mtime).getTime();
                            const timeB = new Date(b.mtime).getTime();
                            return timeB - timeA;
                        });
                        const filesToDelete = sortedFiles.slice(BackupManager.MAX_BACKUP_FILES);
                        yield this.concurrencyManager.processBatch(filesToDelete, (file) => __awaiter(this, void 0, void 0, function* () {
                            if (signal.aborted) {
                                throw new Error('Cleanup operation aborted');
                            }
                            yield react_native_fs_1.default.unlink(file.path);
                        }), 5);
                    }
                    logger_1.logger.info('BackupManager', 'Backup cleanup completed');
                }
                catch (error) {
                    logger_1.logger.error('BackupManager', 'Backup cleanup failed', error instanceof Error ? error : new Error(String(error)));
                    throw error;
                }
            }), BackupManager.CLEANUP_TIMEOUT, 'Backup cleanup');
        });
    }
    startCleanupSchedule() {
        this.cleanupInterval = setInterval(() => {
            this.cleanMetadataCache();
        }, BackupManager.CLEANUP_INTERVAL);
    }
    // 添加批处理支持
    processBatch(items_1, processor_1) {
        return __awaiter(this, arguments, void 0, function* (items, processor, batchSize = 100) {
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                yield Promise.all(batch.map(processor));
            }
        });
    }
    getCachedData(key, generator) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < BackupManager.CACHE_TTL) {
                return cached.data;
            }
            const data = yield generator();
            this.cache.set(key, { data, timestamp: Date.now() });
            return data;
        });
    }
}
BackupManager.instance = null;
BackupManager.OPERATION_TIMEOUT = 30000;
BackupManager.MAX_METADATA_SIZE = 1000;
BackupManager.MAX_BACKUP_FILES = 50;
BackupManager.CLEANUP_INTERVAL = 60 * 60 * 1000;
BackupManager.CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
BackupManager.BACKUP_TIMEOUT = 30000; // 30 seconds
BackupManager.CLEANUP_TIMEOUT = 60000; // 60 seconds
exports.backupManager = BackupManager.getInstance();
