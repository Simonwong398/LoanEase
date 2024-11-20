"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceError = exports.TimeoutError = exports.NetworkError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NetworkError extends AppError {
    constructor(message, details) {
        super(message, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
class TimeoutError extends AppError {
    constructor(message, details) {
        super(message, 'TIMEOUT_ERROR', details);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class ResourceError extends AppError {
    constructor(message, details) {
        super(message, 'RESOURCE_ERROR', details);
        this.name = 'ResourceError';
    }
}
exports.ResourceError = ResourceError;
