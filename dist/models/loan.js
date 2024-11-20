"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanType = exports.LoanStatus = void 0;
// 贷款状态
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["REVIEWING"] = "reviewing";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["DISBURSED"] = "disbursed";
    LoanStatus["REPAYING"] = "repaying";
    LoanStatus["COMPLETED"] = "completed";
    LoanStatus["DEFAULTED"] = "defaulted";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
// 贷款类型
var LoanType;
(function (LoanType) {
    LoanType["PERSONAL"] = "personal";
    LoanType["BUSINESS"] = "business";
    LoanType["EDUCATION"] = "education";
    LoanType["MORTGAGE"] = "mortgage";
})(LoanType || (exports.LoanType = LoanType = {}));
