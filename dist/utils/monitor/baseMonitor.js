"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMonitor = void 0;
const logger_1 = require("../logger");
const errors_1 = require("./errors");
class BaseMonitor {
    constructor(config = {}) {
        this.entries = [];
        this.cleanupInterval = null;
        this.isInitialized = false;
        this.config = Object.assign({ enabled: true, sampleRate: 1.0, maxEntries: 1000, cleanupInterval: 60 * 60 * 1000 }, config);
        this.initialize();
    }
    initialize() {
        if (this.isInitialized)
            return;
        try {
            this.startCleanup();
            this.isInitialized = true;
            logger_1.logger.info(this.getMonitorName(), 'Initialized successfully');
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Initialization failed', error instanceof Error ? error : new Error(String(error)));
        }
    }
    startCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }
    cleanup() {
        try {
            if (this.entries.length > this.config.maxEntries) {
                this.entries = this.entries.slice(-this.config.maxEntries);
            }
            this.performCustomCleanup();
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Cleanup failed', error instanceof Error ? error : new Error(String(error)));
        }
    }
    get isEnabled() {
        return this.config.enabled;
    }
    enable() {
        this.config.enabled = true;
        logger_1.logger.info(this.getMonitorName(), 'Enabled');
    }
    disable() {
        this.config.enabled = false;
        logger_1.logger.info(this.getMonitorName(), 'Disabled');
    }
    record(data) {
        if (!this.isEnabled)
            return;
        try {
            if (Math.random() <= this.config.sampleRate) {
                this.entries.push(data);
                this.onRecordComplete(data);
            }
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Record failed', error instanceof Error ? error : new Error(String(error)));
        }
    }
    getEntries(filter) {
        try {
            let filtered = this.entries;
            if (filter) {
                const { startTime, endTime, categories, statuses, predicate } = filter;
                if (startTime !== undefined || endTime !== undefined) {
                    filtered = this.filterByTimeRange(filtered, startTime, endTime);
                }
                if (categories === null || categories === void 0 ? void 0 : categories.length) {
                    filtered = this.filterByCategories(filtered, categories);
                }
                if (statuses === null || statuses === void 0 ? void 0 : statuses.length) {
                    filtered = this.filterByStatuses(filtered, statuses);
                }
                if (predicate) {
                    filtered = filtered.filter(predicate);
                }
            }
            return Object.freeze([...filtered]);
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Get entries failed', error instanceof Error ? error : new Error(String(error)));
            return [];
        }
    }
    getStats(timeWindow) {
        try {
            const stats = this.calculateStats(timeWindow);
            return Object.freeze(stats);
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Get stats failed', error instanceof Error ? error : new Error(String(error)));
            return {
                total: 0,
                success: 0,
                error: 0,
                warning: 0
            };
        }
    }
    clear() {
        try {
            this.entries = [];
            this.onClear();
            logger_1.logger.info(this.getMonitorName(), 'Cleared');
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Clear failed', error instanceof Error ? error : new Error(String(error)));
        }
    }
    dispose() {
        try {
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }
            this.entries = [];
            this.onDispose();
            logger_1.logger.info(this.getMonitorName(), 'Disposed');
        }
        catch (error) {
            logger_1.logger.error(this.getMonitorName(), 'Dispose failed', error instanceof Error ? error : new Error(String(error)));
        }
    }
    wrapOperation(operation, name) {
        const startTime = Date.now();
        return Promise.resolve()
            .then(() => operation())
            .then((data) => ({
            success: true,
            timestamp: startTime,
            duration: Date.now() - startTime,
            data
        }))
            .catch((error) => {
            if (error instanceof errors_1.MonitorError) {
                const safeContext = {};
                if (error.details.context) {
                    Object.entries(error.details.context).forEach(([key, value]) => {
                        if (this.isJsonValue(value)) {
                            safeContext[key] = value;
                        }
                        else {
                            safeContext[key] = String(value);
                        }
                    });
                }
                return {
                    success: false,
                    timestamp: startTime,
                    duration: Date.now() - startTime,
                    error: Object.assign(Object.assign({}, error.details), { context: safeContext })
                };
            }
            const context = {
                name,
                errorType: error instanceof Error ? error.constructor.name : typeof error,
                errorMessage: error instanceof Error ? error.message : String(error)
            };
            return {
                success: false,
                timestamp: startTime,
                duration: Date.now() - startTime,
                error: {
                    code: 'SYSTEM_ERROR',
                    message: error instanceof Error ? error.message : String(error),
                    timestamp: startTime,
                    errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    severity: 'high',
                    recoverable: false,
                    stack: error instanceof Error ? error.stack : undefined,
                    context
                }
            };
        });
    }
    isJsonValue(value) {
        if (value === null)
            return true;
        if (['string', 'number', 'boolean'].includes(typeof value))
            return true;
        if (Array.isArray(value))
            return value.every(item => this.isJsonValue(item));
        if (typeof value === 'object') {
            return Object.values(value).every(v => this.isJsonValue(v));
        }
        return false;
    }
}
exports.BaseMonitor = BaseMonitor;
