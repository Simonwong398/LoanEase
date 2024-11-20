"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.securityManager = exports.ThreatLevel = exports.SecurityLevel = void 0;
const logger_1 = require("../logger");
const performance_1 = require("../performance");
const crypto = __importStar(require("crypto"));
// 安全级别定义
var SecurityLevel;
(function (SecurityLevel) {
    SecurityLevel["LOW"] = "low";
    SecurityLevel["MEDIUM"] = "medium";
    SecurityLevel["HIGH"] = "high";
    SecurityLevel["CRITICAL"] = "critical";
})(SecurityLevel || (exports.SecurityLevel = SecurityLevel = {}));
// 威胁级别定义
var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel["INFO"] = "info";
    ThreatLevel["LOW"] = "low";
    ThreatLevel["MEDIUM"] = "medium";
    ThreatLevel["HIGH"] = "high";
    ThreatLevel["CRITICAL"] = "critical";
})(ThreatLevel || (exports.ThreatLevel = ThreatLevel = {}));
class SecurityManager {
    constructor() {
        this.validationRules = new Map();
        this.threatModels = new Map();
        this.securityScans = [];
        this.activeThreats = new Set();
        this.initializeSecurityControls();
    }
    static getInstance() {
        if (!SecurityManager.instance) {
            SecurityManager.instance = new SecurityManager();
        }
        return SecurityManager.instance;
    }
    // 数据验证
    validateData(data, schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            const errors = [];
            try {
                for (const [key, rule] of Object.entries(schema)) {
                    const value = data[key];
                    // 必填检查
                    if (rule.required && (value === undefined || value === null)) {
                        errors.push(`${key} is required`);
                        continue;
                    }
                    if (value === undefined || value === null) {
                        continue;
                    }
                    // 类型检查
                    if (typeof value !== rule.type && rule.type !== 'array') {
                        errors.push(`${key} should be of type ${rule.type}`);
                        continue;
                    }
                    // 字符串规则
                    if (rule.type === 'string') {
                        if (rule.minLength && value.length < rule.minLength) {
                            errors.push(`${key} should be at least ${rule.minLength} characters`);
                        }
                        if (rule.maxLength && value.length > rule.maxLength) {
                            errors.push(`${key} should be at most ${rule.maxLength} characters`);
                        }
                        if (rule.pattern && !rule.pattern.test(value)) {
                            errors.push(`${key} does not match required pattern`);
                        }
                    }
                    // 数字规则
                    if (rule.type === 'number') {
                        if (rule.min !== undefined && value < rule.min) {
                            errors.push(`${key} should be at least ${rule.min}`);
                        }
                        if (rule.max !== undefined && value > rule.max) {
                            errors.push(`${key} should be at most ${rule.max}`);
                        }
                    }
                    // 枚举检查
                    if (rule.enum && !rule.enum.includes(value)) {
                        errors.push(`${key} should be one of: ${rule.enum.join(', ')}`);
                    }
                    // 自定义验证
                    if (rule.custom && !rule.custom(value)) {
                        errors.push(`${key} failed custom validation`);
                    }
                }
                yield performance_1.performanceManager.recordMetric('security', 'validation', performance.now() - startTime, {
                    valid: errors.length === 0,
                    errorCount: errors.length
                });
                return {
                    valid: errors.length === 0,
                    errors
                };
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('SecurityManager', 'Validation failed', actualError);
                throw actualError;
            }
        });
    }
    // 安全扫描
    performSecurityScan(target_1) {
        return __awaiter(this, arguments, void 0, function* (target, options = {}) {
            const startTime = performance.now();
            try {
                const vulnerabilities = yield this.scanForVulnerabilities(target, options);
                const threatLevel = this.calculateThreatLevel(vulnerabilities);
                const recommendations = this.generateRecommendations(vulnerabilities);
                const result = {
                    timestamp: Date.now(),
                    threatLevel,
                    vulnerabilities,
                    recommendations
                };
                this.securityScans.push(result);
                yield performance_1.performanceManager.recordMetric('security', 'scan', performance.now() - startTime, {
                    target,
                    threatLevel,
                    vulnerabilitiesFound: vulnerabilities.length
                });
                return result;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('SecurityManager', 'Security scan failed', actualError);
                throw actualError;
            }
        });
    }
    // 威胁建模
    createThreatModel(assetId, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = performance.now();
            try {
                const threatModel = Object.assign(Object.assign({}, model), { assets: model.assets.map(asset => (Object.assign(Object.assign({}, asset), { id: asset.id || crypto.randomUUID() }))), threats: model.threats.map(threat => (Object.assign(Object.assign({}, threat), { id: threat.id || crypto.randomUUID() }))), controls: model.controls.map(control => (Object.assign(Object.assign({}, control), { id: control.id || crypto.randomUUID() }))) });
                this.threatModels.set(assetId, threatModel);
                yield performance_1.performanceManager.recordMetric('security', 'threatModel', performance.now() - startTime, {
                    assetId,
                    threatsCount: threatModel.threats.length,
                    controlsCount: threatModel.controls.length
                });
                return threatModel;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('SecurityManager', 'Failed to create threat model', actualError);
                throw actualError;
            }
        });
    }
    // 安全测试
    runSecurityTests(tests) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            const startTime = performance.now();
            try {
                for (const test of tests) {
                    const testStartTime = performance.now();
                    let passed = false;
                    try {
                        passed = yield test.run();
                    }
                    catch (error) {
                        const actualError = error instanceof Error ? error : new Error(String(error));
                        logger_1.logger.error('SecurityManager', `Security test "${test.name}" failed`, actualError);
                    }
                    results.push({
                        name: test.name,
                        passed,
                        severity: test.severity,
                        duration: performance.now() - testStartTime
                    });
                }
                yield performance_1.performanceManager.recordMetric('security', 'tests', performance.now() - startTime, {
                    totalTests: tests.length,
                    passedTests: results.filter(r => r.passed).length
                });
                return results;
            }
            catch (error) {
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('SecurityManager', 'Security tests failed', actualError);
                throw actualError;
            }
        });
    }
    scanForVulnerabilities(target, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现漏洞扫描逻辑
            return [];
        });
    }
    calculateThreatLevel(vulnerabilities) {
        if (vulnerabilities.some(v => v.severity === SecurityLevel.CRITICAL)) {
            return ThreatLevel.CRITICAL;
        }
        if (vulnerabilities.some(v => v.severity === SecurityLevel.HIGH)) {
            return ThreatLevel.HIGH;
        }
        if (vulnerabilities.some(v => v.severity === SecurityLevel.MEDIUM)) {
            return ThreatLevel.MEDIUM;
        }
        if (vulnerabilities.some(v => v.severity === SecurityLevel.LOW)) {
            return ThreatLevel.LOW;
        }
        return ThreatLevel.INFO;
    }
    generateRecommendations(vulnerabilities) {
        // 实现建议生成逻辑
        return [];
    }
    initializeSecurityControls() {
        // 实现安全控制初始化逻辑
    }
}
SecurityManager.instance = null;
exports.securityManager = SecurityManager.getInstance();
