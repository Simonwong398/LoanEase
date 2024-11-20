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
exports.guideManager = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
class GuideManager {
    constructor() {
        this.guides = new Map();
        this.currentGuide = null;
        this.currentStep = 0;
        this.subscribers = new Set();
        this.loadGuides();
    }
    static getInstance() {
        if (!GuideManager.instance) {
            GuideManager.instance = new GuideManager();
        }
        return GuideManager.instance;
    }
    loadGuides() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const savedGuides = yield async_storage_1.default.getItem('@guides');
                if (savedGuides) {
                    const guides = JSON.parse(savedGuides);
                    guides.forEach((guide) => {
                        this.guides.set(guide.id, guide);
                    });
                }
            }
            catch (error) {
                console.error('Failed to load guides:', error);
            }
        });
    }
    saveGuides() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guides = Array.from(this.guides.values());
                yield async_storage_1.default.setItem('@guides', JSON.stringify(guides));
            }
            catch (error) {
                console.error('Failed to save guides:', error);
            }
        });
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentGuide, this.currentStep));
    }
    startGuide(guideId) {
        const guide = this.guides.get(guideId);
        if (guide && !guide.completed) {
            this.currentGuide = guide;
            this.currentStep = 0;
            this.notifySubscribers();
        }
    }
    nextStep() {
        if (this.currentGuide && this.currentStep < this.currentGuide.steps.length - 1) {
            this.currentStep++;
            this.notifySubscribers();
        }
        else {
            this.completeGuide();
        }
    }
    previousStep() {
        if (this.currentGuide && this.currentStep > 0) {
            this.currentStep--;
            this.notifySubscribers();
        }
    }
    skipGuide() {
        if (this.currentGuide) {
            this.completeGuide();
        }
    }
    completeGuide() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentGuide) {
                this.currentGuide.completed = true;
                this.currentGuide.lastShown = Date.now();
                yield this.saveGuides();
                this.currentGuide = null;
                this.currentStep = 0;
                this.notifySubscribers();
            }
        });
    }
    resetGuide(guideId) {
        const guide = this.guides.get(guideId);
        if (guide) {
            guide.completed = false;
            guide.lastShown = undefined;
            this.saveGuides();
        }
    }
    getCurrentStep() {
        if (!this.currentGuide)
            return null;
        return this.currentGuide.steps[this.currentStep];
    }
    isGuideCompleted(guideId) {
        var _a, _b;
        return (_b = (_a = this.guides.get(guideId)) === null || _a === void 0 ? void 0 : _a.completed) !== null && _b !== void 0 ? _b : false;
    }
}
exports.guideManager = GuideManager.getInstance();
