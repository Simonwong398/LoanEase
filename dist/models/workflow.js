"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanApplicationStatus = void 0;
// 贷款申请流程状态
var LoanApplicationStatus;
(function (LoanApplicationStatus) {
    LoanApplicationStatus["DRAFT"] = "draft";
    LoanApplicationStatus["SUBMITTED"] = "submitted";
    LoanApplicationStatus["DOCUMENT_VERIFICATION"] = "document_verification";
    LoanApplicationStatus["CREDIT_CHECK"] = "credit_check";
    LoanApplicationStatus["RISK_ASSESSMENT"] = "risk_assessment";
    LoanApplicationStatus["UNDERWRITING"] = "underwriting";
    LoanApplicationStatus["APPROVED"] = "approved";
    LoanApplicationStatus["REJECTED"] = "rejected";
    LoanApplicationStatus["CANCELLED"] = "cancelled";
})(LoanApplicationStatus || (exports.LoanApplicationStatus = LoanApplicationStatus = {}));
