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
exports.memoryManager = void 0;
class MemoryManager {
    constructor() {
        this.cleanupTimer = null;
        this.callbacks = new Set();
        this.config = {
            maxHeapSize: 512 * 1024 * 1024, // 512MB
            warningThreshold: 0.7, // 70%
            criticalThreshold: 0.9, // 90%
            cleanupInterval: 30000, // 30秒
        };
        this.startMonitoring();
    }
    static getInstance() {
        if (!MemoryManager.instance) {
            MemoryManager.instance = new MemoryManager();
        }
        return MemoryManager.instance;
    }
    startMonitoring() {
        this.cleanupTimer = setInterval(() => {
            const stats = this.getMemoryStats();
            if (stats.status === 'critical') {
                this.forceCleanup();
            }
            else if (stats.status === 'warning') {
                this.notifyWarning();
            }
        }, this.config.cleanupInterval);
    }
    getMemoryStats() {
        var _a;
        const memory = ((_a = process.memoryUsage) === null || _a === void 0 ? void 0 : _a.call(process)) || {
            heapUsed: 0,
            heapTotal: 0,
            external: 0,
        };
        const usage = memory.heapUsed / this.config.maxHeapSize;
        let status = 'normal';
        if (usage >= this.config.criticalThreshold) {
            status = 'critical';
        }
        else if (usage >= this.config.warningThreshold) {
            status = 'warning';
        }
        return {
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            external: memory.external,
            usage,
            status,
        };
    }
    forceCleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            // 通知所有注册的回调
            this.callbacks.forEach(callback => callback());
            // 强制垃圾回收
            if (global.gc) {
                global.gc();
            }
        });
    }
    notifyWarning() {
        console.warn('Memory usage is high:', this.getMemoryStats());
    }
    onCleanup(callback) {
        this.callbacks.add(callback);
        return () => this.callbacks.delete(callback);
    }
    shouldDefer() {
        const stats = this.getMemoryStats();
        return stats.status === 'critical';
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.callbacks.clear();
    }
}
exports.memoryManager = MemoryManager.getInstance();
