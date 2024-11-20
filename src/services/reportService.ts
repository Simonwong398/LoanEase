import { LoanApplication, ApplicationStatus } from '../models/business';

interface ReportMetrics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalAmount: number;
  approvedAmount: number;
  averageProcessingTime: number;
  approvalRate: number;
}

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  status?: ApplicationStatus;
  minAmount?: number;
  maxAmount?: number;
}

export class ReportService {
  async generateMetrics(filters?: ReportFilters): Promise<ReportMetrics> {
    try {
      const applications = await this.getFilteredApplications(filters);
      
      const approvedApps = applications.filter(app => app.status === ApplicationStatus.APPROVED);
      const rejectedApps = applications.filter(app => app.status === ApplicationStatus.REJECTED);
      
      const metrics: ReportMetrics = {
        totalApplications: applications.length,
        approvedApplications: approvedApps.length,
        rejectedApplications: rejectedApps.length,
        totalAmount: this.calculateTotalAmount(applications),
        approvedAmount: this.calculateTotalAmount(approvedApps),
        averageProcessingTime: this.calculateAverageProcessingTime(applications),
        approvalRate: approvedApps.length / applications.length
      };

      return metrics;
    } catch (error) {
      throw new Error(`Failed to generate metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateApplicationReport(filters?: ReportFilters): Promise<any> {
    try {
      const applications = await this.getFilteredApplications(filters);
      
      return {
        summary: await this.generateMetrics(filters),
        details: applications.map(app => ({
          id: app.id,
          status: app.status,
          amount: app.amount,
          submittedAt: app.submittedAt,
          processedAt: app.approvedAt || app.rejectedAt,
          processingTime: this.calculateProcessingTime(app)
        }))
      };
    } catch (error) {
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getFilteredApplications(filters?: ReportFilters): Promise<LoanApplication[]> {
    // 实现过滤逻辑
    return [];
  }

  private calculateTotalAmount(applications: LoanApplication[]): number {
    return applications.reduce((sum, app) => sum + app.amount, 0);
  }

  private calculateProcessingTime(application: LoanApplication): number {
    if (!application.submittedAt) return 0;
    const endDate = application.approvedAt || application.rejectedAt;
    if (!endDate) return 0;
    return endDate.getTime() - application.submittedAt.getTime();
  }

  private calculateAverageProcessingTime(applications: LoanApplication[]): number {
    const times = applications
      .map(app => this.calculateProcessingTime(app))
      .filter(time => time > 0);
    
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }
} 