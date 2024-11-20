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
exports.resourceManager = void 0;
class ResourceManager {
    constructor() {
        this.cleanupFunctions = new Set();
        this.isShuttingDown = false;
        this.cleanup = () => __awaiter(this, void 0, void 0, function* () {
            if (this.isShuttingDown)
                return;
            this.isShuttingDown = true;
            console.log('Starting cleanup...');
            for (const cleanup of this.cleanupFunctions) {
                try {
                    yield Promise.resolve(cleanup());
                }
                catch (error) {
                    console.error('Cleanup error:', error);
                }
            }
            this.cleanupFunctions.clear();
            console.log('Cleanup completed');
        });
        this.setupShutdownHandlers();
    }
    static getInstance() {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }
        return ResourceManager.instance;
    }
    setupShutdownHandlers() {
        // 处理进程退出
        process.on('beforeExit', this.cleanup);
        process.on('SIGINT', this.cleanup);
        process.on('SIGTERM', this.cleanup);
        // 处理未捕获的错误
        process.on('uncaughtException', (error) => __awaiter(this, void 0, void 0, function* () {
            console.error('Uncaught Exception:', error);
            yield this.cleanup();
            process.exit(1);
        }));
        process.on('unhandledRejection', (error) => __awaiter(this, void 0, void 0, function* () {
            console.error('Unhandled Rejection:', error);
            yield this.cleanup();
            process.exit(1);
        }));
    }
    registerCleanup(cleanup) {
        this.cleanupFunctions.add(cleanup);
        return () => this.cleanupFunctions.delete(cleanup);
    }
}
exports.resourceManager = ResourceManager.getInstance();
