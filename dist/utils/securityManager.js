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
exports.securityManager = void 0;
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const auditManager_1 = require("./auditManager");
// 创建平台特定的加密实现
const EncryptionModule = react_native_1.Platform.select({
    ios: react_native_1.NativeModules.EncryptionModule,
    android: react_native_1.NativeModules.EncryptionModule,
    default: {
        generateKey: () => __awaiter(void 0, void 0, void 0, function* () { return ''; }),
        encrypt: (data) => __awaiter(void 0, void 0, void 0, function* () { return data; }),
        decrypt: (data) => __awaiter(void 0, void 0, void 0, function* () { return data; }),
    },
});
class SecurityManager {
    constructor() {
        this.encryptionKey = null;
        this.ENCRYPTION_KEY_KEY = '@encryption_key';
        this.initializeEncryption();
    }
    static getInstance() {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager();
        }
        return SecurityManager.instance;
    }
    initializeEncryption() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试加载现有密钥
                let key = yield async_storage_1.default.getItem(this.ENCRYPTION_KEY_KEY);
                if (!key) {
                    // 生成新密钥
                    key = yield EncryptionModule.generateKey();
                    yield async_storage_1.default.setItem(this.ENCRYPTION_KEY_KEY, key);
                }
                this.encryptionKey = key;
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'init_encryption',
                    status: 'success',
                    details: { keyExists: !!key },
                });
            }
            catch (error) {
                console.error('Failed to initialize encryption:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'init_encryption',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    encryptData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.encryptionKey) {
                throw new Error('Encryption not initialized');
            }
            try {
                const jsonData = JSON.stringify(data);
                const encrypted = yield EncryptionModule.encrypt(jsonData, this.encryptionKey);
                const encryptedData = {
                    data: encrypted,
                    iv: '', // 在实际实现中应该使用 IV
                    timestamp: Date.now(),
                };
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'encrypt',
                    status: 'success',
                    details: { timestamp: encryptedData.timestamp },
                });
                return JSON.stringify(encryptedData);
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'encrypt',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
                throw error;
            }
        });
    }
    decryptData(encryptedString) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.encryptionKey) {
                throw new Error('Encryption not initialized');
            }
            try {
                const encryptedData = JSON.parse(encryptedString);
                const decrypted = yield EncryptionModule.decrypt(encryptedData.data, this.encryptionKey);
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'decrypt',
                    status: 'success',
                    details: { timestamp: encryptedData.timestamp },
                });
                return JSON.parse(decrypted);
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'decrypt',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
                throw error;
            }
        });
    }
    storeEncrypted(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const encrypted = yield this.encryptData(data);
            yield async_storage_1.default.setItem(key, encrypted);
        });
    }
    retrieveEncrypted(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const encrypted = yield async_storage_1.default.getItem(key);
            if (!encrypted)
                return null;
            return yield this.decryptData(encrypted);
        });
    }
    removeEncrypted(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield async_storage_1.default.removeItem(key);
        });
    }
    rotateEncryptionKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newKey = yield EncryptionModule.generateKey();
                const oldKey = this.encryptionKey;
                this.encryptionKey = newKey;
                // 重新加密所有数据
                const keys = yield async_storage_1.default.getAllKeys();
                for (const key of keys) {
                    if (key.startsWith('@encrypted_')) {
                        const encrypted = yield async_storage_1.default.getItem(key);
                        if (encrypted) {
                            const data = yield this.decryptData(encrypted);
                            yield this.storeEncrypted(key, data);
                        }
                    }
                }
                yield async_storage_1.default.setItem(this.ENCRYPTION_KEY_KEY, newKey);
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'rotate_key',
                    status: 'success',
                    details: { timestamp: Date.now() },
                });
            }
            catch (error) {
                this.encryptionKey = null;
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'rotate_key',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
                throw error;
            }
        });
    }
}
exports.securityManager = SecurityManager.getInstance();
