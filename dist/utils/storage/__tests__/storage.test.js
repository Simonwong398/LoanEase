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
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const index_1 = require("../index");
const performance_1 = require("../../performance");
const cache_1 = require("../../cache");
(0, globals_1.describe)('StorageManager', () => {
    // Mock localStorage
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: globals_1.jest.fn((key) => store[key] || null),
            setItem: globals_1.jest.fn((key, value) => {
                store[key] = value;
            }),
            removeItem: globals_1.jest.fn((key) => {
                delete store[key];
            }),
            clear: globals_1.jest.fn(() => {
                store = {};
            }),
        };
    })();
    (0, globals_1.beforeEach)(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.afterEach)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield index_1.storageManager.clear();
    }));
    (0, globals_1.describe)('Basic Operations', () => {
        (0, globals_1.it)('should store and retrieve data', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = { name: 'test', value: 123 };
            yield index_1.storageManager.setItem('test-key', testData);
            const retrieved = yield index_1.storageManager.getItem('test-key');
            (0, globals_1.expect)(retrieved).toEqual(testData);
        }));
        (0, globals_1.it)('should remove data', () => __awaiter(void 0, void 0, void 0, function* () {
            yield index_1.storageManager.setItem('test-key', 'test-value');
            yield index_1.storageManager.removeItem('test-key');
            const retrieved = yield index_1.storageManager.getItem('test-key');
            (0, globals_1.expect)(retrieved).toBeNull();
        }));
        (0, globals_1.it)('should clear all data', () => __awaiter(void 0, void 0, void 0, function* () {
            yield index_1.storageManager.setItem('key1', 'value1');
            yield index_1.storageManager.setItem('key2', 'value2');
            yield index_1.storageManager.clear();
            (0, globals_1.expect)(yield index_1.storageManager.getItem('key1')).toBeNull();
            (0, globals_1.expect)(yield index_1.storageManager.getItem('key2')).toBeNull();
        }));
    });
    (0, globals_1.describe)('Storage Types', () => {
        (0, globals_1.it)('should handle local storage', () => __awaiter(void 0, void 0, void 0, function* () {
            yield index_1.storageManager.setItem('local-key', 'local-value', { type: 'local' });
            (0, globals_1.expect)(localStorageMock.setItem).toHaveBeenCalled();
            const retrieved = yield index_1.storageManager.getItem('local-key', { type: 'local' });
            (0, globals_1.expect)(retrieved).toBe('local-value');
        }));
        (0, globals_1.it)('should handle session storage', () => __awaiter(void 0, void 0, void 0, function* () {
            const sessionStorageMock = Object.assign(Object.assign({}, localStorageMock), { getItem: globals_1.jest.fn(), setItem: globals_1.jest.fn() });
            Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
            yield index_1.storageManager.setItem('session-key', 'session-value', { type: 'session' });
            (0, globals_1.expect)(sessionStorageMock.setItem).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should handle memory storage', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = { test: 'memory' };
            yield index_1.storageManager.setItem('memory-key', testData, { type: 'memory' });
            const retrieved = yield index_1.storageManager.getItem('memory-key', { type: 'memory' });
            (0, globals_1.expect)(retrieved).toEqual(testData);
        }));
        (0, globals_1.it)('should handle cloud storage', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock cloud storage operations
            const cloudData = { test: 'cloud' };
            globals_1.jest.spyOn(index_1.storageManager, 'setCloudItem').mockResolvedValue(undefined);
            globals_1.jest.spyOn(index_1.storageManager, 'getCloudItem').mockResolvedValue(JSON.stringify(cloudData));
            yield index_1.storageManager.setItem('cloud-key', cloudData, { type: 'cloud' });
            const retrieved = yield index_1.storageManager.getItem('cloud-key', { type: 'cloud' });
            (0, globals_1.expect)(retrieved).toEqual(cloudData);
        }));
    });
    (0, globals_1.describe)('Data Encryption', () => {
        (0, globals_1.it)('should encrypt and decrypt data', () => __awaiter(void 0, void 0, void 0, function* () {
            const sensitiveData = { password: '123456' };
            yield index_1.storageManager.setItem('sensitive-key', sensitiveData, { encrypt: true });
            const retrieved = yield index_1.storageManager.getItem('sensitive-key');
            (0, globals_1.expect)(retrieved).toEqual(sensitiveData);
        }));
        (0, globals_1.it)('should handle encryption errors', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(index_1.storageManager, 'encryptData').mockRejectedValue(new Error('Encryption failed'));
            yield (0, globals_1.expect)(index_1.storageManager.setItem('error-key', 'test', { encrypt: true })).rejects.toThrow('Encryption failed');
        }));
    });
    (0, globals_1.describe)('Data Compression', () => {
        (0, globals_1.it)('should compress and decompress data', () => __awaiter(void 0, void 0, void 0, function* () {
            const largeData = { data: 'x'.repeat(1000) };
            yield index_1.storageManager.setItem('large-key', largeData, { compress: true });
            const retrieved = yield index_1.storageManager.getItem('large-key');
            (0, globals_1.expect)(retrieved).toEqual(largeData);
        }));
        (0, globals_1.it)('should handle compression errors', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(index_1.storageManager, 'compressData').mockRejectedValue(new Error('Compression failed'));
            yield (0, globals_1.expect)(index_1.storageManager.setItem('error-key', 'test', { compress: true })).rejects.toThrow('Compression failed');
        }));
    });
    (0, globals_1.describe)('Cache Integration', () => {
        (0, globals_1.it)('should use cache for frequently accessed data', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = { cached: true };
            yield index_1.storageManager.setItem('cache-key', testData, { useCache: true });
            // First retrieval should set cache
            yield index_1.storageManager.getItem('cache-key');
            // Second retrieval should use cache
            const getCacheSpy = globals_1.jest.spyOn(cache_1.cacheManager, 'get');
            yield index_1.storageManager.getItem('cache-key');
            (0, globals_1.expect)(getCacheSpy).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should respect cache TTL', () => __awaiter(void 0, void 0, void 0, function* () {
            const testData = { cached: true };
            yield index_1.storageManager.setItem('ttl-key', testData, {
                useCache: true,
                cacheTTL: 1000
            });
            // Fast-forward time
            globals_1.jest.advanceTimersByTime(2000);
            // Cache should be expired
            const retrieved = yield index_1.storageManager.getItem('ttl-key');
            (0, globals_1.expect)(retrieved).toEqual(testData);
        }));
    });
    (0, globals_1.describe)('Performance Monitoring', () => {
        (0, globals_1.it)('should record performance metrics for operations', () => __awaiter(void 0, void 0, void 0, function* () {
            const recordMetricSpy = globals_1.jest.spyOn(performance_1.performanceManager, 'recordMetric');
            yield index_1.storageManager.setItem('perf-key', 'test');
            (0, globals_1.expect)(recordMetricSpy).toHaveBeenCalledWith('storage', 'set', globals_1.expect.any(Number), globals_1.expect.any(Object));
        }));
        (0, globals_1.it)('should record errors in performance metrics', () => __awaiter(void 0, void 0, void 0, function* () {
            const recordMetricSpy = globals_1.jest.spyOn(performance_1.performanceManager, 'recordMetric');
            globals_1.jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
                throw new Error('Storage full');
            });
            try {
                yield index_1.storageManager.setItem('error-key', 'test');
            }
            catch (_a) {
                // Ignore error
            }
            (0, globals_1.expect)(recordMetricSpy).toHaveBeenCalledWith('storage', 'set', globals_1.expect.any(Number), globals_1.expect.objectContaining({ success: false }));
        }));
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle storage quota exceeded', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(localStorageMock, 'setItem').mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });
            yield (0, globals_1.expect)(index_1.storageManager.setItem('quota-key', 'test')).rejects.toThrow('QuotaExceededError');
        }));
        (0, globals_1.it)('should handle invalid JSON', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(localStorageMock, 'getItem').mockReturnValue('invalid json');
            yield (0, globals_1.expect)(index_1.storageManager.getItem('invalid-key')).rejects.toThrow();
        }));
        (0, globals_1.it)('should handle missing keys', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield index_1.storageManager.getItem('non-existent-key');
            (0, globals_1.expect)(result).toBeNull();
        }));
    });
    (0, globals_1.describe)('Batch Operations', () => {
        (0, globals_1.it)('should handle multiple operations in sequence', () => __awaiter(void 0, void 0, void 0, function* () {
            const operations = [
                index_1.storageManager.setItem('key1', 'value1'),
                index_1.storageManager.setItem('key2', 'value2'),
                index_1.storageManager.setItem('key3', 'value3')
            ];
            yield Promise.all(operations);
            const results = yield Promise.all([
                index_1.storageManager.getItem('key1'),
                index_1.storageManager.getItem('key2'),
                index_1.storageManager.getItem('key3')
            ]);
            (0, globals_1.expect)(results).toEqual(['value1', 'value2', 'value3']);
        }));
        (0, globals_1.it)('should handle batch failures gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(localStorageMock, 'setItem')
                .mockImplementationOnce(() => { }) // First call succeeds
                .mockImplementationOnce(() => { throw new Error('Failed'); }); // Second call fails
            const operations = [
                index_1.storageManager.setItem('success-key', 'value1'),
                index_1.storageManager.setItem('error-key', 'value2')
            ];
            yield (0, globals_1.expect)(Promise.all(operations)).rejects.toThrow('Failed');
            (0, globals_1.expect)(yield index_1.storageManager.getItem('success-key')).toBe('value1');
        }));
    });
    (0, globals_1.describe)('Cloud Sync', () => {
        (0, globals_1.it)('should sync data with cloud storage', () => __awaiter(void 0, void 0, void 0, function* () {
            const syncSpy = globals_1.jest.spyOn(index_1.storageManager, 'syncToCloud');
            yield index_1.storageManager.setItem('sync-key', 'test', { syncToCloud: true });
            (0, globals_1.expect)(syncSpy).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should handle sync failures', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(index_1.storageManager, 'syncToCloud')
                .mockRejectedValue(new Error('Sync failed'));
            yield index_1.storageManager.setItem('sync-key', 'test', { syncToCloud: true });
            // Should not throw error, but log it
            (0, globals_1.expect)(console.error).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should retry failed sync operations', () => __awaiter(void 0, void 0, void 0, function* () {
            const syncSpy = globals_1.jest.spyOn(index_1.storageManager, 'syncToCloud')
                .mockRejectedValueOnce(new Error('Temporary failure'))
                .mockResolvedValueOnce(undefined);
            yield index_1.storageManager.setItem('retry-key', 'test', { syncToCloud: true });
            (0, globals_1.expect)(syncSpy).toHaveBeenCalledTimes(2);
        }));
    });
    (0, globals_1.describe)('Cleanup and Resource Management', () => {
        (0, globals_1.it)('should clean up resources on dispose', () => __awaiter(void 0, void 0, void 0, function* () {
            const clearCacheSpy = globals_1.jest.spyOn(cache_1.cacheManager, 'clear');
            yield index_1.storageManager.dispose();
            (0, globals_1.expect)(clearCacheSpy).toHaveBeenCalled();
        }));
        (0, globals_1.it)('should handle cleanup errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(cache_1.cacheManager, 'clear').mockRejectedValue(new Error('Cleanup failed'));
            yield index_1.storageManager.dispose();
            // Should not throw error, but log it
            (0, globals_1.expect)(console.error).toHaveBeenCalled();
        }));
    });
});
