"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
require("@testing-library/jest-dom");
(0, globals_1.describe)('MemoryMonitor', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.useFakeTimers();
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.useRealTimers();
        index_1.memoryMonitor.dispose();
    });
    (0, globals_1.it)('should take memory snapshots', () => {
        globals_1.jest.advanceTimersByTime(60000);
        const snapshots = index_1.memoryMonitor.getSnapshots();
        (0, globals_1.expect)(snapshots.length).toBeGreaterThan(0);
    });
    (0, globals_1.it)('should detect high memory usage', () => {
        const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
        globals_1.jest.spyOn(process, 'memoryUsage').mockReturnValue({
            heapUsed: 200 * 1024 * 1024,
            heapTotal: 300 * 1024 * 1024,
            external: 0,
            arrayBuffers: 0,
            rss: 500 * 1024 * 1024,
        });
        globals_1.jest.advanceTimersByTime(60000);
        (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
        mockLogger.mockRestore();
    });
    (0, globals_1.it)('should detect memory leaks', () => {
        const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
        for (let i = 0; i < 5; i++) {
            globals_1.jest.spyOn(process, 'memoryUsage').mockReturnValue({
                heapUsed: (50 + i * 20) * 1024 * 1024,
                heapTotal: 300 * 1024 * 1024,
                external: 0,
                arrayBuffers: 0,
                rss: 500 * 1024 * 1024,
            });
            globals_1.jest.advanceTimersByTime(60000);
        }
        (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
        mockLogger.mockRestore();
    });
});
(0, globals_1.describe)('PerformanceMonitor', () => {
    (0, globals_1.beforeEach)(() => {
        index_1.performanceMonitor.clearMetrics();
    });
    (0, globals_1.it)('should track operation duration', () => {
        index_1.performanceMonitor.startOperation('test', 'computation');
        globals_1.jest.advanceTimersByTime(150);
        index_1.performanceMonitor.endOperation('test', 'computation');
        const metrics = index_1.performanceMonitor.getMetrics('computation');
        (0, globals_1.expect)(metrics[0].duration).toBeGreaterThan(100);
    });
    (0, globals_1.it)('should detect slow operations', () => {
        const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
        index_1.performanceMonitor.startOperation('slow-op', 'network');
        globals_1.jest.advanceTimersByTime(2000);
        index_1.performanceMonitor.endOperation('slow-op', 'network');
        (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
        mockLogger.mockRestore();
    });
    (0, globals_1.it)('should handle multiple concurrent operations', () => {
        index_1.performanceMonitor.startOperation('op1', 'computation');
        index_1.performanceMonitor.startOperation('op2', 'network');
        globals_1.jest.advanceTimersByTime(100);
        index_1.performanceMonitor.endOperation('op1', 'computation');
        globals_1.jest.advanceTimersByTime(100);
        index_1.performanceMonitor.endOperation('op2', 'network');
        const metrics = index_1.performanceMonitor.getMetrics();
        (0, globals_1.expect)(metrics.length).toBe(2);
    });
    (0, globals_1.it)('should respect custom thresholds', () => {
        const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
        index_1.performanceMonitor.setThreshold('render', 50);
        index_1.performanceMonitor.startOperation('render', 'render');
        globals_1.jest.advanceTimersByTime(100);
        index_1.performanceMonitor.endOperation('render', 'render');
        (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
        mockLogger.mockRestore();
    });
});
