"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useInputValidation = void 0;
const react_1 = require("react");
const useAppSettings_1 = require("./useAppSettings");
const useInputValidation = () => {
    const { settings } = (0, useAppSettings_1.useAppSettings)();
    const [errors, setErrors] = (0, react_1.useState)([]);
    const validateAmount = (0, react_1.useCallback)((amount) => {
        const value = parseFloat(amount);
        if (!amount) {
            setErrors(prev => [...prev, {
                    field: 'amount',
                    message: '请输入贷款金额'
                }]);
            return false;
        }
        if (isNaN(value) || value <= 0) {
            setErrors(prev => [...prev, {
                    field: 'amount',
                    message: '贷款金额必须大于0'
                }]);
            return false;
        }
        if (value > settings.calculator.maxLoanAmount) {
            setErrors(prev => [...prev, {
                    field: 'amount',
                    message: `贷款金额不能超过${settings.calculator.maxLoanAmount}元`
                }]);
            return false;
        }
        return true;
    }, [settings.calculator.maxLoanAmount]);
    const validateRate = (0, react_1.useCallback)((rate) => {
        const value = parseFloat(rate);
        if (!rate) {
            setErrors(prev => [...prev, {
                    field: 'rate',
                    message: '请输入年利率'
                }]);
            return false;
        }
        if (isNaN(value) || value <= 0) {
            setErrors(prev => [...prev, {
                    field: 'rate',
                    message: '年利率必须大于0'
                }]);
            return false;
        }
        if (value > 24) {
            setErrors(prev => [...prev, {
                    field: 'rate',
                    message: '年利率不能超过24%'
                }]);
            return false;
        }
        return true;
    }, []);
    const validateTerm = (0, react_1.useCallback)((term) => {
        const value = parseInt(term);
        if (!term) {
            setErrors(prev => [...prev, {
                    field: 'term',
                    message: '请输入贷款期限'
                }]);
            return false;
        }
        if (isNaN(value) || value <= 0) {
            setErrors(prev => [...prev, {
                    field: 'term',
                    message: '贷款期限必须大于0'
                }]);
            return false;
        }
        if (value > settings.calculator.maxTerm) {
            setErrors(prev => [...prev, {
                    field: 'term',
                    message: `贷款期限不能超过${settings.calculator.maxTerm}年`
                }]);
            return false;
        }
        return true;
    }, [settings.calculator.maxTerm]);
    const validateAll = (0, react_1.useCallback)((amount, rate, term) => {
        setErrors([]);
        const isAmountValid = validateAmount(amount);
        const isRateValid = validateRate(rate);
        const isTermValid = validateTerm(term);
        return isAmountValid && isRateValid && isTermValid;
    }, [validateAmount, validateRate, validateTerm]);
    const clearErrors = (0, react_1.useCallback)(() => {
        setErrors([]);
    }, []);
    const getFieldError = (0, react_1.useCallback)((field) => {
        var _a;
        return (_a = errors.find(error => error.field === field)) === null || _a === void 0 ? void 0 : _a.message;
    }, [errors]);
    return {
        errors,
        validateAmount,
        validateRate,
        validateTerm,
        validateAll,
        clearErrors,
        getFieldError,
    };
};
exports.useInputValidation = useInputValidation;
