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
const react_1 = __importStar(require("react"));
const security_1 = require("../../utils/security");
const errors_1 = require("../../types/errors");
const concurrency_1 = require("../../utils/concurrency");
const timeout_1 = require("../../utils/timeout");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../utils/i18n");
// 使用 AppError 创建本地 ValidationError，而不是导入
class ValidationError extends errors_1.AppError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
const ComparisonChart = ({ data, comparisonData, onError, }) => {
    const [error, setError] = (0, react_1.useState)(null);
    const concurrencyManager = (0, react_1.useMemo)(() => new concurrency_1.ConcurrencyManager(2), []);
    const VALIDATION_TIMEOUT = 5000; // 5 seconds
    const handleError = (0, react_1.useCallback)((err) => {
        logger_1.logger.error('ComparisonChart', 'Error in chart processing', err);
        setError(err);
        onError === null || onError === void 0 ? void 0 : onError(err);
    }, [onError]);
    // 先定义验证函数
    const validateAndSanitizeData = (0, react_1.useCallback)((chartData) => {
        var _a, _b;
        if (!chartData || typeof chartData !== 'object') {
            throw new ValidationError('Invalid chart data format');
        }
        const unvalidatedData = chartData;
        return {
            labels: ((_a = unvalidatedData.labels) === null || _a === void 0 ? void 0 : _a.map(label => (0, security_1.sanitizeData)(label))) || [],
            datasets: ((_b = unvalidatedData.datasets) === null || _b === void 0 ? void 0 : _b.map(dataset => {
                var _a;
                return ({
                    data: ((_a = dataset.data) === null || _a === void 0 ? void 0 : _a.map(value => Number(value))) || [],
                    label: (0, security_1.sanitizeData)(dataset.label || ''),
                    color: dataset.color ? (0, security_1.sanitizeData)(dataset.color) : undefined
                });
            })) || []
        };
    }, []);
    // 然后使用验证函数
    const processedData = (0, react_1.useMemo)(() => {
        try {
            return (0, timeout_1.withTimeout)(concurrencyManager.add(() => __awaiter(void 0, void 0, void 0, function* () {
                const validatedData = validateAndSanitizeData(data);
                return validatedData;
            })), VALIDATION_TIMEOUT, 'Data validation');
        }
        catch (err) {
            handleError(err instanceof Error ? err : new Error(String(err)));
            return null;
        }
    }, [data, validateAndSanitizeData, handleError, concurrencyManager]);
    (0, react_1.useEffect)(() => {
        logger_1.logger.info('ComparisonChart', 'Initializing chart', {
            hasComparisonData: !!comparisonData
        });
        const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (processedData) {
                    yield (0, timeout_1.withTimeout)(processedData, VALIDATION_TIMEOUT, 'Data processing');
                }
                if (comparisonData) {
                    yield (0, timeout_1.withTimeout)(concurrencyManager.add(() => __awaiter(void 0, void 0, void 0, function* () {
                        validateAndSanitizeData(comparisonData);
                    })), VALIDATION_TIMEOUT, 'Comparison data validation');
                }
            }
            catch (err) {
                logger_1.logger.error('ComparisonChart', 'Initialization failed', err instanceof Error ? err : new Error(String(err)));
                handleError(err instanceof Error ? err : new Error(String(err)));
            }
        });
        initialize();
    }, [processedData, comparisonData, validateAndSanitizeData, handleError, concurrencyManager]);
    if (error) {
        return (<div role="alert" aria-live="polite">
        <h3>{i18n_1.i18nManager.translate('common.error')}</h3>
        <p>{error.message}</p>
      </div>);
    }
    if (!data) {
        return <div>{i18n_1.i18nManager.translate('chart.noData')}</div>;
    }
    // ... 渲染逻辑
};
exports.default = react_1.default.memo(ComparisonChart);
