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
exports.privacyManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class PrivacyManager {
    constructor() {
        this.config = {
            dataRetentionDays: 365,
            anonymizeData: true,
            collectAnalytics: false,
            shareData: false,
        };
        this.settings = {
            consentGiven: false,
            dataCollection: false,
            dataSharing: false,
            marketingCommunication: false,
            lastUpdated: Date.now(),
        };
        this.loadSettings();
    }
    static getInstance() {
        if (!PrivacyManager.instance) {
            PrivacyManager.instance = new PrivacyManager();
        }
        return PrivacyManager.instance;
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield async_storage_1.default.getItem('@privacy_settings');
                if (settings) {
                    this.settings = JSON.parse(settings);
                }
            }
            catch (error) {
                console.error('Failed to load privacy settings:', error);
            }
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem('@privacy_settings', JSON.stringify(this.settings));
            }
            catch (error) {
                console.error('Failed to save privacy settings:', error);
            }
        });
    }
    updateConsent(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign(Object.assign(Object.assign({}, this.settings), settings), { lastUpdated: Date.now() });
            yield this.saveSettings();
        });
    }
    anonymizeUserData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.anonymizeData)
                return data;
            // 实现数据匿名化逻辑
            const anonymized = Object.assign({}, data);
            delete anonymized.personalInfo;
            // 替换敏感信息
            if (anonymized.name) {
                anonymized.name = this.maskString(anonymized.name);
            }
            if (anonymized.email) {
                anonymized.email = this.maskEmail(anonymized.email);
            }
            if (anonymized.phone) {
                anonymized.phone = this.maskPhone(anonymized.phone);
            }
            return anonymized;
        });
    }
    maskString(str) {
        return str.charAt(0) + '*'.repeat(str.length - 2) + str.charAt(str.length - 1);
    }
    maskEmail(email) {
        const [local, domain] = email.split('@');
        return this.maskString(local) + '@' + domain;
    }
    maskPhone(phone) {
        return phone.slice(0, 3) + '*'.repeat(4) + phone.slice(-4);
    }
    cleanupOldData() {
        return __awaiter(this, void 0, void 0, function* () {
            const cutoffDate = Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000;
            // 实现数据清理逻辑
        });
    }
    canCollectData() {
        return this.settings.consentGiven && this.settings.dataCollection;
    }
    canShareData() {
        return this.settings.consentGiven && this.settings.dataSharing;
    }
    getPrivacySettings() {
        return Object.assign({}, this.settings);
    }
    getDataRetentionPeriod() {
        return this.config.dataRetentionDays;
    }
}
exports.privacyManager = PrivacyManager.getInstance();
