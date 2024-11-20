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
exports.errorRecoveryManager = void 0;
class ErrorRecoveryManager {
    constructor() {
        this.errorStates = new Map();
        this.strategies = new Map();
        this.initializeDefaultStrategies();
    }
    static getInstance() {
        if (!ErrorRecoveryManager.instance) {
            ErrorRecoveryManager.instance = new ErrorRecoveryManager();
        }
        return ErrorRecoveryManager.instance;
    }
    initializeDefaultStrategies() {
        this.strategies.set('default', {
            maxRetries: 3,
            backoffMs: 1000,
            backoffMultiplier: 2,
            shouldRetry: () => true,
        });
        this.strategies.set('network', {
            maxRetries: 5,
            backoffMs: 2000,
            backoffMultiplier: 1.5,
            shouldRetry: (error) => error.name === 'NetworkError',
        });
        this.strategies.set('calculation', {
            maxRetries: 2,
            backoffMs: 500,
            backoffMultiplier: 2,
            shouldRetry: (error) => error.name === 'CalculationError',
        });
    }
    handleError(operationId, error, context, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorState = this.getOrCreateErrorState(operationId, error, context);
            const strategy = this.getStrategy(error);
            if (errorState.retryCount < strategy.maxRetries &&
                strategy.shouldRetry(error)) {
                const backoffTime = strategy.backoffMs * Math.pow(strategy.backoffMultiplier, errorState.retryCount);
                yield new Promise(resolve => setTimeout(resolve, backoffTime));
                errorState.retryCount++;
                try {
                    const result = yield operation();
                    this.clearError(operationId);
                    return result;
                }
                catch (retryError) {
                    return this.handleError(operationId, retryError, context, operation);
                }
            }
            throw error;
        });
    }
    getOrCreateErrorState(operationId, error, context) {
        let state = this.errorStates.get(operationId);
        if (!state) {
            state = {
                error,
                context,
                timestamp: Date.now(),
                retryCount: 0,
            };
            this.errorStates.set(operationId, state);
        }
        return state;
    }
    getStrategy(error) {
        for (const [, strategy] of this.strategies) {
            if (strategy.shouldRetry(error)) {
                return strategy;
            }
        }
        return this.strategies.get('default');
    }
    clearError(operationId) {
        this.errorStates.delete(operationId);
    }
    addStrategy(name, strategy) {
        this.strategies.set(name, strategy);
    }
}
exports.errorRecoveryManager = ErrorRecoveryManager.getInstance();
