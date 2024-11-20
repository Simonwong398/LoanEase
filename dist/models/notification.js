"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationStatus = exports.NotificationChannel = exports.NotificationPriority = exports.NotificationType = void 0;
// 通知类型
var NotificationType;
(function (NotificationType) {
    NotificationType["WORKFLOW_UPDATE"] = "workflow_update";
    NotificationType["WORKFLOW_ASSIGNED"] = "workflow_assigned";
    NotificationType["WORKFLOW_COMPLETED"] = "workflow_completed";
    NotificationType["LOAN_APPLICATION_CREATED"] = "loan_application_created";
    NotificationType["LOAN_APPLICATION_SUBMITTED"] = "loan_application_submitted";
    NotificationType["LOAN_APPROVED"] = "loan_approved";
    NotificationType["LOAN_REJECTED"] = "loan_rejected";
    NotificationType["DOCUMENT_UPLOADED"] = "document_uploaded";
    NotificationType["DOCUMENT_VERIFIED"] = "document_verified";
    NotificationType["DOCUMENT_REJECTED"] = "document_rejected";
    NotificationType["PAYMENT_DUE"] = "payment_due";
    NotificationType["PAYMENT_RECEIVED"] = "payment_received";
    NotificationType["RISK_ASSESSMENT_COMPLETED"] = "risk_assessment_completed";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// 通知优先级
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "low";
    NotificationPriority["MEDIUM"] = "medium";
    NotificationPriority["HIGH"] = "high";
    NotificationPriority["URGENT"] = "urgent";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
// 通知渠道
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "email";
    NotificationChannel["SMS"] = "sms";
    NotificationChannel["PUSH"] = "push";
    NotificationChannel["IN_APP"] = "in_app";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
// 通知状态
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["READ"] = "read";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
