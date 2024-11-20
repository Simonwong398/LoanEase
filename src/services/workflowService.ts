import { NotificationType } from '../models/notification';
import { NotificationService } from './notificationService';
import { LoanWorkflow, LoanApplicationStatus, WorkflowHistory } from '../models/workflow';

export class WorkflowService {
  constructor(private notificationService: NotificationService) {}

  // 创建工作流
  async createWorkflow(applicationId: string): Promise<LoanWorkflow> {
    const workflow: LoanWorkflow = {
      id: this.generateId(),
      applicationId,
      currentStatus: LoanApplicationStatus.SUBMITTED,
      history: [],
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveWorkflow(workflow);
    return workflow;
  }

  // 更新工作流状态
  async updateStatus(
    workflowId: string,
    status: LoanApplicationStatus,
    actor: string,
    comment?: string
  ): Promise<LoanWorkflow> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // 记录历史
    const historyEntry: WorkflowHistory = {
      status,
      timestamp: new Date(),
      actor,
      comment
    };
    workflow.history.push(historyEntry);

    // 更新当前状态
    workflow.currentStatus = status;
    workflow.updatedAt = new Date();

    await this.saveWorkflow(workflow);

    // 发送通知，使用枚举值
    await this.notificationService.sendNotification(
      workflow.assignedTo || 'SYSTEM',
      NotificationType.WORKFLOW_UPDATE,  // 使用枚举值
      {
        workflowId: workflow.id,
        status: workflow.currentStatus,
        updatedAt: workflow.updatedAt,
        actor,
        comment
      }
    );

    return workflow;
  }

  // 分配工作流
  async assignWorkflow(
    workflowId: string,
    assignee: string,
    assigner: string
  ): Promise<LoanWorkflow> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.assignedTo = assignee;
    workflow.updatedAt = new Date();

    // 记录分配历史
    workflow.history.push({
      status: workflow.currentStatus,
      timestamp: new Date(),
      actor: assigner,
      comment: `Assigned to ${assignee}`
    });

    await this.saveWorkflow(workflow);

    // 发送分配通知
    await this.notificationService.sendNotification(
      assignee,
      NotificationType.WORKFLOW_ASSIGNED,
      {
        workflowId: workflow.id,
        assignedBy: assigner,
        status: workflow.currentStatus
      }
    );

    return workflow;
  }

  // 获取工作流历史
  async getWorkflowHistory(workflowId: string): Promise<WorkflowHistory[]> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    return workflow.history;
  }

  // 获取待处理工作流
  async getPendingWorkflows(assignee?: string): Promise<LoanWorkflow[]> {
    const workflows = await this.getAllWorkflows();
    return workflows.filter(workflow => {
      const isPending = ![
        LoanApplicationStatus.APPROVED,
        LoanApplicationStatus.REJECTED,
        LoanApplicationStatus.CANCELLED
      ].includes(workflow.currentStatus);

      return isPending && (!assignee || workflow.assignedTo === assignee);
    });
  }

  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getWorkflow(id: string): Promise<LoanWorkflow | null> {
    // 实现获取工作流逻辑
    return null;
  }

  private async saveWorkflow(workflow: LoanWorkflow): Promise<void> {
    // 实现保存工作流逻辑
  }

  private async getAllWorkflows(): Promise<LoanWorkflow[]> {
    // 实现获取所有工作流逻辑
    return [];
  }
} 