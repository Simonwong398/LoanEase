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
const index_1 = require("../index");
const perf_hooks_1 = require("perf_hooks");
const globals_1 = require("@jest/globals");
describe('NetworkManager', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
        index_1.networkManager.clearCache();
    });
    it('should make successful request', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockResponse = { data: 'test' };
        const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
            return new Response(JSON.stringify(mockResponse));
        }));
        global.fetch = mockFetch;
        const result = yield index_1.networkManager.request('https://api.test.com');
        expect(result).toEqual(mockResponse);
    }));
    describe('Performance Tests', () => {
        it('should handle concurrent requests efficiently', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { data: 'test' };
            const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
                return new Response(JSON.stringify(mockResponse));
            }));
            global.fetch = mockFetch;
            const startTime = perf_hooks_1.performance.now();
            const requests = Array(100).fill(null).map((_, index) => index_1.networkManager.request(`https://api.test.com/${index}`));
            yield Promise.all(requests);
            const endTime = perf_hooks_1.performance.now();
            expect(endTime - startTime).toBeLessThan(5000);
            expect(mockFetch).toHaveBeenCalledTimes(100);
        }));
        it('should handle large payloads efficiently', () => __awaiter(void 0, void 0, void 0, function* () {
            const largePayload = Array(1000).fill({ data: 'test' });
            const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
                return new Response(JSON.stringify(largePayload));
            }));
            global.fetch = mockFetch;
            const startTime = perf_hooks_1.performance.now();
            yield index_1.networkManager.request('https://api.test.com/large');
            const endTime = perf_hooks_1.performance.now();
            expect(endTime - startTime).toBeLessThan(1000);
        }));
    });
    describe('Concurrency Tests', () => {
        it('should handle race conditions correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockResponse = { data: 'test' };
            let requestCount = 0;
            const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
                requestCount++;
                return new Response(JSON.stringify(Object.assign(Object.assign({}, mockResponse), { count: requestCount })));
            }));
            global.fetch = mockFetch;
            const results = yield Promise.all([
                index_1.networkManager.request('https://api.test.com/1', { cacheKey: 'test' }),
                index_1.networkManager.request('https://api.test.com/1', { cacheKey: 'test' }),
            ]);
            expect(results[0]).toEqual(results[1]);
            expect(mockFetch).toHaveBeenCalledTimes(1);
        }));
        it('should retry failed requests', () => __awaiter(void 0, void 0, void 0, function* () {
            let attempts = 0;
            const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Network error');
                }
                return new Response(JSON.stringify({ success: true }));
            }));
            global.fetch = mockFetch;
            const result = yield index_1.networkManager.request('https://api.test.com', {
                retries: 3
            });
            expect(result).toEqual({ success: true });
            expect(attempts).toBe(3);
        }));
        it('should handle timeout correctly', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockFetch = globals_1.jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
                yield new Promise(resolve => setTimeout(resolve, 2000));
                return new Response();
            }));
            global.fetch = mockFetch;
            yield expect(index_1.networkManager.request('https://api.test.com', { timeout: 1000 })).rejects.toThrow('Request timeout');
        }));
    });
});
