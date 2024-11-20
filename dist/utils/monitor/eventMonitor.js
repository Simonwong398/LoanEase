"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventMonitor = void 0;
const logger_1 = require("../logger");
class EventMonitor {
    constructor() {
        this.events = [];
        this.patterns = [];
        this.maxEvents = 1000;
        this.cleanupInterval = null;
        this.startCleanup();
    }
    static getInstance() {
        if (!EventMonitor.instance) {
            EventMonitor.instance = new EventMonitor();
        }
        return EventMonitor.instance;
    }
    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            this.events = this.events.filter(event => now - event.timestamp < 24 * 60 * 60 * 1000 // 保留24小时内的事件
            );
        }, 60 * 60 * 1000); // 每小时清理一次
    }
    recordEvent(name, category, status = 'success', metadata) {
        const event = {
            name,
            timestamp: Date.now(),
            category,
            status,
            metadata
        };
        this.events.push(event);
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }
        this.checkPatterns(event);
        if (status === 'error') {
            const error = new Error(`Event error: ${name}`);
            if (metadata) {
                Object.assign(error, { metadata });
            }
            logger_1.logger.error('EventMonitor', error.message, error);
        }
    }
    startEvent(name, category, metadata) {
        const startTime = Date.now();
        return () => {
            const duration = Date.now() - startTime;
            this.recordEvent(name, category, 'success', Object.assign(Object.assign({}, metadata), { duration }));
        };
    }
    registerPattern(pattern) {
        this.patterns.push(pattern);
    }
    checkPatterns(newEvent) {
        const now = Date.now();
        this.patterns.forEach(pattern => {
            if (pattern.name === newEvent.name) {
                const relevantEvents = this.events.filter(event => event.name === pattern.name &&
                    now - event.timestamp <= pattern.timeWindow);
                if (relevantEvents.length >= pattern.threshold) {
                    pattern.action(relevantEvents);
                }
            }
        });
    }
    getEvents(filter) {
        let filtered = this.events;
        if (filter) {
            const { name, category, status, timeRange } = filter;
            if (name) {
                filtered = filtered.filter(event => event.name === name);
            }
            if (category) {
                filtered = filtered.filter(event => event.category === category);
            }
            if (status) {
                filtered = filtered.filter(event => event.status === status);
            }
            if (timeRange) {
                const [start, end] = timeRange;
                filtered = filtered.filter(event => event.timestamp >= start && event.timestamp <= end);
            }
        }
        return [...filtered];
    }
    getEventStats(name, timeWindow = 60 * 60 * 1000 // 默认1小时
    ) {
        const now = Date.now();
        const relevantEvents = this.events.filter(event => event.name === name &&
            now - event.timestamp <= timeWindow);
        const stats = {
            total: relevantEvents.length,
            success: 0,
            error: 0,
            warning: 0,
            avgDuration: undefined,
        };
        let totalDuration = 0;
        let eventsWithDuration = 0;
        relevantEvents.forEach(event => {
            stats[event.status]++;
            if (event.duration !== undefined) {
                totalDuration += event.duration;
                eventsWithDuration++;
            }
        });
        if (eventsWithDuration > 0) {
            stats.avgDuration = totalDuration / eventsWithDuration;
        }
        return stats;
    }
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.events = [];
        this.patterns = [];
    }
}
EventMonitor.instance = null;
exports.eventMonitor = EventMonitor.getInstance();
