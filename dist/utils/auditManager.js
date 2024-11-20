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
exports.auditManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const encryptionManager_1 = require("./encryptionManager");
class AuditManager {
    constructor() {
        this.events = [];
        this.config = {
            enabled: true,
            retentionDays: 90,
            logLevel: 'info',
        };
    }
    static getInstance() {
        if (!AuditManager.instance) {
            AuditManager.instance = new AuditManager();
        }
        return AuditManager.instance;
    }
    logEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.enabled)
                return;
            const auditEvent = Object.assign(Object.assign({}, event), { id: Date.now().toString(), timestamp: Date.now() });
            this.events.push(auditEvent);
            yield this.persistEvent(auditEvent);
            yield this.cleanupOldEvents();
        });
    }
    persistEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 加密并保存审计事件
                const encryptedEvent = yield encryptionManager_1.encryptionManager.encrypt(event);
                yield async_storage_1.default.setItem(`@audit_${event.id}`, encryptedEvent);
            }
            catch (error) {
                console.error('Failed to persist audit event:', error);
            }
        });
    }
    cleanupOldEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const cutoffDate = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
            this.events = this.events.filter(event => event.timestamp > cutoffDate);
            try {
                const keys = yield async_storage_1.default.getAllKeys();
                const auditKeys = keys.filter(key => key.startsWith('@audit_'));
                for (const key of auditKeys) {
                    const event = yield this.getEvent(key);
                    if (event && event.timestamp <= cutoffDate) {
                        yield async_storage_1.default.removeItem(key);
                    }
                }
            }
            catch (error) {
                console.error('Failed to cleanup old events:', error);
            }
        });
    }
    getEvent(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const encryptedEvent = yield async_storage_1.default.getItem(key);
                if (!encryptedEvent)
                    return null;
                return yield encryptionManager_1.encryptionManager.decrypt(encryptedEvent);
            }
            catch (error) {
                console.error('Failed to get audit event:', error);
                return null;
            }
        });
    }
    getEvents(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let events = [...this.events];
            if (options === null || options === void 0 ? void 0 : options.startDate) {
                events = events.filter(e => e.timestamp >= options.startDate.getTime());
            }
            if (options === null || options === void 0 ? void 0 : options.endDate) {
                events = events.filter(e => e.timestamp <= options.endDate.getTime());
            }
            if (options === null || options === void 0 ? void 0 : options.type) {
                events = events.filter(e => e.type === options.type);
            }
            if (options === null || options === void 0 ? void 0 : options.status) {
                events = events.filter(e => e.status === options.status);
            }
            return events.sort((a, b) => b.timestamp - a.timestamp);
        });
    }
    exportAuditLog(format) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield this.getEvents();
            if (format === 'csv') {
                return this.generateCSV(events);
            }
            return JSON.stringify(events, null, 2);
        });
    }
    generateCSV(events) {
        const headers = ['Timestamp', 'Type', 'Action', 'Status', 'Details'];
        const rows = events.map(event => [
            new Date(event.timestamp).toISOString(),
            event.type,
            event.action,
            event.status,
            JSON.stringify(event.details),
        ]);
        return [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');
    }
    updateConfig(config) {
        this.config = Object.assign(Object.assign({}, this.config), config);
    }
}
exports.auditManager = AuditManager.getInstance();
