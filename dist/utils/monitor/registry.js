"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorRegistry = void 0;
const logger_1 = require("../logger");
const eventMonitor_1 = require("./eventMonitor");
const performanceMonitor_1 = require("./performanceMonitor");
const memoryMonitor_1 = require("./memoryMonitor");
class MonitorRegistry {
    constructor() {
        this.monitors = new Map();
        this.monitorTypes = new Map();
        this.isInitialized = false;
        this.registerBuiltInMonitors();
    }
    static getInstance() {
        if (!MonitorRegistry.instance) {
            MonitorRegistry.instance = new MonitorRegistry();
        }
        return MonitorRegistry.instance;
    }
    registerBuiltInMonitors() {
        try {
            // 使用类型断言注册内置监控器
            this.monitorTypes.set('event', eventMonitor_1.EventMonitor);
            this.monitorTypes.set('performance', performanceMonitor_1.PerformanceMonitor);
            this.monitorTypes.set('memory', memoryMonitor_1.MemoryMonitor);
            // 创建默认实例
            this.monitors.set('event', eventMonitor_1.EventMonitor.getInstance());
            this.monitors.set('performance', performanceMonitor_1.PerformanceMonitor.getInstance());
            this.monitors.set('memory', memoryMonitor_1.MemoryMonitor.getInstance());
            this.isInitialized = true;
            logger_1.logger.info('MonitorRegistry', 'Built-in monitors registered');
        }
        catch (error) {
            logger_1.logger.error('MonitorRegistry', 'Failed to register built-in monitors', error instanceof Error ? error : new Error(String(error)));
        }
    }
    registerMonitorType(type, MonitorClass) {
        try {
            if (this.monitorTypes.has(type)) {
                throw new Error(`Monitor type ${type} already registered`);
            }
            this.monitorTypes.set(type, MonitorClass);
            logger_1.logger.info('MonitorRegistry', `Monitor type ${type} registered`);
        }
        catch (error) {
            logger_1.logger.error('MonitorRegistry', `Failed to register monitor type ${type}`, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
    getMonitor(name) {
        return this.monitors.get(name);
    }
    getAllMonitors() {
        return new Map(this.monitors);
    }
    enableMonitor(name) {
        const monitor = this.monitors.get(name);
        if (monitor) {
            monitor.enable();
            logger_1.logger.info('MonitorRegistry', `Monitor ${name} enabled`);
        }
    }
    disableMonitor(name) {
        const monitor = this.monitors.get(name);
        if (monitor) {
            monitor.disable();
            logger_1.logger.info('MonitorRegistry', `Monitor ${name} disabled`);
        }
    }
    removeMonitor(name) {
        try {
            const monitor = this.monitors.get(name);
            if (monitor) {
                monitor.dispose();
                this.monitors.delete(name);
                logger_1.logger.info('MonitorRegistry', `Monitor ${name} removed`);
            }
        }
        catch (error) {
            logger_1.logger.error('MonitorRegistry', `Failed to remove monitor ${name}`, error instanceof Error ? error : new Error(String(error)));
        }
    }
    clearAllMonitors() {
        try {
            this.monitors.forEach((monitor, name) => {
                monitor.clear();
            });
            logger_1.logger.info('MonitorRegistry', 'All monitors cleared');
        }
        catch (error) {
            logger_1.logger.error('MonitorRegistry', 'Failed to clear all monitors', error instanceof Error ? error : new Error(String(error)));
        }
    }
    dispose() {
        try {
            this.monitors.forEach((monitor, name) => {
                monitor.dispose();
            });
            this.monitors.clear();
            this.monitorTypes.clear();
            this.isInitialized = false;
            logger_1.logger.info('MonitorRegistry', 'Monitor registry disposed');
        }
        catch (error) {
            logger_1.logger.error('MonitorRegistry', 'Failed to dispose monitor registry', error instanceof Error ? error : new Error(String(error)));
        }
    }
}
MonitorRegistry.instance = null;
exports.monitorRegistry = MonitorRegistry.getInstance();
