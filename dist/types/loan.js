"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = void 0;
// 支付方式枚举
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["MONTHLY"] = "monthly";
    PaymentMethod["BIWEEKLY"] = "biweekly";
    PaymentMethod["WEEKLY"] = "weekly";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
