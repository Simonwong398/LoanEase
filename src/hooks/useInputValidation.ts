import { useState, useCallback } from 'react';
import { useAppSettings } from './useAppSettings';

interface ValidationError {
  field: string;
  message: string;
}

export const useInputValidation = () => {
  const { settings } = useAppSettings();
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateAmount = useCallback((amount: string): boolean => {
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

  const validateRate = useCallback((rate: string): boolean => {
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

  const validateTerm = useCallback((term: string): boolean => {
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

  const validateAll = useCallback((amount: string, rate: string, term: string): boolean => {
    setErrors([]);
    const isAmountValid = validateAmount(amount);
    const isRateValid = validateRate(rate);
    const isTermValid = validateTerm(term);
    return isAmountValid && isRateValid && isTermValid;
  }, [validateAmount, validateRate, validateTerm]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
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