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
exports.persistenceManager = exports.PersistenceManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const validationCache_1 = require("./validationCache");
class PersistenceManager {
    constructor() {
        this.config = {
            maxCacheSize: 1000,
            persistInterval: 5 * 60 * 1000, // 5分钟
            compressionThreshold: 1024 * 50, // 50KB
            retryAttempts: 3,
            retryDelay: 1000,
        };
        this.persistenceTimer = null;
        this.pendingChanges = new Set();
        this.startPersistenceTimer();
    }
    static getInstance() {
        if (!PersistenceManager.instance) {
            PersistenceManager.instance = new PersistenceManager();
        }
        return PersistenceManager.instance;
    }
    startPersistenceTimer() {
        this.persistenceTimer = setInterval(() => {
            this.persistCache();
        }, this.config.persistInterval);
    }
    persistCache() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pendingChanges.size === 0)
                return;
            const entries = validationCache_1.validationCache.getEntries()
                .filter(([key]) => this.pendingChanges.has(key));
            if (entries.length === 0)
                return;
            const data = JSON.stringify(entries);
            const needsCompression = data.length > this.config.compressionThreshold;
            const processedData = needsCompression ? yield this.compress(data) : data;
            let attempts = 0;
            while (attempts < this.config.retryAttempts) {
                try {
                    yield async_storage_1.default.setItem('@validation_cache', processedData);
                    this.pendingChanges.clear();
                    break;
                }
                catch (error) {
                    attempts++;
                    if (attempts === this.config.retryAttempts) {
                        console.error('Failed to persist cache after retries:', error);
                        break;
                    }
                    yield new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempts));
                }
            }
        });
    }
    compress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现简单的压缩算法
            // 这里可以使用更复杂的压缩库
            return data.replace(/\s+/g, '');
        });
    }
    loadCache() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem('@validation_cache');
                if (!data)
                    return;
                const isCompressed = yield this.isCompressed(data);
                const processedData = isCompressed ? yield this.decompress(data) : data;
                const entries = JSON.parse(processedData);
                validationCache_1.validationCache.loadEntries(entries);
            }
            catch (error) {
                console.error('Failed to load cache:', error);
            }
        });
    }
    isCompressed(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // 检查数据是否被压缩
            return data.startsWith('compressed:');
        });
    }
    decompress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现解压缩
            return data.substring('compressed:'.length);
        });
    }
    recordChange(key) {
        this.pendingChanges.add(key);
    }
    destroy() {
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
        }
        this.persistCache();
    }
}
exports.PersistenceManager = PersistenceManager;
exports.persistenceManager = PersistenceManager.getInstance();
