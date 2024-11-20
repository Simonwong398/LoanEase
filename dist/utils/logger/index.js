"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    constructor() { }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    error(message, context, error) {
        const errorMessage = error instanceof Error ? error.message : error.message;
        console.error(`[${context}] ${message}: ${errorMessage}`);
    }
}
exports.logger = Logger.getInstance();
