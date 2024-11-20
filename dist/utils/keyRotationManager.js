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
exports.keyRotationManager = void 0;
const encryptionManager_1 = require("./encryptionManager");
const auditManager_1 = require("./auditManager");
const crypto_js_1 = __importDefault(require("crypto-js"));
class KeyRotationManager {
    constructor() {
        this.config = {
            rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30天
            minKeyAge: 7 * 24 * 60 * 60 * 1000, // 7天
            maxKeyAge: 90 * 24 * 60 * 60 * 1000, // 90天
            autoRotate: true,
        };
        this.rotationTimer = null;
        this.lastRotation = Date.now();
        this.startAutoRotation();
    }
    static getInstance() {
        if (!KeyRotationManager.instance) {
            KeyRotationManager.instance = new KeyRotationManager();
        }
        return KeyRotationManager.instance;
    }
    startAutoRotation() {
        if (this.config.autoRotate) {
            this.rotationTimer = setInterval(() => this.rotateKey(), this.config.rotationInterval);
        }
    }
    stopAutoRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    }
    rotateKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const keyAge = Date.now() - this.lastRotation;
                if (keyAge < this.config.minKeyAge) {
                    return;
                }
                // 生成新密钥
                const newKey = this.generateKey();
                // 更新加密管理器的密钥
                yield encryptionManager_1.encryptionManager.changeEncryptionKey(newKey);
                this.lastRotation = Date.now();
                // 记录审计事件
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'key_rotation',
                    status: 'success',
                    details: {
                        keyAge,
                        rotationTime: this.lastRotation,
                    },
                });
            }
            catch (error) {
                console.error('Key rotation failed:', error);
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'key_rotation',
                    status: 'failure',
                    details: {
                        error: error.message,
                    },
                    errorMessage: error.message,
                });
            }
        });
    }
    generateKey() {
        const randomBytes = crypto_js_1.default.lib.WordArray.random(32);
        return randomBytes.toString(crypto_js_1.default.enc.Hex);
    }
    updateConfig(config) {
        this.config = Object.assign(Object.assign({}, this.config), config);
        if (config.autoRotate !== undefined) {
            if (config.autoRotate) {
                this.startAutoRotation();
            }
            else {
                this.stopAutoRotation();
            }
        }
    }
    getKeyAge() {
        return Date.now() - this.lastRotation;
    }
    shouldRotate() {
        const keyAge = this.getKeyAge();
        return keyAge >= this.config.maxKeyAge;
    }
    destroy() {
        this.stopAutoRotation();
    }
}
exports.keyRotationManager = KeyRotationManager.getInstance();
