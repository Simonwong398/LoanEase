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
exports.biometricManager = void 0;
const react_native_1 = require("react-native");
const auditManager_1 = require("./auditManager");
// 创建平台特定的生物识别实现
const BiometricModule = react_native_1.Platform.select({
    ios: react_native_1.NativeModules.TouchID || react_native_1.NativeModules.FaceID,
    android: react_native_1.NativeModules.BiometricModule,
    default: {
        isSupported: () => __awaiter(void 0, void 0, void 0, function* () { return false; }),
        authenticate: () => __awaiter(void 0, void 0, void 0, function* () { return false; }),
    },
});
class BiometricManager {
    constructor() {
        this.config = {
            enabled: false,
            allowFallback: true,
            promptMessage: '请验证身份',
            fallbackMessage: '使用密码',
        };
        this.checkBiometricAvailability();
    }
    static getInstance() {
        if (!BiometricManager.instance) {
            BiometricManager.instance = new BiometricManager();
        }
        return BiometricManager.instance;
    }
    checkBiometricAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isSupported = yield BiometricModule.isSupported();
                this.config.enabled = isSupported;
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'check_biometric',
                    status: 'success',
                    details: {
                        available: this.config.enabled,
                        platform: react_native_1.Platform.OS
                    },
                });
            }
            catch (error) {
                console.error('Biometric check failed:', error);
                this.config.enabled = false;
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'check_biometric',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
            }
        });
    }
    authenticate(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.enabled) {
                return false;
            }
            try {
                const success = yield BiometricModule.authenticate({
                    reason: reason || this.config.promptMessage,
                });
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'authenticate',
                    status: success ? 'success' : 'failure',
                    details: { reason },
                });
                return success;
            }
            catch (error) {
                yield auditManager_1.auditManager.logEvent({
                    type: 'security',
                    action: 'authenticate',
                    status: 'failure',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                });
                return false;
            }
        });
    }
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
    }
    isAvailable() {
        return this.config.enabled;
    }
}
exports.biometricManager = BiometricManager.getInstance();
