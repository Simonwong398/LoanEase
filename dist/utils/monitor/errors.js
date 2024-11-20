"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitorError = exports.ErrorCodes = void 0;
// 错误码和对应的用户提示
exports.ErrorCodes = {
    // 验证错误
    VALIDATION_ERROR: {
        code: 'VALIDATION_ERROR',
        message: '输入数据验证失败',
        suggestion: '请检查输入数据是否符合要求',
        docs: 'https://docs.example.com/validation'
    },
    // 网络错误
    NETWORK_ERROR: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败',
        suggestion: '请检查网络连接并重试',
        docs: 'https://docs.example.com/network'
    },
    // 权限错误
    PERMISSION_ERROR: {
        code: 'PERMISSION_ERROR',
        message: '权限不足',
        suggestion: '请确认是否有足够的权限',
        docs: 'https://docs.example.com/permissions'
    },
    // 资源错误
    RESOURCE_ERROR: {
        code: 'RESOURCE_ERROR',
        message: '资源访问失败',
        suggestion: '请检查系统资源是否充足',
        docs: 'https://docs.example.com/resources'
    },
    // 业务错误
    BUSINESS_ERROR: {
        code: 'BUSINESS_ERROR',
        message: '业务处理失败',
        suggestion: '请检查业务参数是否正确',
        docs: 'https://docs.example.com/business'
    },
    // 系统错误
    SYSTEM_ERROR: {
        code: 'SYSTEM_ERROR',
        message: '系统内部错误',
        suggestion: '请联系技术支持',
        docs: 'https://docs.example.com/system'
    }
};
// 基础监控错误
class MonitorError extends Error {
    constructor(code, context, message) {
        const errorInfo = exports.ErrorCodes[code];
        super(message || errorInfo.message);
        this.name = 'MonitorError';
        this.details = {
            code,
            message: this.message,
            timestamp: Date.now(),
            context,
            stack: this.stack,
            suggestion: errorInfo.suggestion,
            docs: errorInfo.docs,
            errorId: this.generateErrorId(),
            severity: this.getSeverity(code),
            recoverable: this.isRecoverable(code),
            userAction: this.getUserAction(code),
            technicalDetails: this.getTechnicalDetails(code, context)
        };
    }
    generateErrorId() {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    getSeverity(code) {
        const severityMap = {
            VALIDATION_ERROR: 'low',
            NETWORK_ERROR: 'medium',
            PERMISSION_ERROR: 'medium',
            RESOURCE_ERROR: 'high',
            BUSINESS_ERROR: 'medium',
            SYSTEM_ERROR: 'critical'
        };
        return severityMap[code];
    }
    isRecoverable(code) {
        const recoverableErrors = [
            'VALIDATION_ERROR',
            'NETWORK_ERROR',
            'RESOURCE_ERROR'
        ];
        return recoverableErrors.includes(code);
    }
    getUserAction(code) {
        const actionMap = {
            VALIDATION_ERROR: '请修正输入数据后重试',
            NETWORK_ERROR: '请检查网络连接后重试',
            PERMISSION_ERROR: '请联系管理员获取权限',
            RESOURCE_ERROR: '请稍后重试或联系技术支持',
            BUSINESS_ERROR: '请检查业务参数后重试',
            SYSTEM_ERROR: '请联系技术支持处理'
        };
        return actionMap[code];
    }
    getTechnicalDetails(code, context) {
        return JSON.stringify({
            code,
            context,
            timestamp: this.details.timestamp,
            stack: this.stack
        }, null, 2);
    }
    toJSON() {
        return this.details;
    }
    getErrorMessage() {
        return `
错误信息：${this.details.message}
错误代码：${this.details.code}
错误ID：${this.details.errorId}
严重程度：${this.details.severity}
发生时间：${new Date(this.details.timestamp).toLocaleString()}
建议操作：${this.details.userAction}
解决方案：${this.details.suggestion}
技术文档：${this.details.docs}
${this.details.recoverable ? '此错误可以恢复' : '此错误需要技术支持处理'}
    `.trim();
    }
}
exports.MonitorError = MonitorError;
// ... 其他代码保持不变 
