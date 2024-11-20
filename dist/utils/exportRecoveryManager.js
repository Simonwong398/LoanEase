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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRecoveryManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class ExportRecoveryManager {
    constructor() {
        this.STORAGE_KEY = 'export_recovery_state';
        this.MAX_RETRY_ATTEMPTS = 3;
        this.RETRY_DELAY = 1000; // 1秒
    }
    static getInstance() {
        if (!ExportRecoveryManager.instance) {
            ExportRecoveryManager.instance = new ExportRecoveryManager();
        }
        return ExportRecoveryManager.instance;
    }
    saveState(state) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.setItem(this.STORAGE_KEY, JSON.stringify(state));
            }
            catch (error) {
                console.error('Failed to save export state:', error);
            }
        });
    }
    getState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const state = yield async_storage_1.default.getItem(this.STORAGE_KEY);
                return state ? JSON.parse(state) : null;
            }
            catch (error) {
                console.error('Failed to get export state:', error);
                return null;
            }
        });
    }
    clearState() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield async_storage_1.default.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('Failed to clear export state:', error);
            }
        });
    }
    retryExport(exportFn, onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = yield this.getState();
            if (!state)
                return false;
            for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
                try {
                    yield exportFn(state.data, state.format);
                    yield this.clearState();
                    return true;
                }
                catch (error) {
                    if (attempt === this.MAX_RETRY_ATTEMPTS) {
                        console.error('Max retry attempts reached:', error);
                        return false;
                    }
                    yield new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
                }
            }
            return false;
        });
    }
    isRecoveryAvailable() {
        return this.getState().then(state => !!state);
    }
}
exports.exportRecoveryManager = ExportRecoveryManager.getInstance();
