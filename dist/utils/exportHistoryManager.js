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
exports.exportHistoryManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const react_native_fs_1 = __importDefault(require("react-native-fs"));
class ExportHistoryManager {
    constructor() {
        this.HISTORY_KEY = '@export_history';
        this.history = [];
        this.MAX_HISTORY_ITEMS = 100;
        this.loadHistory();
    }
    static getInstance() {
        if (!ExportHistoryManager.instance) {
            ExportHistoryManager.instance = new ExportHistoryManager();
        }
        return ExportHistoryManager.instance;
    }
    loadHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield async_storage_1.default.getItem(this.HISTORY_KEY);
                if (data) {
                    this.history = JSON.parse(data);
                }
            }
            catch (error) {
                console.error('Failed to load export history:', error);
            }
        });
    }
    saveHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
            }
            catch (error) {
                console.error('Failed to save export history:', error);
            }
        });
    }
    addHistoryItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            this.history.unshift(item);
            if (this.history.length > this.MAX_HISTORY_ITEMS) {
                // 删除旧的导出记录和相关文件
                const removedItems = this.history.splice(this.MAX_HISTORY_ITEMS);
                this.cleanupFiles(removedItems);
            }
            yield this.saveHistory();
        });
    }
    cleanupFiles(items) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of items) {
                if (item.filePath) {
                    try {
                        yield react_native_fs_1.default.unlink(item.filePath);
                    }
                    catch (error) {
                        console.error('Failed to delete export file:', error);
                    }
                }
            }
        });
    }
    getHistory(limit) {
        return limit ? this.history.slice(0, limit) : this.history;
    }
    clearHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.cleanupFiles(this.history);
            this.history = [];
            yield this.saveHistory();
        });
    }
    deleteHistoryItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = this.history.find(h => h.id === id);
            if (item === null || item === void 0 ? void 0 : item.filePath) {
                try {
                    yield react_native_fs_1.default.unlink(item.filePath);
                }
                catch (error) {
                    console.error('Failed to delete export file:', error);
                }
            }
            this.history = this.history.filter(h => h.id !== id);
            yield this.saveHistory();
        });
    }
    getFileSize(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stat = yield react_native_fs_1.default.stat(filePath);
                return stat.size;
            }
            catch (error) {
                console.error('Failed to get file size:', error);
                return 0;
            }
        });
    }
}
exports.exportHistoryManager = ExportHistoryManager.getInstance();
