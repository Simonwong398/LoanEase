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
exports.fileCleanupManager = void 0;
const react_native_fs_1 = __importDefault(require("react-native-fs"));
class FileCleanupManager {
    constructor() {
        this.config = {
            maxFileAge: 7 * 24 * 60 * 60 * 1000, // 7天
            maxStorageSize: 100 * 1024 * 1024, // 100MB
            minKeepFiles: 10,
            cleanupInterval: 24 * 60 * 60 * 1000, // 24小时
        };
        this.lastCleanupTime = 0;
        this.cleanupTimer = null;
        this.startAutoCleanup();
    }
    static getInstance() {
        if (!FileCleanupManager.instance) {
            FileCleanupManager.instance = new FileCleanupManager();
        }
        return FileCleanupManager.instance;
    }
    startAutoCleanup() {
        this.cleanupTimer = setInterval(() => this.performAutoCleanup(), this.config.cleanupInterval);
    }
    performAutoCleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.getStorageStats();
            if (stats.usagePercentage > 80) { // 当存储使用率超过80%时自动清理
                yield this.cleanupFiles([]);
            }
        });
    }
    cleanupFiles(history) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exportDir = `${react_native_fs_1.default.DocumentDirectoryPath}/exports`;
                const files = yield react_native_fs_1.default.readDir(exportDir);
                // 按修改时间排序
                const sortedFiles = files.sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
                // 保留最新的文件
                const filesToKeep = new Set(history
                    .slice(-this.config.minKeepFiles)
                    .map(item => item.filePath));
                const now = Date.now();
                for (const file of sortedFiles) {
                    if (filesToKeep.has(file.path))
                        continue;
                    const fileAge = now - new Date(file.mtime).getTime();
                    if (fileAge > this.config.maxFileAge) {
                        yield react_native_fs_1.default.unlink(file.path);
                    }
                }
                this.lastCleanupTime = now;
            }
            catch (error) {
                console.error('File cleanup failed:', error);
            }
        });
    }
    getStorageStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exportDir = `${react_native_fs_1.default.DocumentDirectoryPath}/exports`;
                const files = yield react_native_fs_1.default.readDir(exportDir);
                let totalSize = 0;
                let oldestDate = null;
                for (const file of files) {
                    totalSize += file.size;
                    const fileDate = new Date(file.mtime);
                    if (!oldestDate || fileDate < oldestDate) {
                        oldestDate = fileDate;
                    }
                }
                return {
                    totalSize,
                    fileCount: files.length,
                    oldestFile: oldestDate,
                    usagePercentage: (totalSize / this.config.maxStorageSize) * 100,
                    lastCleanup: this.lastCleanupTime ? new Date(this.lastCleanupTime) : null,
                };
            }
            catch (error) {
                console.error('Failed to get storage stats:', error);
                return {
                    totalSize: 0,
                    fileCount: 0,
                    oldestFile: null,
                    usagePercentage: 0,
                    lastCleanup: null,
                };
            }
        });
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
    }
}
exports.fileCleanupManager = FileCleanupManager.getInstance();
