"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatus = void 0;
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
