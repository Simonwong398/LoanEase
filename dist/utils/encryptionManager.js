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
exports.encryptionManager = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const react_native_1 = require("react-native");
const Keychain = __importStar(require("react-native-keychain"));
class EncryptionManager {
    constructor() {
        this.encryptionKey = null;
        this.config = {
            algorithm: 'AES-256-GCM',
            keySize: 256,
            iterations: 10000,
        };
        this.initializeEncryption();
    }
    static getInstance() {
        if (!EncryptionManager.instance) {
            EncryptionManager.instance = new EncryptionManager();
        }
        return EncryptionManager.instance;
    }
    initializeEncryption() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const key = yield this.getSecureKey();
                if (key) {
                    this.encryptionKey = key;
                }
                else {
                    this.encryptionKey = this.generateKey();
                    yield this.saveSecureKey(this.encryptionKey);
                }
            }
            catch (error) {
                console.error('Failed to initialize encryption:', error);
                this.encryptionKey = this.generateFallbackKey();
            }
        });
    }
    getSecureKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (react_native_1.Platform.OS === 'web') {
                    return yield async_storage_1.default.getItem('@encryption_key');
                }
                else {
                    const credentials = yield Keychain.getGenericPassword({
                        service: 'encryption_key',
                    });
                    return credentials ? credentials.password : null;
                }
            }
            catch (error) {
                console.error('Failed to get secure key:', error);
                return null;
            }
        });
    }
    saveSecureKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (react_native_1.Platform.OS === 'web') {
                    yield async_storage_1.default.setItem('@encryption_key', key);
                }
                else {
                    yield Keychain.setGenericPassword('encryption', key, {
                        service: 'encryption_key',
                    });
                }
            }
            catch (error) {
                console.error('Failed to save secure key:', error);
            }
        });
    }
    generateKey() {
        return crypto_js_1.default.lib.WordArray.random(this.config.keySize / 8).toString();
    }
    generateFallbackKey() {
        const deviceInfo = react_native_1.Platform.select({
            ios: 'ios',
            android: 'android',
            default: 'web',
        });
        const message = `${deviceInfo}${Date.now()}`;
        const hash = crypto_js_1.default.SHA256(message);
        return hash.toString(crypto_js_1.default.enc.Hex);
    }
    generateDeviceHash() {
        const deviceInfo = `${react_native_1.Platform.OS}-${react_native_1.Platform.Version}`;
        const message = `${deviceInfo}${Date.now()}`;
        return crypto_js_1.default.SHA256(message).toString(crypto_js_1.default.enc.Hex);
    }
    encrypt(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not initialized');
            }
            try {
                const jsonStr = JSON.stringify(data);
                const encrypted = crypto_js_1.default.AES.encrypt(jsonStr, this.encryptionKey);
                return encrypted.toString();
            }
            catch (error) {
                console.error('Encryption failed:', error);
                throw error;
            }
        });
    }
    decrypt(encryptedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not initialized');
            }
            try {
                const bytes = crypto_js_1.default.AES.decrypt(encryptedData, this.encryptionKey);
                const jsonStr = bytes.toString(crypto_js_1.default.enc.Utf8);
                return JSON.parse(jsonStr);
            }
            catch (error) {
                console.error('Decryption failed:', error);
                throw error;
            }
        });
    }
    changeEncryptionKey(newKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldKey = this.encryptionKey;
            this.encryptionKey = newKey;
            yield this.reencryptData(oldKey, newKey);
            yield this.saveSecureKey(newKey);
        });
    }
    reencryptData(oldKey, newKey) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现数据重新加密的逻辑
        });
    }
    validateKey(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return key === this.encryptionKey;
        });
    }
}
exports.encryptionManager = EncryptionManager.getInstance();
