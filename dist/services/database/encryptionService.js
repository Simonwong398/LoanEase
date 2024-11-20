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
exports.EncryptionService = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
class EncryptionService {
    constructor() {
        this.config = {
            algorithm: 'aes-256-gcm',
            keyLength: 32,
            salt: 'your-salt-here'
        };
    }
    // 生成加密密钥
    generateKey(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = (yield scryptAsync(password, this.config.salt, this.config.keyLength));
            const iv = (0, crypto_1.randomBytes)(16);
            return { key, iv };
        });
    }
    // 加密数据
    encrypt(data, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cipher = (0, crypto_1.createCipheriv)(this.config.algorithm, key.key, key.iv);
                const encrypted = Buffer.concat([
                    cipher.update(data),
                    cipher.final()
                ]);
                const authTag = cipher.getAuthTag();
                return Buffer.concat([key.iv, encrypted, authTag]);
            }
            catch (error) {
                throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 解密数据
    decrypt(encryptedData, key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const iv = encryptedData.subarray(0, 16);
                const authTag = encryptedData.subarray(-16);
                const data = encryptedData.subarray(16, -16);
                const decipher = (0, crypto_1.createDecipheriv)(this.config.algorithm, key, iv);
                decipher.setAuthTag(authTag);
                return Buffer.concat([
                    decipher.update(data),
                    decipher.final()
                ]);
            }
            catch (error) {
                throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 更新加密密钥
    rotateKey(data, oldKey, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const decrypted = yield this.decrypt(data, oldKey.key);
            const newKey = yield this.generateKey(newPassword);
            return this.encrypt(decrypted, newKey);
        });
    }
}
exports.EncryptionService = EncryptionService;
