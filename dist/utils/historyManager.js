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
exports.historyManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const mathUtils_1 = require("./mathUtils");
class HistoryManager {
    constructor() {
        this.STORAGE_KEY = '@loan_history';
        this.MAX_HISTORY_ITEMS = 100;
        this.history = [];
        this.loadHistory();
    }
    static getInstance() {
        if (!HistoryManager.instance) {
            HistoryManager.instance = new HistoryManager();
        }
        return HistoryManager.instance;
    }
    loadHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.STORAGE_KEY);
                if (data) {
                    this.history = JSON.parse(data);
                }
            }
            catch (error) {
                console.error('Failed to load history:', error);
            }
        });
    }
    saveHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
            }
            catch (error) {
                console.error('Failed to save history:', error);
            }
        });
    }
    addRecord(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRecord = Object.assign(Object.assign({}, record), { id: Date.now().toString(), date: new Date().toISOString() });
            this.history.unshift(newRecord);
            if (this.history.length > this.MAX_HISTORY_ITEMS) {
                this.history.pop();
            }
            yield this.saveHistory();
        });
    }
    searchHistory(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.history.filter(record => {
                const date = new Date(record.date);
                if (query.startDate && date < query.startDate)
                    return false;
                if (query.endDate && date > query.endDate)
                    return false;
                if (query.loanType && record.loanType !== query.loanType)
                    return false;
                if (query.city && record.city !== query.city)
                    return false;
                if (query.minAmount && record.amount < query.minAmount)
                    return false;
                if (query.maxAmount && record.amount > query.maxAmount)
                    return false;
                if (query.tags && !query.tags.every(tag => { var _a; return (_a = record.tags) === null || _a === void 0 ? void 0 : _a.includes(tag); })) {
                    return false;
                }
                return true;
            });
        });
    }
    getHistoryStats() {
        const dimensions = ['amount', 'rate', 'term', 'monthlyPayment'];
        const stats = {
            totalCount: this.history.length,
            averages: {},
            medians: {},
            modes: {},
            trends: {},
            distributions: {},
        };
        if (this.history.length === 0)
            return stats;
        // 计算每个维度的统计数据
        dimensions.forEach(dimension => {
            var _a;
            const values = this.history.map(record => record[dimension]);
            // 计算平均值
            stats.averages[dimension] = mathUtils_1.precise.divide(values.reduce((sum, val) => mathUtils_1.precise.add(sum, val), 0), values.length);
            // 计算中位数
            const sortedValues = [...values].sort((a, b) => a - b);
            const mid = Math.floor(values.length / 2);
            stats.medians[dimension] = values.length % 2 === 0
                ? mathUtils_1.precise.divide(sortedValues[mid - 1] + sortedValues[mid], 2)
                : sortedValues[mid];
            // 计算众数
            const counts = new Map();
            values.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
            const maxCount = Math.max(...counts.values());
            stats.modes[dimension] = ((_a = Array.from(counts.entries())
                .find(([_, count]) => count === maxCount)) === null || _a === void 0 ? void 0 : _a[0]) || 0;
            // 计算趋势
            stats.trends[dimension] = this.history
                .slice(0, 12)
                .map(record => record[dimension])
                .reverse();
            // 计算分布
            stats.distributions[dimension] = this.calculateDistribution(values, dimension);
        });
        return stats;
    }
    calculateDistribution(values, dimension) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        const bucketCount = 5;
        const bucketSize = range / bucketCount;
        const distribution = {};
        values.forEach(value => {
            const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
            const bucketStart = min + bucketIndex * bucketSize;
            const bucketEnd = bucketStart + bucketSize;
            const bucketLabel = `${bucketStart.toFixed(0)}-${bucketEnd.toFixed(0)}`;
            distribution[bucketLabel] = (distribution[bucketLabel] || 0) + 1;
        });
        return distribution;
    }
    exportHistory(format) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现导出逻辑
            return '';
        });
    }
    deleteRecord(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.history = this.history.filter(record => record.id !== id);
            yield this.saveHistory();
        });
    }
    clearHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            this.history = [];
            yield this.saveHistory();
        });
    }
}
exports.historyManager = HistoryManager.getInstance();
