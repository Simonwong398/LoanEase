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
exports.secureStorageManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const encryptionManager_1 = require("./encryptionManager");
const privacyManager_1 = require("./privacyManager");
class SecureStorageManager {
    constructor() {
        this.METADATA_KEY = '@storage_metadata';
        this.metadata = new Map();
        this.loadMetadata();
    }
    static getInstance() {
        if (!SecureStorageManager.instance) {
            SecureStorageManager.instance = new SecureStorageManager();
        }
        return SecureStorageManager.instance;
    }
    loadMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.METADATA_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    this.metadata = new Map(Object.entries(parsed));
                }
            }
            catch (error) {
                console.error('Failed to load storage metadata:', error);
            }
        });
    }
    saveMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = Object.fromEntries(this.metadata);
                yield async_storage_1.default.setItem(this.METADATA_KEY, JSON.stringify(data));
            }
            catch (error) {
                console.error('Failed to save storage metadata:', error);
            }
        });
    }
    setItem(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, options = {}) {
            try {
                let processedValue = value;
                // 匿名化数据
                if (options.anonymize) {
                    processedValue = yield privacyManager_1.privacyManager.anonymizeUserData(processedValue);
                }
                // 加密数据
                if (options.encrypt) {
                    processedValue = yield encryptionManager_1.encryptionManager.encrypt(processedValue);
                }
                // 保存数据
                yield async_storage_1.default.setItem(key, JSON.stringify(processedValue));
                // 更新元数据
                this.metadata.set(key, {
                    encrypted: !!options.encrypt,
                    anonymized: !!options.anonymize,
                    expiry: options.expiry,
                    lastAccessed: Date.now(),
                });
                yield this.saveMetadata();
            }
            catch (error) {
                console.error('Failed to set item:', error);
                throw error;
            }
        });
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 检查过期
                const meta = this.metadata.get(key);
                if ((meta === null || meta === void 0 ? void 0 : meta.expiry) && Date.now() > meta.expiry) {
                    yield this.removeItem(key);
                    return null;
                }
                const data = yield async_storage_1.default.getItem(key);
                if (!data)
                    return null;
                let processedData = JSON.parse(data);
                // 解密数据
                if (meta === null || meta === void 0 ? void 0 : meta.encrypted) {
                    processedData = yield encryptionManager_1.encryptionManager.decrypt(processedData);
                }
                // 更新访问时间
                if (meta) {
                    meta.lastAccessed = Date.now();
                    yield this.saveMetadata();
                }
                return processedData;
            }
            catch (error) {
                console.error('Failed to get item:', error);
                throw error;
            }
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.removeItem(key);
                this.metadata.delete(key);
                yield this.saveMetadata();
            }
            catch (error) {
                console.error('Failed to remove item:', error);
                throw error;
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keys = Array.from(this.metadata.keys());
                yield Promise.all(keys.map(key => async_storage_1.default.removeItem(key)));
                this.metadata.clear();
                yield this.saveMetadata();
            }
            catch (error) {
                console.error('Failed to clear storage:', error);
                throw error;
            }
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = Date.now();
            const expiredKeys = Array.from(this.metadata.entries())
                .filter(([_, meta]) => meta.expiry && now > meta.expiry)
                .map(([key]) => key);
            yield Promise.all(expiredKeys.map(key => this.removeItem(key)));
        });
    }
}
exports.secureStorageManager = SecureStorageManager.getInstance();
