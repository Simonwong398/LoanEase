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
exports.concurrencyManager = exports.ConcurrencyManager = void 0;
/**
 * 并发控制管理器
 */
class ConcurrencyManager {
    constructor(maxConcurrency = 5) {
        this.running = 0;
        this.queue = [];
        this.maxConcurrency = maxConcurrency;
    }
    /**
     * 添加任务到队列
     */
    add(task) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.running >= this.maxConcurrency) {
                yield new Promise(resolve => this.queue.push(resolve));
            }
            this.running++;
            try {
                return yield task();
            }
            finally {
                this.running--;
                if (this.queue.length > 0) {
                    const next = this.queue.shift();
                    next === null || next === void 0 ? void 0 : next();
                }
            }
        });
    }
    /**
     * 批量处理任务
     */
    processBatch(items_1, processor_1) {
        return __awaiter(this, arguments, void 0, function* (items, processor, batchSize = 5) {
            const results = [];
            for (let i = 0; i < items.length; i += batchSize) {
                const batch = items.slice(i, i + batchSize);
                const batchResults = yield Promise.all(batch.map(item => this.add(() => processor(item))));
                results.push(...batchResults);
            }
            return results;
        });
    }
    /**
     * 获取当前运行中的任务数
     */
    getRunningCount() {
        return this.running;
    }
    /**
     * 获取等待队列长度
     */
    getQueueLength() {
        return this.queue.length;
    }
}
exports.ConcurrencyManager = ConcurrencyManager;
/**
 * 创建默认的并发管理器实例
 */
exports.concurrencyManager = new ConcurrencyManager();
