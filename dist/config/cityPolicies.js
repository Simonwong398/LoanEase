"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityPolicies = void 0;
exports.cityPolicies = {
    'beijing': {
        id: 'beijing',
        name: '北京',
        province: '北京市',
        restrictions: {
            firstHome: {
                downPayment: 35, // 35%首付
                lprOffset: 0, // LPR+0基点
            },
            secondHome: {
                downPayment: 60, // 60%首付
                lprOffset: 100, // LPR+100基点
            },
        },
        providentFund: {
            maxAmount: 1200000,
            rate: 3.1,
        },
        purchaseRestrictions: [
            '需要北京户籍或连续5年社保',
            '无其他住房记录',
            '夫妻双方及未成年子女名下无房',
        ],
    },
    'shanghai': {
        id: 'shanghai',
        name: '上海',
        province: '上海市',
        restrictions: {
            firstHome: {
                downPayment: 35,
                lprOffset: 0,
            },
            secondHome: {
                downPayment: 70,
                lprOffset: 100,
            },
        },
        providentFund: {
            maxAmount: 1000000,
            rate: 3.1,
        },
        purchaseRestrictions: [
            '需要上海户籍或连续3年社保',
            '家庭名下无房可购买首套',
            '限购2套住房',
        ],
    },
    // 可以继续添加其他城市...
};
