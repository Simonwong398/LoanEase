"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precise = void 0;
// 处理JavaScript浮点数计算精度问题
exports.precise = {
    add: (a, b) => {
        const precision = Math.pow(10, 10);
        return Math.round((a + b) * precision) / precision;
    },
    subtract: (a, b) => {
        const precision = Math.pow(10, 10);
        return Math.round((a - b) * precision) / precision;
    },
    multiply: (a, b) => {
        const precision = Math.pow(10, 10);
        return Math.round((a * b) * precision) / precision;
    },
    divide: (a, b) => {
        if (b === 0)
            throw new Error('Division by zero');
        const precision = Math.pow(10, 10);
        return Math.round((a / b) * precision) / precision;
    },
    round: (num, decimals = 2) => {
        const precision = Math.pow(10, decimals);
        return Math.round(num * precision) / precision;
    }
};
