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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressionService = void 0;
const zlib_1 = require("zlib");
const util_1 = require("util");
const stream_1 = require("stream");
const pipelineAsync = (0, util_1.promisify)(stream_1.pipeline);
class CompressionService {
    // 压缩数据
    compress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const originalSize = data.length;
            try {
                const compressed = yield this.gzipCompress(data);
                const duration = Date.now() - startTime;
                const stats = {
                    originalSize,
                    compressedSize: compressed.length,
                    compressionRatio: compressed.length / originalSize,
                    duration
                };
                return { compressed, stats };
            }
            catch (error) {
                throw new Error(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    // 解压数据
    decompress(compressed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.gzipDecompress(compressed);
            }
            catch (error) {
                throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    gzipCompress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const chunks = [];
            yield pipelineAsync(Buffer.from(data), (0, zlib_1.createGzip)(), function (source) {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_1, _b, _c;
                    try {
                        for (var _d = true, source_1 = __asyncValues(source), source_1_1; source_1_1 = yield __await(source_1.next()), _a = source_1_1.done, !_a; _d = true) {
                            _c = source_1_1.value;
                            _d = false;
                            const chunk = _c;
                            chunks.push(Buffer.from(chunk));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = source_1.return)) yield __await(_b.call(source_1));
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                });
            });
            return Buffer.concat(chunks);
        });
    }
    gzipDecompress(compressed) {
        return __awaiter(this, void 0, void 0, function* () {
            const chunks = [];
            yield pipelineAsync(Buffer.from(compressed), (0, zlib_1.createGunzip)(), function (source) {
                return __asyncGenerator(this, arguments, function* () {
                    var _a, e_2, _b, _c;
                    try {
                        for (var _d = true, source_2 = __asyncValues(source), source_2_1; source_2_1 = yield __await(source_2.next()), _a = source_2_1.done, !_a; _d = true) {
                            _c = source_2_1.value;
                            _d = false;
                            const chunk = _c;
                            chunks.push(Buffer.from(chunk));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = source_2.return)) yield __await(_b.call(source_2));
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                });
            });
            return Buffer.concat(chunks);
        });
    }
}
exports.CompressionService = CompressionService;
