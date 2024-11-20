"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorManager = void 0;
class ErrorManager {
    constructor() {
        this.errors = [];
    }
    static getInstance() {
        if (!ErrorManager.instance) {
            ErrorManager.instance = new ErrorManager();
        }
        return ErrorManager.instance;
    }
    handleError(error, context) {
        console.error('Error occurred:', error, context);
        this.errors.push(error);
        // 可以添加更多错误处理逻辑
    }
    getErrors() {
        return [...this.errors];
    }
    clearErrors() {
        this.errors = [];
    }
}
exports.errorManager = ErrorManager.getInstance();
