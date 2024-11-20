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
exports.userGuideManager = void 0;
class UserGuideManager {
    constructor() {
        this.guides = new Map();
        this.subscribers = new Set();
        this.currentGuide = null;
        this.currentStep = 0;
        this.loadGuides();
    }
    static getInstance() {
        if (!UserGuideManager.instance) {
            UserGuideManager.instance = new UserGuideManager();
        }
        return UserGuideManager.instance;
    }
    loadGuides() {
        return __awaiter(this, void 0, void 0, function* () {
            // 从存储加载引导配置
        });
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
        if (this.currentGuide) {
            this.currentGuide.completed = true;
            this.currentGuide.lastShown = Date.now();
            this.currentGuide = null;
            this.currentStep = 0;
            this.notifySubscribers();
        }
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentGuide));
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
    resetGuide(guideId) {
        const guide = this.guides.get(guideId);
        if (guide) {
            guide.completed = false;
            guide.lastShown = undefined;
        }
    }
}
exports.userGuideManager = UserGuideManager.getInstance();
