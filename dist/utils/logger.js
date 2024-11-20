"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() {
        this.maxLogSize = 1000;
        this.logs = [];
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    addEntry(entry) {
        this.logs.push(entry);
        if (this.logs.length > this.maxLogSize) {
            this.logs = this.logs.slice(-this.maxLogSize);
        }
        // 在开发环境下打印日志
        if (__DEV__) {
            const { timestamp, level, category, message, details, error } = entry;
            console[level](`[${new Date(timestamp).toISOString()}] [${category}] ${message}`, details, error);
        }
    }
    debug(category, message, details) {
        this.addEntry({
            timestamp: Date.now(),
            level: 'debug',
            category,
            message,
            details,
        });
    }
    info(category, message, details) {
        this.addEntry({
            timestamp: Date.now(),
            level: 'info',
            category,
            message,
            details,
        });
    }
    warn(category, message, details) {
        this.addEntry({
            timestamp: Date.now(),
            level: 'warn',
            category,
            message,
            details,
        });
    }
    error(category, message, error, details) {
        this.addEntry({
            timestamp: Date.now(),
            level: 'error',
            category,
            message,
            details,
            error,
        });
    }
    getLogs(level, category) {
        return this.logs.filter(log => (!level || log.level === level) &&
            (!category || log.category === category));
    }
    clearLogs() {
        this.logs = [];
    }
}
Logger.instance = null;
exports.logger = Logger.getInstance();
