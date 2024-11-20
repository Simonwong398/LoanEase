"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
(0, globals_1.describe)('PerformanceMonitor', () => {
    (0, globals_1.beforeEach)(() => {
        index_1.performanceMonitor.clearMetrics();
        globals_1.jest.useFakeTimers();
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.useRealTimers();
    });
    (0, globals_1.describe)('Operation Tracking', () => {
        (0, globals_1.it)('should track single operation duration', () => {
            index_1.performanceMonitor.startOperation('test-op', 'computation');
            globals_1.jest.advanceTimersByTime(100);
            index_1.performanceMonitor.endOperation('test-op', 'computation');
            const metrics = index_1.performanceMonitor.getMetrics('computation');
            (0, globals_1.expect)(metrics.length).toBe(1);
            (0, globals_1.expect)(metrics[0].duration).toBeGreaterThanOrEqual(100);
        });
        (0, globals_1.it)('should handle concurrent operations', () => {
            index_1.performanceMonitor.startOperation('op1', 'network');
            globals_1.jest.advanceTimersByTime(50);
            index_1.performanceMonitor.startOperation('op2', 'network');
            globals_1.jest.advanceTimersByTime(100);
            index_1.performanceMonitor.endOperation('op1', 'network');
            globals_1.jest.advanceTimersByTime(50);
            index_1.performanceMonitor.endOperation('op2', 'network');
            const metrics = index_1.performanceMonitor.getMetrics('network');
            (0, globals_1.expect)(metrics.length).toBe(2);
            (0, globals_1.expect)(metrics[0].duration).toBeGreaterThanOrEqual(150);
            (0, globals_1.expect)(metrics[1].duration).toBeGreaterThanOrEqual(150);
        });
        (0, globals_1.it)('should track different operation types', () => {
            index_1.performanceMonitor.startOperation('render', 'render');
            globals_1.jest.advanceTimersByTime(16);
            index_1.performanceMonitor.endOperation('render', 'render');
            index_1.performanceMonitor.startOperation('fetch', 'network');
            globals_1.jest.advanceTimersByTime(200);
            index_1.performanceMonitor.endOperation('fetch', 'network');
            const renderMetrics = index_1.performanceMonitor.getMetrics('render');
            const networkMetrics = index_1.performanceMonitor.getMetrics('network');
            (0, globals_1.expect)(renderMetrics.length).toBe(1);
            (0, globals_1.expect)(networkMetrics.length).toBe(1);
        });
    });
    (0, globals_1.describe)('Performance Thresholds', () => {
        (0, globals_1.it)('should detect slow operations', () => {
            const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
            index_1.performanceMonitor.startOperation('slow-op', 'network');
            globals_1.jest.advanceTimersByTime(2000); // 2 seconds
            index_1.performanceMonitor.endOperation('slow-op', 'network');
            (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
            mockLogger.mockRestore();
        });
        (0, globals_1.it)('should respect custom thresholds', () => {
            const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
            index_1.performanceMonitor.setThreshold('render', 10);
            index_1.performanceMonitor.startOperation('render', 'render');
            globals_1.jest.advanceTimersByTime(20);
            index_1.performanceMonitor.endOperation('render', 'render');
            (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
            mockLogger.mockRestore();
        });
        (0, globals_1.it)('should not warn for operations within threshold', () => {
            const mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
            index_1.performanceMonitor.startOperation('fast-op', 'computation');
            globals_1.jest.advanceTimersByTime(50);
            index_1.performanceMonitor.endOperation('fast-op', 'computation');
            (0, globals_1.expect)(mockLogger).not.toHaveBeenCalled();
            mockLogger.mockRestore();
        });
    });
    (0, globals_1.describe)('Metric Analysis', () => {
        (0, globals_1.it)('should calculate average duration', () => {
            for (let i = 0; i < 5; i++) {
                index_1.performanceMonitor.startOperation('repeated-op', 'computation');
                globals_1.jest.advanceTimersByTime(100);
                index_1.performanceMonitor.endOperation('repeated-op', 'computation');
            }
            const metrics = index_1.performanceMonitor.getMetrics('computation');
            const average = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
            (0, globals_1.expect)(average).toBeGreaterThanOrEqual(100);
        });
        (0, globals_1.it)('should track operation metadata', () => {
            index_1.performanceMonitor.startOperation('op-with-meta', 'network');
            globals_1.jest.advanceTimersByTime(100);
            index_1.performanceMonitor.endOperation('op-with-meta', 'network', {
                url: 'https://api.example.com',
                method: 'GET'
            });
            const metrics = index_1.performanceMonitor.getMetrics('network');
            (0, globals_1.expect)(metrics[0].metadata).toEqual({
                url: 'https://api.example.com',
                method: 'GET'
            });
        });
        (0, globals_1.it)('should handle operation batches', () => {
            const operations = Array(10).fill(null).map((_, i) => ({
                name: `batch-op-${i}`,
                duration: 50 + Math.floor(Math.random() * 100)
            }));
            operations.forEach(op => {
                index_1.performanceMonitor.startOperation(op.name, 'computation');
                globals_1.jest.advanceTimersByTime(op.duration);
                index_1.performanceMonitor.endOperation(op.name, 'computation');
            });
            const metrics = index_1.performanceMonitor.getMetrics('computation');
            (0, globals_1.expect)(metrics.length).toBe(10);
        });
    });
    (0, globals_1.describe)('Resource Cleanup', () => {
        (0, globals_1.it)('should clear metrics', () => {
            index_1.performanceMonitor.startOperation('test', 'computation');
            globals_1.jest.advanceTimersByTime(100);
            index_1.performanceMonitor.endOperation('test', 'computation');
            index_1.performanceMonitor.clearMetrics();
            (0, globals_1.expect)(index_1.performanceMonitor.getMetrics().length).toBe(0);
        });
        (0, globals_1.it)('should handle incomplete operations', () => {
            index_1.performanceMonitor.startOperation('incomplete', 'network');
            globals_1.jest.advanceTimersByTime(100);
            // No endOperation call
            const metrics = index_1.performanceMonitor.getMetrics('network');
            (0, globals_1.expect)(metrics.length).toBe(0);
        });
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle invalid operation types', () => {
            (0, globals_1.expect)(() => {
                index_1.performanceMonitor.startOperation('test', 'invalid');
            }).toThrow();
        });
        (0, globals_1.it)('should handle ending non-existent operations', () => {
            (0, globals_1.expect)(() => {
                index_1.performanceMonitor.endOperation('non-existent', 'network');
            }).not.toThrow();
        });
        (0, globals_1.it)('should handle duplicate operation starts', () => {
            index_1.performanceMonitor.startOperation('duplicate', 'computation');
            (0, globals_1.expect)(() => {
                index_1.performanceMonitor.startOperation('duplicate', 'computation');
            }).not.toThrow();
        });
    });
});
