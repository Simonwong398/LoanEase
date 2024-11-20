"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
(0, globals_1.describe)('MemoryMonitor', () => {
    let mockMemoryUsage;
    let mockLogger;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.useFakeTimers();
        mockLogger = globals_1.jest.spyOn(console, 'warn').mockImplementation(() => { });
        mockMemoryUsage = globals_1.jest.spyOn(process, 'memoryUsage').mockReturnValue({
            heapUsed: 50 * 1024 * 1024, // 50MB
            heapTotal: 100 * 1024 * 1024,
            external: 0,
            arrayBuffers: 0,
            rss: 200 * 1024 * 1024,
        });
    });
    (0, globals_1.afterEach)(() => {
        globals_1.jest.useRealTimers();
        mockLogger.mockRestore();
        mockMemoryUsage.mockRestore();
        index_1.memoryMonitor.dispose();
    });
    (0, globals_1.describe)('Memory Snapshots', () => {
        (0, globals_1.it)('should take memory snapshots at regular intervals', () => {
            globals_1.jest.advanceTimersByTime(60000); // 1 minute
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.length).toBeGreaterThan(0);
            (0, globals_1.expect)(snapshots[0]).toHaveProperty('heapUsed');
            (0, globals_1.expect)(snapshots[0]).toHaveProperty('timestamp');
        });
        (0, globals_1.it)('should limit the number of snapshots', () => {
            // Advance time to accumulate many snapshots
            for (let i = 0; i < 200; i++) {
                globals_1.jest.advanceTimersByTime(60000);
            }
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.length).toBeLessThanOrEqual(100); // Max snapshots
        });
        (0, globals_1.it)('should record accurate memory values', () => {
            const heapUsed = 75 * 1024 * 1024; // 75MB
            mockMemoryUsage.mockReturnValue({
                heapUsed,
                heapTotal: 100 * 1024 * 1024,
                external: 0,
                arrayBuffers: 0,
                rss: 200 * 1024 * 1024,
            });
            globals_1.jest.advanceTimersByTime(60000);
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots[snapshots.length - 1].heapUsed).toBe(heapUsed);
        });
    });
    (0, globals_1.describe)('Memory Leak Detection', () => {
        (0, globals_1.it)('should detect steady memory growth', () => {
            for (let i = 0; i < 5; i++) {
                mockMemoryUsage.mockReturnValue({
                    heapUsed: (50 + i * 20) * 1024 * 1024, // Increasing memory usage
                    heapTotal: 200 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 300 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(60000);
            }
            (0, globals_1.expect)(mockLogger).toHaveBeenCalledWith(globals_1.expect.stringContaining('memory growth'), globals_1.expect.any(Object));
        });
        (0, globals_1.it)('should not report normal memory fluctuations', () => {
            for (let i = 0; i < 5; i++) {
                mockMemoryUsage.mockReturnValue({
                    heapUsed: (50 + Math.sin(i) * 5) * 1024 * 1024, // Normal fluctuation
                    heapTotal: 200 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 300 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(60000);
            }
            (0, globals_1.expect)(mockLogger).not.toHaveBeenCalled();
        });
    });
    (0, globals_1.describe)('High Memory Usage Alerts', () => {
        (0, globals_1.it)('should alert on high memory usage', () => {
            mockMemoryUsage.mockReturnValue({
                heapUsed: 150 * 1024 * 1024, // 150MB
                heapTotal: 200 * 1024 * 1024,
                external: 0,
                arrayBuffers: 0,
                rss: 300 * 1024 * 1024,
            });
            globals_1.jest.advanceTimersByTime(60000);
            (0, globals_1.expect)(mockLogger).toHaveBeenCalledWith(globals_1.expect.stringContaining('High memory usage'), globals_1.expect.any(Object));
        });
        (0, globals_1.it)('should track memory usage over time', () => {
            const usageValues = [80, 90, 100, 95, 85].map(mb => mb * 1024 * 1024);
            usageValues.forEach(heapUsed => {
                mockMemoryUsage.mockReturnValue({
                    heapUsed,
                    heapTotal: 200 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 300 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(60000);
            });
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.map(s => s.heapUsed)).toEqual(usageValues);
        });
    });
    (0, globals_1.describe)('Resource Management', () => {
        (0, globals_1.it)('should clean up resources on dispose', () => {
            globals_1.jest.advanceTimersByTime(60000);
            index_1.memoryMonitor.dispose();
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.length).toBe(0);
        });
        (0, globals_1.it)('should handle rapid snapshot requests', () => {
            // Simulate rapid memory usage changes
            for (let i = 0; i < 100; i++) {
                mockMemoryUsage.mockReturnValue({
                    heapUsed: 50 * 1024 * 1024,
                    heapTotal: 100 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 200 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(1000); // 1 second intervals
            }
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.length).toBeLessThanOrEqual(100);
        });
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle memory usage errors', () => {
            mockMemoryUsage.mockImplementation(() => {
                throw new Error('Memory usage error');
            });
            globals_1.jest.advanceTimersByTime(60000);
            (0, globals_1.expect)(mockLogger).toHaveBeenCalled();
        });
        (0, globals_1.it)('should continue monitoring after errors', () => {
            // First cause an error
            mockMemoryUsage.mockImplementationOnce(() => {
                throw new Error('Memory usage error');
            });
            globals_1.jest.advanceTimersByTime(60000);
            // Then return to normal
            mockMemoryUsage.mockReturnValue({
                heapUsed: 50 * 1024 * 1024,
                heapTotal: 100 * 1024 * 1024,
                external: 0,
                arrayBuffers: 0,
                rss: 200 * 1024 * 1024,
            });
            globals_1.jest.advanceTimersByTime(60000);
            const snapshots = index_1.memoryMonitor.getSnapshots();
            (0, globals_1.expect)(snapshots.length).toBeGreaterThan(0);
        });
    });
    (0, globals_1.describe)('Analysis Features', () => {
        (0, globals_1.it)('should calculate memory growth rate', () => {
            const growthRates = [];
            for (let i = 0; i < 5; i++) {
                mockMemoryUsage.mockReturnValue({
                    heapUsed: (50 + i * 10) * 1024 * 1024,
                    heapTotal: 200 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 300 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(60000);
                const snapshots = index_1.memoryMonitor.getSnapshots();
                if (snapshots.length >= 2) {
                    const latest = snapshots[snapshots.length - 1];
                    const previous = snapshots[snapshots.length - 2];
                    const growthRate = (latest.heapUsed - previous.heapUsed) / previous.heapUsed;
                    growthRates.push(growthRate);
                }
            }
            (0, globals_1.expect)(growthRates.length).toBeGreaterThan(0);
            (0, globals_1.expect)(Math.max(...growthRates)).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should identify memory usage patterns', () => {
            // Simulate a sawtooth pattern
            for (let i = 0; i < 10; i++) {
                mockMemoryUsage.mockReturnValue({
                    heapUsed: (50 + (i % 2) * 20) * 1024 * 1024, // Alternating between 50MB and 70MB
                    heapTotal: 100 * 1024 * 1024,
                    external: 0,
                    arrayBuffers: 0,
                    rss: 200 * 1024 * 1024,
                });
                globals_1.jest.advanceTimersByTime(60000);
            }
            const snapshots = index_1.memoryMonitor.getSnapshots();
            const usages = snapshots.map(s => s.heapUsed);
            // Check for alternating pattern
            for (let i = 2; i < usages.length; i++) {
                (0, globals_1.expect)(usages[i]).toBe(usages[i - 2]);
            }
        });
    });
});
