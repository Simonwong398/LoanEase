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
exports.performCalculation = void 0;
const retryMechanism_1 = require("./retryMechanism");
const performanceMonitor_1 = require("./performanceMonitor");
const errorManager_1 = require("./errorManager");
const performCalculation = (calculation, operationName) => __awaiter(void 0, void 0, void 0, function* () {
    const perfId = performanceMonitor_1.performanceMonitor.startOperation(operationName);
    try {
        const result = yield (0, retryMechanism_1.calculateWithRetry)(calculation, (attempt, error) => {
            console.warn(`Retry attempt ${attempt} for ${operationName}:`, error.message);
        });
        performanceMonitor_1.performanceMonitor.endOperation(perfId, true);
        return result;
    }
    catch (error) {
        performanceMonitor_1.performanceMonitor.endOperation(perfId, false, error.message);
        errorManager_1.errorManager.handleError(error);
        throw error;
    }
});
exports.performCalculation = performCalculation;
