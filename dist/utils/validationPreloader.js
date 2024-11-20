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
exports.ValidationPreloader = void 0;
const validationCache_1 = require("./validationCache");
const asyncValidation_1 = require("./asyncValidation");
const formValidation_1 = require("./formValidation");
class ValidationPreloader {
    static preloadCommonValidations(configs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const config of configs) {
                const rules = formValidation_1.FormValidator.getFieldRules(config.fieldName, config.context);
                const asyncRules = asyncValidation_1.asyncValidationRules[config.fieldName] || [];
                // 分批处理以避免阻塞
                for (let i = 0; i < config.values.length; i += this.BATCH_SIZE) {
                    const batch = config.values.slice(i, i + this.BATCH_SIZE);
                    yield Promise.all(batch.map((value) => __awaiter(this, void 0, void 0, function* () {
                        const cacheKey = validationCache_1.validationCache.getCacheKey(config.fieldName, value, config.context);
                        // 如果缓存中已存在，跳过
                        if (validationCache_1.validationCache.get(cacheKey) !== null) {
                            return;
                        }
                        // 执行同步验证
                        const isValidSync = rules.every(rule => rule.test(value));
                        if (!isValidSync) {
                            const failedRule = rules.find(rule => !rule.test(value));
                            validationCache_1.validationCache.set(cacheKey, failedRule === null || failedRule === void 0 ? void 0 : failedRule.message, {
                                value,
                                context: config.context,
                            });
                            return;
                        }
                        // 执行异步验证
                        for (const rule of asyncRules) {
                            try {
                                const isValid = yield rule.validate(value, config.context);
                                if (!isValid) {
                                    validationCache_1.validationCache.set(cacheKey, rule.message, {
                                        value,
                                        context: config.context,
                                    });
                                    return;
                                }
                            }
                            catch (error) {
                                console.error('Async validation error during preload:', error);
                            }
                        }
                        // 所有验证通过
                        validationCache_1.validationCache.set(cacheKey, undefined, {
                            value,
                            context: config.context,
                        });
                    })));
                    // 添加延迟以避免过度占用资源
                    yield new Promise(resolve => setTimeout(resolve, this.BATCH_DELAY));
                }
            }
        });
    }
    // 预加载常见值范围
    static preloadCommonRanges() {
        const configs = [
            {
                fieldName: 'amount',
                values: [
                    '100000',
                    '500000',
                    '1000000',
                    '2000000',
                    '5000000',
                ],
            },
            {
                fieldName: 'rate',
                values: ['3.1', '3.5', '4.1', '4.5', '5.0'],
            },
            {
                fieldName: 'term',
                values: ['10', '15', '20', '25', '30'],
            },
        ];
        this.preloadCommonValidations(configs);
    }
}
exports.ValidationPreloader = ValidationPreloader;
ValidationPreloader.BATCH_SIZE = 10;
ValidationPreloader.BATCH_DELAY = 100;
