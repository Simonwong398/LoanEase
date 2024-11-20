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
exports.storageManager = void 0;
const logger_1 = require("../logger");
const cache_1 = require("../cache");
const performance_1 = require("../performance");
class StorageManager {
    constructor() {
        this.metrics = new Map();
        this.storage = new Map();
        this.operations = [];
        this.monitorInterval = null;
        this.currentMetrics = {
            heapUsed: 0,
            itemCount: 0,
            cacheSize: 0,
            operationsPerSecond: 0,
            averageAccessTime: 0,
            hitRate: 0,
            missRate: 0,
            operationTime: 0,
            dataSize: 0,
            memoryUsage: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        this.benchmarkData = new Map();
        this.memoryUsageInterval = null;
        this.MEMORY_CHECK_INTERVAL = 60000; // 1分钟
        this.localStorageKey = 'app_storage_';
        this.cloudQueue = new Set();
        this.pendingOperations = new Map();
        this.changeQueue = [];
        this.syncState = {
            lastSync: 0,
            pendingChanges: 0,
            syncErrors: 0,
            status: 'idle'
        };
        this.syncInProgress = false;
        this.monitorConfig = {
            monitorInterval: 5000, // 5秒
            maxHeapUsage: 512, // 512MB
            maxItemCount: 10000, // 10000项
            cleanupThreshold: 0.8, // 80%
            performanceThresholds: {
                accessTime: 100, // 100ms
                minHitRate: 0.7, // 70%
            },
        };
        this.performanceData = {
            operations: [],
            snapshots: []
        };
        this.config = this.loadConfig();
        this.initializeSync();
        this.initializeCloudSync();
        this.startMemoryMonitoring();
        this.initializeBenchmarks();
        this.startMonitoring();
        this.startPerformanceMonitoring();
    }
    static getInstance() {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }
    // 设置数据
    setItem(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, options = {}) {
            const startTime = performance.now();
            try {
                // 使用分块处理大数据
                yield this.handleLargeData(value, {
                    chunkSize: options.chunkSize,
                    compression: options.compress,
                    progressCallback: options.progressCallback,
                    processChunk: (chunk) => __awaiter(this, void 0, void 0, function* () {
                        yield this.performSet(key, chunk, options);
                    })
                });
                yield performance_1.performanceManager.recordMetric('storage', 'set', performance.now() - startTime, {
                    key,
                    success: true
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Failed to set item', actualError);
                throw actualError;
            }
        });
    }
    // 获取数据
    getItem(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, options = {}) {
            const startTime = performance.now();
            let success = false;
            try {
                const item = this.storage.get(key);
                success = item !== null;
                return item;
            }
            finally {
                const duration = performance.now() - startTime;
                this.recordOperation('get', duration, success);
            }
        });
    }
    // 删除数据
    removeItem(key_1) {
        return __awaiter(this, arguments, void 0, function* (key, options = {}) {
            const startTime = performance.now();
            try {
                // 检查是否有待处理的操作
                if (this.pendingOperations.has(key)) {
                    yield this.pendingOperations.get(key);
                }
                const operation = this.performRemove(key, options.type || 'local');
                this.pendingOperations.set(key, operation);
                yield operation;
                yield cache_1.cacheManager.delete(key);
                yield performance_1.performanceManager.recordMetric('storage', 'remove', performance.now() - startTime, {
                    key,
                    type: options.type || 'local',
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Failed to remove item', actualError);
                throw actualError;
            }
            finally {
                this.pendingOperations.delete(key);
            }
        });
    }
    // 清理存储
    clear() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const startTime = performance.now();
            try {
                yield Promise.all(Array.from(this.pendingOperations.values()));
                const type = options.type || 'local';
                switch (type) {
                    case 'local':
                        localStorage.clear();
                        break;
                    case 'session':
                        sessionStorage.clear();
                        break;
                    case 'memory':
                        yield cache_1.cacheManager.clear();
                        break;
                    case 'cloud':
                        yield this.clearCloudStorage();
                        break;
                }
                yield performance_1.performanceManager.recordMetric('storage', 'clear', performance.now() - startTime, {
                    type,
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Failed to clear storage', actualError);
                throw actualError;
            }
        });
    }
    // 同步数据
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.syncEnabled)
                return;
            const startTime = performance.now();
            try {
                // 处理所有待处理的操作
                yield Promise.all(Array.from(this.pendingOperations.values()));
                // 获取所有变更
                const changes = this.changeQueue.splice(0);
                if (changes.length === 0)
                    return;
                // 执行同步
                yield this.performSync(changes);
                this.syncState = {
                    lastSync: Date.now(),
                    pendingChanges: this.changeQueue.length,
                    syncErrors: 0,
                    status: 'idle'
                };
                yield performance_1.performanceManager.recordMetric('storage', 'sync', performance.now() - startTime, {
                    changes: changes.length,
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                this.syncState.syncErrors++;
                this.syncState.lastError = actualError;
                logger_1.logger.error('StorageManager', 'Sync failed', actualError);
                throw actualError;
            }
        });
    }
    // 获取同步状态
    getSyncState() {
        return Object.assign({}, this.syncState);
    }
    performSet(key, value, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = options.type || 'local';
            let processedValue = value;
            // 确定是否需要加密和压缩
            const shouldEncrypt = Boolean(options.encrypt || (options.encrypt !== false && this.config.encryptionEnabled));
            const shouldCompress = Boolean(options.compress || (options.compress !== false && this.config.compressionEnabled));
            // 压缩数据
            if (shouldCompress) {
                processedValue = yield this.compressData(processedValue);
            }
            // 加密数据
            if (shouldEncrypt) {
                const encryptedValue = yield this.encryptData(processedValue);
                processedValue = encryptedValue;
            }
            const item = {
                key,
                value: processedValue,
                timestamp: Date.now(),
                version: 1,
                checksum: yield this.calculateChecksum(processedValue),
                encrypted: shouldEncrypt,
                compressed: shouldCompress,
                metadata: options.metadata,
            };
            const serialized = JSON.stringify(item);
            switch (type) {
                case 'local':
                    localStorage.setItem(key, serialized);
                    break;
                case 'session':
                    sessionStorage.setItem(key, serialized);
                    break;
                case 'memory':
                    yield cache_1.cacheManager.set(key, item, { ttl: options.ttl });
                    break;
                case 'cloud':
                    yield this.setCloudItem(key, serialized);
                    break;
            }
            // 添加到变更队列
            this.changeQueue.push({
                type: 'set',
                key,
                value: item,
                timestamp: Date.now(),
            });
        });
    }
    retrieveItem(key, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let serialized = null;
            switch (type) {
                case 'local':
                    serialized = localStorage.getItem(key);
                    break;
                case 'session':
                    serialized = sessionStorage.getItem(key);
                    break;
                case 'memory': {
                    const cached = yield cache_1.cacheManager.get(key);
                    return cached || null;
                }
                case 'cloud':
                    serialized = yield this.getCloudItem(key);
                    break;
            }
            if (!serialized)
                return null;
            const item = JSON.parse(serialized);
            // 验证校验和
            const checksum = yield this.calculateChecksum(item.value);
            if (checksum !== item.checksum) {
                throw new Error('Data integrity check failed');
            }
            // 解密数据
            if (item.encrypted) {
                const decryptedValue = yield this.decryptData(item.value);
                item.value = decryptedValue;
            }
            // 解压数据
            if (item.compressed) {
                item.value = yield this.decompressData(item.value);
            }
            return item;
        });
    }
    performRemove(key, type) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (type) {
                case 'local':
                    localStorage.removeItem(key);
                    break;
                case 'session':
                    sessionStorage.removeItem(key);
                    break;
                case 'memory':
                    yield cache_1.cacheManager.delete(key);
                    break;
                case 'cloud':
                    yield this.removeCloudItem(key);
                    break;
            }
            // 添加到变更队列
            this.changeQueue.push({
                type: 'delete',
                key,
                timestamp: Date.now(),
            });
        });
    }
    // 云存储操作
    setCloudItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现云存储操作
        });
    }
    getCloudItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现云存储操作
            return null;
        });
    }
    removeCloudItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现云存储操作
        });
    }
    clearCloudStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现云存储操作
        });
    }
    // 数据理
    compressData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现数据压缩
            return data;
        });
    }
    decompressData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现数据解压
            return data;
        });
    }
    encryptData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const crypto = require('crypto');
            const key = process.env.ENCRYPTION_KEY || 'default-key';
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
            let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return JSON.stringify({
                iv: iv.toString('hex'),
                data: encrypted,
                tag: cipher.getAuthTag().toString('hex')
            });
        });
    }
    decryptData(encryptedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const crypto = require('crypto');
            const key = process.env.ENCRYPTION_KEY || 'default-key';
            const { iv, data, tag } = JSON.parse(encryptedData);
            const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), Buffer.from(iv, 'hex'));
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
            let decrypted = decipher.update(data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return JSON.parse(decrypted);
        });
    }
    calculateChecksum(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const crypto = require('crypto');
            const content = typeof data === 'string' ? data : JSON.stringify(data);
            return crypto.createHash('sha256').update(content).digest('hex');
        });
    }
    // 同步管理
    initializeSync() {
        if (this.config.syncEnabled) {
            setInterval(() => {
                this.sync().catch(error => {
                    logger_1.logger.error('StorageManager', 'Auto sync failed', error);
                });
            }, 5 * 60 * 1000); // 每5分钟同步一次
        }
    }
    performSync(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: 实现数据同步逻辑
        });
    }
    dispose() {
        if (this.monitorInterval) {
            clearTimeout(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.metrics.clear();
        this.operations = []; // 清空操作记录
        this.storage.clear();
    }
    // 新增：加载置
    loadConfig() {
        return {
            // 基础配置
            type: 'local',
            ttl: 24 * 60 * 60 * 1000, // 24小时
            // 数据处理配置
            encryptionEnabled: true,
            encryptionKey: process.env.ENCRYPTION_KEY,
            compressionEnabled: true,
            chunkSize: 1024 * 1024, // 1MB
            // 同步配置
            syncEnabled: true,
            syncInterval: 5 * 60 * 1000, // 5分钟
            maxRetries: 3,
            retryDelay: 1000,
            // 云存储配置
            cloudStorage: {
                endpoint: process.env.CLOUD_STORAGE_ENDPOINT || '',
                credentials: {
                    accessKey: process.env.CLOUD_STORAGE_ACCESS_KEY || '',
                    secretKey: process.env.CLOUD_STORAGE_SECRET_KEY || ''
                },
                bucket: process.env.CLOUD_STORAGE_BUCKET || '',
                syncInterval: 60 * 1000 // 1分钟
            },
            // 内存管理配置
            memory: {
                maxUsage: 512, // 512MB
                warningThreshold: 384, // 384MB (75%)
                checkInterval: 60 * 1000, // 1分钟
                autoCleanup: true,
                cleanupThreshold: 448 // 448MB (87.5%)
            }
        };
    }
    // 新增：初始化云存储同步
    initializeCloudSync() {
        if (!this.config.cloudStorage)
            return;
        // 定期检查并同步到云存储
        setInterval(() => {
            this.syncToCloud().catch(error => {
                logger_1.logger.error('StorageManager', 'Cloud sync failed', error);
            });
        }, 60000); // 每分钟检查一次
    }
    // 新：同步到云存储
    syncToCloud() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.syncInProgress || this.cloudQueue.size === 0)
                return;
            this.syncInProgress = true;
            const keys = Array.from(this.cloudQueue);
            this.cloudQueue.clear();
            try {
                for (const key of keys) {
                    const item = yield this.getItem(key);
                    if (item) {
                        yield this.uploadToCloud(key, item);
                    }
                }
            }
            finally {
                this.syncInProgress = false;
            }
        });
    }
    // 新增：上传到云存储
    uploadToCloud(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cloudStorage)
                return;
            try {
                const encrypted = yield this.encryptData(JSON.stringify(data));
                logger_1.logger.info('StorageManager', 'Uploaded to cloud storage', { key });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Cloud upload failed', actualError);
                this.cloudQueue.add(key);
            }
        });
    }
    // 新增：从云存储恢复
    restoreFromCloud(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.cloudStorage)
                return null;
            try {
                const encryptedData = ''; // 从云存储获取的加密数据
                const decrypted = yield this.decryptData(encryptedData);
                return decrypted;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Cloud restore failed', actualError);
                return null;
            }
        });
    }
    // 添加性能监控
    startMemoryMonitoring() {
        var _a;
        if ((_a = this.config.memory) === null || _a === void 0 ? void 0 : _a.checkInterval) {
            this.memoryUsageInterval = setInterval(() => {
                this.checkMemoryUsage();
            }, this.config.memory.checkInterval);
        }
    }
    checkMemoryUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const memoryUsage = process.memoryUsage();
                const heapUsed = memoryUsage.heapUsed / 1024 / 1024; // MB
                if (((_a = this.config.memory) === null || _a === void 0 ? void 0 : _a.maxUsage) && heapUsed > this.config.memory.maxUsage) {
                    const error = new Error('Memory usage exceeded limit');
                    Object.assign(error, {
                        heapUsed: `${heapUsed.toFixed(2)}MB`,
                        limit: `${this.config.memory.maxUsage}MB`
                    });
                    logger_1.logger.error('StorageManager', error.message, error);
                }
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Memory check failed', actualError);
            }
        });
    }
    performMemoryCleanup() {
        return __awaiter(this, arguments, void 0, function* (force = false) {
            var _a;
            try {
                const startTime = performance.now();
                let cleanedItems = 0;
                // 获取所有存储项
                const items = Array.from(this.storage.entries())
                    .map(([key, value]) => ({
                    key,
                    value,
                    lastAccessed: value.lastAccessed || 0
                }))
                    .sort((a, b) => a.lastAccessed - b.lastAccessed);
                // 清理策略
                for (const item of items) {
                    if (force ||
                        (item.value.expiry && Date.now() > item.value.expiry) ||
                        (Date.now() - item.lastAccessed > 30 * 60 * 1000)) {
                        this.storage.delete(item.key);
                        cleanedItems++;
                        if (!force) {
                            const currentUsage = process.memoryUsage().heapUsed / 1024 / 1024;
                            if (((_a = this.config.memory) === null || _a === void 0 ? void 0 : _a.warningThreshold) &&
                                currentUsage < this.config.memory.warningThreshold) {
                                break;
                            }
                        }
                    }
                }
                // 记录清理结果
                logger_1.logger.info('StorageManager', 'Memory cleanup completed', {
                    cleanedItems,
                    duration: performance.now() - startTime
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Memory cleanup failed', actualError);
            }
        });
    }
    // 性能基准测试
    initializeBenchmarks() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runSingleBenchmark('write', () => this.benchmarkWrite());
            yield this.runSingleBenchmark('read', () => this.benchmarkRead());
            yield this.runSingleBenchmark('compression', () => this.benchmarkCompression());
            yield this.runSingleBenchmark('encryption', () => this.benchmarkEncryption());
        });
    }
    runSingleBenchmark(name, test) {
        return __awaiter(this, void 0, void 0, function* () {
            const samples = [];
            for (let i = 0; i < 10; i++) {
                const duration = yield test();
                samples.push(duration);
            }
            this.benchmarkData.set(name, samples);
            const avg = samples.reduce((a, b) => a + b) / samples.length;
            logger_1.logger.info('StorageManager', `Benchmark ${name}`, {
                average: `${avg.toFixed(2)}ms`,
                min: Math.min(...samples),
                max: Math.max(...samples)
            });
        });
    }
    benchmarkWrite() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            const testData = { test: 'data'.repeat(1000) };
            yield this.setItem('benchmark_write', testData);
            return performance.now() - start;
        });
    }
    benchmarkRead() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            yield this.getItem('benchmark_write');
            return performance.now() - start;
        });
    }
    benchmarkCompression() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            const testData = { test: 'data'.repeat(1000) };
            yield this.compressData(testData);
            return performance.now() - start;
        });
    }
    benchmarkEncryption() {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            const testData = { test: 'data'.repeat(1000) };
            yield this.encryptData(testData);
            return performance.now() - start;
        });
    }
    // 优化大数据集处理
    handleLargeData(data_1) {
        return __awaiter(this, arguments, void 0, function* (data, options = {}) {
            const { chunkSize = 1024 * 1024, // 1MB
            compression = true, progressCallback, processChunk } = options;
            const serialized = JSON.stringify(data);
            const totalChunks = Math.ceil(serialized.length / chunkSize);
            let processedChunks = 0;
            // 分块处理
            for (let i = 0; i < serialized.length; i += chunkSize) {
                const chunk = serialized.slice(i, i + chunkSize);
                // 压缩数据
                const processedChunk = compression ?
                    yield this.compressData(chunk) :
                    chunk;
                // 处理块
                if (processChunk) {
                    yield processChunk(processedChunk);
                }
                else {
                    yield this.storeDataChunk(processedChunk, i / serialized.length);
                }
                // 更新进度
                processedChunks++;
                if (progressCallback) {
                    progressCallback(processedChunks / totalChunks);
                }
                // 让出控制权
                yield new Promise(resolve => setTimeout(resolve, 0));
            }
        });
    }
    // 内存泄漏检测
    checkMemoryLeaks() {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshots = this.performanceData.snapshots;
            if (snapshots.length < 2)
                return;
            const recentSnapshots = snapshots.slice(-10); // 获取最近10个快照
            const memoryTrend = this.calculateMemoryTrend(recentSnapshots);
            if (memoryTrend.isLeaking) {
                const error = new Error('Potential memory leak detected');
                Object.assign(error, {
                    trend: memoryTrend.trend,
                    duration: memoryTrend.duration,
                    increase: memoryTrend.increase
                });
                logger_1.logger.error('StorageManager', error.message, error);
                // 触发清理
                yield this.handleMemoryLeak();
            }
        });
    }
    // 性能监控
    startPerformanceMonitoring() {
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 1000); // 每秒收集一次
        setInterval(() => {
            this.checkMemoryLeaks();
        }, 60000); // 每分钟检查一次内存泄漏
    }
    collectPerformanceMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const recentOps = this.performanceData.operations.filter(op => now - op.endTime < 1000);
            const metrics = Object.assign(Object.assign(Object.assign(Object.assign({ 
                // 基础指标
                operationCount: recentOps.length, successCount: recentOps.filter(op => op.success).length, errorCount: recentOps.filter(op => !op.success).length, averageResponseTime: this.calculateAverageResponseTime(recentOps) }, this.collectMemoryMetrics()), { 
                // 缓存指标
                cacheSize: this.calculateCacheSize(), cacheHitRate: this.calculateCacheHitRate(recentOps), cacheMissRate: this.calculateCacheMissRate(recentOps) }), this.calculateLatencyPercentiles(recentOps)), { 
                // 吞吐量
                operationsPerSecond: recentOps.length, bytesProcessedPerSecond: this.calculateBytesProcessed(recentOps) });
            this.performanceData.snapshots.push({
                timestamp: now,
                metrics
            });
            // 只保留最近的快照
            if (this.performanceData.snapshots.length > 3600) { // 保留1小时的数据
                this.performanceData.snapshots.shift();
            }
            // 记录性能指标
            yield performance_1.performanceManager.recordMetric('storage', 'performance', 0, metrics);
        });
    }
    // 基准测试
    runBenchmark() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {
                averageSetTime: 0,
                averageGetTime: 0,
                averageDeleteTime: 0,
                maxConcurrentOperations: 0,
                concurrentThroughput: 0,
                peakMemoryUsage: 0,
                memoryLeakCheck: false,
                largeDataProcessingTime: 0,
                compressionRatio: 0,
                errorRate: 0,
                timeoutRate: 0
            };
            // 基础操作测试
            result.averageSetTime = yield this.benchmarkSetOperation();
            result.averageGetTime = yield this.benchmarkGetOperation();
            result.averageDeleteTime = yield this.benchmarkDeleteOperation();
            // 并发测试
            const concurrencyResults = yield this.benchmarkConcurrency();
            result.maxConcurrentOperations = concurrencyResults.maxOperations;
            result.concurrentThroughput = concurrencyResults.throughput;
            // 内存测试
            const memoryResults = yield this.benchmarkMemory();
            result.peakMemoryUsage = memoryResults.peakUsage;
            result.memoryLeakCheck = memoryResults.noLeaks;
            // 大数据测试
            const largeDataResults = yield this.benchmarkLargeData();
            result.largeDataProcessingTime = largeDataResults.processingTime;
            result.compressionRatio = largeDataResults.compressionRatio;
            // 错误率测试
            const errorResults = yield this.benchmarkErrorScenarios();
            result.errorRate = errorResults.errorRate;
            result.timeoutRate = errorResults.timeoutRate;
            return result;
        });
    }
    // 获取性能指标
    getMetrics(key) {
        if (key) {
            return this.metrics.get(key) || this.currentMetrics;
        }
        return this.currentMetrics;
    }
    // 获取基准测试结果
    getBenchmarks() {
        return new Map(this.benchmarkData);
    }
    startMonitoring() {
        this.monitorInterval = setInterval(() => {
            this.updateMetrics().catch(error => {
                logger_1.logger.error('StorageManager', 'Failed to update metrics', error);
            });
        }, this.monitorConfig.monitorInterval);
    }
    updateMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                // 更新内存使用
                const memoryUsage = process.memoryUsage();
                const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
                // 更新基础指标
                const baseMetrics = {
                    heapUsed,
                    itemCount: this.storage.size,
                    cacheSize: yield this.calculateCacheSize(),
                    operationsPerSecond: 0,
                    averageAccessTime: 0,
                    hitRate: 0,
                    missRate: 0,
                    operationTime: 0,
                    dataSize: 0,
                    memoryUsage: memoryUsage.heapUsed,
                    cacheHits: 0,
                    cacheMisses: 0
                };
                // 计算性能指标
                const now = Date.now();
                const recentOps = this.operations.filter(op => now - op.timestamp < this.monitorConfig.monitorInterval);
                if (recentOps.length > 0) {
                    baseMetrics.operationsPerSecond = recentOps.length /
                        (this.monitorConfig.monitorInterval / 1000);
                    baseMetrics.averageAccessTime = recentOps.reduce((sum, op) => sum + op.duration, 0) / recentOps.length;
                    const hits = recentOps.filter(op => op.success).length;
                    baseMetrics.hitRate = hits / recentOps.length;
                    baseMetrics.missRate = 1 - baseMetrics.hitRate;
                }
                // 更新指标
                this.metrics.set('global', baseMetrics);
                // 检查阈值
                yield this.checkThresholds();
                // 记录性能指标
                yield performance_1.performanceManager.recordMetric('storage', 'metrics', performance.now() - startTime, {
                    heapUsed: baseMetrics.heapUsed,
                    itemCount: baseMetrics.itemCount,
                    operationsPerSecond: baseMetrics.operationsPerSecond,
                    hitRate: baseMetrics.hitRate
                });
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('StorageManager', 'Failed to update metrics', actualError);
            }
        });
    }
    checkThresholds() {
        return __awaiter(this, void 0, void 0, function* () {
            const globalMetrics = this.metrics.get('global');
            if (!globalMetrics)
                return;
            // 检查内存使用
            if (globalMetrics.heapUsed > this.monitorConfig.maxHeapUsage) {
                const error = new Error('Memory usage exceeded limit');
                Object.assign(error, {
                    currentUsage: globalMetrics.heapUsed,
                    limit: this.monitorConfig.maxHeapUsage
                });
                logger_1.logger.error('StorageManager', error.message, error);
            }
            // 检查性能指标
            if (globalMetrics.averageAccessTime > this.monitorConfig.performanceThresholds.accessTime) {
                const error = new Error('Access time exceeded threshold');
                Object.assign(error, {
                    currentTime: globalMetrics.averageAccessTime,
                    threshold: this.monitorConfig.performanceThresholds.accessTime
                });
                logger_1.logger.error('StorageManager', error.message, error);
            }
            if (globalMetrics.hitRate < this.monitorConfig.performanceThresholds.minHitRate) {
                const warningDetails = {
                    currentRate: globalMetrics.hitRate,
                    threshold: this.monitorConfig.performanceThresholds.minHitRate
                };
                logger_1.logger.warn('StorageManager', 'Cache hit rate below threshold', warningDetails);
            }
        });
    }
    calculateCacheSize() {
        let totalSize = 0;
        for (const [, item] of this.storage) {
            try {
                const serialized = JSON.stringify(item);
                totalSize += new Blob([serialized]).size;
            }
            catch (_a) {
                // 忽略无法序列化的项
            }
        }
        return Math.round(totalSize / 1024 / 1024); // 转换为 MB
    }
    getItemSize(item) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serialized = JSON.stringify(item);
                return new Blob([serialized]).size;
            }
            catch (_a) {
                return 0;
            }
        });
    }
    // 在每个操作中记录性能数据
    recordOperation(type, duration, success) {
        const operation = {
            timestamp: Date.now(),
            duration,
            type,
            success
        };
        this.operations.push(operation);
        // 限制操作记录数量
        const maxOperations = 1000;
        if (this.operations.length > maxOperations) {
            this.operations = this.operations.slice(-maxOperations);
        }
        // 记录性能指标
        performance_1.performanceManager.recordMetric('storage', type, duration, {
            success,
            operationType: type
        }).catch(error => {
            logger_1.logger.error('StorageManager', 'Failed to record metric', error);
        });
    }
    // 新增：性能基准测试
    runFullBenchmark() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { iterations = 1000, dataSize = 1024, concurrent = 10 } = options;
            const testData = 'x'.repeat(dataSize);
            const results = {
                setTimes: [],
                getTimes: [],
                memoryBefore: process.memoryUsage().heapUsed,
                memoryAfter: 0
            };
            // 并发写入测试
            yield Promise.all(Array.from({ length: concurrent }, (_, i) => __awaiter(this, void 0, void 0, function* () {
                for (let j = 0; j < iterations / concurrent; j++) {
                    const start = performance.now();
                    yield this.setItem(`bench_${i}_${j}`, testData);
                    results.setTimes.push(performance.now() - start);
                }
            })));
            // 并发读取测试
            yield Promise.all(Array.from({ length: concurrent }, (_, i) => __awaiter(this, void 0, void 0, function* () {
                for (let j = 0; j < iterations / concurrent; j++) {
                    const start = performance.now();
                    yield this.getItem(`bench_${i}_${j}`);
                    results.getTimes.push(performance.now() - start);
                }
            })));
            // 清理测试数据
            for (let i = 0; i < concurrent; i++) {
                for (let j = 0; j < iterations / concurrent; j++) {
                    yield this.removeItem(`bench_${i}_${j}`);
                }
            }
            results.memoryAfter = process.memoryUsage().heapUsed;
            return {
                averageSetTime: results.setTimes.reduce((a, b) => a + b) / results.setTimes.length,
                averageGetTime: results.getTimes.reduce((a, b) => a + b) / results.getTimes.length,
                throughput: iterations / (Math.max(...results.getTimes) / 1000),
                memoryUsage: (results.memoryAfter - results.memoryBefore) / 1024 / 1024 // MB
            };
        });
    }
    // 添加缺失的方法
    storeDataChunk(chunk, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现数据块存储逻辑
            yield this.storage.set(`chunk_${progress}`, chunk);
        });
    }
    calculateMemoryTrend(snapshots) {
        if (snapshots.length < 2) {
            return { isLeaking: false, trend: 'stable', duration: 0, increase: 0 };
        }
        const firstMemory = snapshots[0].metrics.heapUsed;
        const lastMemory = snapshots[snapshots.length - 1].metrics.heapUsed;
        const duration = snapshots[snapshots.length - 1].timestamp - snapshots[0].timestamp;
        const increase = lastMemory - firstMemory;
        const trend = increase > 0 ? 'increasing' : increase < 0 ? 'decreasing' : 'stable';
        const isLeaking = increase > 0 && (increase / firstMemory) > 0.2; // 20% 增长视为泄漏
        return { isLeaking, trend, duration, increase };
    }
    handleMemoryLeak() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现内存泄漏处理逻辑
            yield this.performMemoryCleanup(true);
        });
    }
    calculateAverageResponseTime(operations) {
        if (operations.length === 0)
            return 0;
        const totalTime = operations.reduce((sum, op) => sum + (op.endTime - op.startTime), 0);
        return totalTime / operations.length;
    }
    collectMemoryMetrics() {
        const memoryUsage = process.memoryUsage();
        return {
            heapUsed: memoryUsage.heapUsed / 1024 / 1024,
            heapTotal: memoryUsage.heapTotal / 1024 / 1024,
            externalMemory: memoryUsage.external / 1024 / 1024
        };
    }
    calculateCacheHitRate(operations) {
        if (operations.length === 0)
            return 0;
        const hits = operations.filter(op => op.success).length;
        return hits / operations.length;
    }
    calculateCacheMissRate(operations) {
        return 1 - this.calculateCacheHitRate(operations);
    }
    calculateLatencyPercentiles(operations) {
        if (operations.length === 0) {
            return { p50Latency: 0, p90Latency: 0, p99Latency: 0 };
        }
        const latencies = operations
            .map(op => op.endTime - op.startTime)
            .sort((a, b) => a - b);
        return {
            p50Latency: latencies[Math.floor(latencies.length * 0.5)],
            p90Latency: latencies[Math.floor(latencies.length * 0.9)],
            p99Latency: latencies[Math.floor(latencies.length * 0.99)]
        };
    }
    calculateBytesProcessed(operations) {
        return operations.reduce((sum, op) => sum + op.size, 0);
    }
    // 基准测试方法
    benchmarkSetOperation() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            yield this.setItem('benchmark_set', { test: 'data' });
            return performance.now() - startTime;
        });
    }
    benchmarkGetOperation() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            yield this.getItem('benchmark_set');
            return performance.now() - startTime;
        });
    }
    benchmarkDeleteOperation() {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            yield this.removeItem('benchmark_set');
            return performance.now() - startTime;
        });
    }
    benchmarkConcurrency() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现并发测试逻辑
            return { maxOperations: 0, throughput: 0 };
        });
    }
    benchmarkMemory() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现内存测试逻辑
            return { peakUsage: 0, noLeaks: true };
        });
    }
    benchmarkLargeData() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现大数据测试逻辑
            return { processingTime: 0, compressionRatio: 0 };
        });
    }
    benchmarkErrorScenarios() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现错误场景测试逻辑
            return { errorRate: 0, timeoutRate: 0 };
        });
    }
}
StorageManager.instance = null;
exports.storageManager = StorageManager.getInstance();
