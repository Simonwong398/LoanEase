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
exports.ValidationOptimizer = void 0;
const asyncValidation_1 = require("./asyncValidation");
const validationCache_1 = require("./validationCache");
class ValidationOptimizer {
    static validateValueWithRules(value, rules) {
        // 使用 every 代替 for 循环提高性能
        return rules.every(rule => rule.test(value));
    }
    static validateField(fieldName, value, rules, context) {
        return __awaiter(this, void 0, void 0, function* () {
            // 首先执行同步验证
            const isValidSync = this.validateValueWithRules(value, rules);
            if (!isValidSync) {
                const failedRule = rules.find(rule => !rule.test(value));
                return { isValid: false, error: failedRule === null || failedRule === void 0 ? void 0 : failedRule.message };
            }
            // 检查是否需要异步验证
            const asyncRules = asyncValidation_1.asyncValidationRules[fieldName];
            if (!(asyncRules === null || asyncRules === void 0 ? void 0 : asyncRules.length)) {
                return { isValid: true };
            }
            // 执行异步验证
            try {
                const error = yield (0, asyncValidation_1.executeAsyncValidation)(fieldName, value, context);
                return {
                    isValid: !error,
                    error,
                    asyncPending: false,
                };
            }
            catch (error) {
                console.error('Async validation error:', error);
                return {
                    isValid: false,
                    error: 'validation.error.async',
                    asyncPending: false,
                };
            }
        });
    }
    static validateFieldBatch(fields) {
        // 使用 Promise.all 并行执行所有验证
        return Promise.all(fields.map((_a) => __awaiter(this, [_a], void 0, function* ({ fieldName, value, rules, context }) {
            return ({
                fieldName,
                result: yield this.validateField(fieldName, value, rules, context),
            });
        }))).then(results => results.reduce((acc, { fieldName, result }) => (Object.assign(Object.assign({}, acc), { [fieldName]: result })), {}));
    }
    static preloadValidation(fieldName, value, rules, context) {
        // 预加载异步验证结果到缓存
        (0, asyncValidation_1.executeAsyncValidation)(fieldName, value, context).catch(() => {
            // 忽略预加载错误
        });
    }
    static clearValidationCache(fieldName) {
        if (fieldName) {
            validationCache_1.validationCache.invalidate(fieldName);
        }
        else {
            validationCache_1.validationCache.clear();
        }
    }
}
exports.ValidationOptimizer = ValidationOptimizer;
