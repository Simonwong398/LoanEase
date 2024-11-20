"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentType = exports.ApplicationStatus = exports.LoanProductType = void 0;
// 贷款产品类型
var LoanProductType;
(function (LoanProductType) {
    LoanProductType["PERSONAL"] = "personal";
    LoanProductType["BUSINESS"] = "business";
    LoanProductType["MORTGAGE"] = "mortgage";
    LoanProductType["EDUCATION"] = "education";
})(LoanProductType || (exports.LoanProductType = LoanProductType = {}));
// 贷款申请状态
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "draft";
    ApplicationStatus["SUBMITTED"] = "submitted";
    ApplicationStatus["DOCUMENT_VERIFICATION"] = "document_verification";
    ApplicationStatus["CREDIT_CHECK"] = "credit_check";
    ApplicationStatus["RISK_ASSESSMENT"] = "risk_assessment";
    ApplicationStatus["UNDERWRITING"] = "underwriting";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["CANCELLED"] = "cancelled";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
// 文档类型
var DocumentType;
(function (DocumentType) {
    DocumentType["ID_PROOF"] = "id_proof";
    DocumentType["ADDRESS_PROOF"] = "address_proof";
    DocumentType["INCOME_PROOF"] = "income_proof";
    DocumentType["BANK_STATEMENT"] = "bank_statement";
    DocumentType["EMPLOYMENT_PROOF"] = "employment_proof";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
