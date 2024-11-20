"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = void 0;
exports.DEFAULT_SETTINGS = {
    calculator: {
        defaultLoanType: 'commercialHouse',
        defaultCity: 'beijing',
        defaultTerm: 30,
        defaultRate: 4.65,
        maxLoanAmount: 10000000,
        maxTerm: 30,
        roundingDecimals: 2,
        maxInputLength: 10,
    },
    ui: {
        theme: 'system',
        language: 'zh',
        showChart: true,
        showSchedule: true,
        compactMode: false,
        chartAnimations: true,
        autoSave: true,
    },
    sync: {
        syncEnabled: false,
        syncInterval: 24 * 60 * 60 * 1000, // 24小时
        syncItems: {
            history: true,
            settings: true,
            templates: true,
        },
    },
    lastModified: Date.now(),
};
