"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.UserStatus = void 0;
// 用户状态
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["BLACKLISTED"] = "blacklisted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
// 用户角色
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["ADMIN"] = "admin";
    UserRole["RISK_MANAGER"] = "risk_manager";
    UserRole["LOAN_OFFICER"] = "loan_officer";
})(UserRole || (exports.UserRole = UserRole = {}));
