"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const business_1 = require("../models/business");
class ReportService {
    generateMetrics(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield this.getFilteredApplications(filters);
                const approvedApps = applications.filter(app => app.status === business_1.ApplicationStatus.APPROVED);
                const rejectedApps = applications.filter(app => app.status === business_1.ApplicationStatus.REJECTED);
                const metrics = {
                    totalApplications: applications.length,
                    approvedApplications: approvedApps.length,
                    rejectedApplications: rejectedApps.length,
                    totalAmount: this.calculateTotalAmount(applications),
                    approvedAmount: this.calculateTotalAmount(approvedApps),
                    averageProcessingTime: this.calculateAverageProcessingTime(applications),
                    approvalRate: approvedApps.length / applications.length
                };
                return metrics;
            }
            catch (error) {
                throw new Error(`Failed to generate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    generateApplicationReport(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield this.getFilteredApplications(filters);
                return {
                    summary: yield this.generateMetrics(filters),
                    details: applications.map(app => ({
                        id: app.id,
                        status: app.status,
                        amount: app.amount,
                        submittedAt: app.submittedAt,
                        processedAt: app.approvedAt || app.rejectedAt,
                        processingTime: this.calculateProcessingTime(app)
                    }))
                };
            }
            catch (error) {
                throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    getFilteredApplications(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现过滤逻辑
            return [];
        });
    }
    calculateTotalAmount(applications) {
        return applications.reduce((sum, app) => sum + app.amount, 0);
    }
    calculateProcessingTime(application) {
        if (!application.submittedAt)
            return 0;
        const endDate = application.approvedAt || application.rejectedAt;
        if (!endDate)
            return 0;
        return endDate.getTime() - application.submittedAt.getTime();
    }
    calculateAverageProcessingTime(applications) {
        const times = applications
            .map(app => this.calculateProcessingTime(app))
            .filter(time => time > 0);
        return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
    }
}
exports.ReportService = ReportService;
