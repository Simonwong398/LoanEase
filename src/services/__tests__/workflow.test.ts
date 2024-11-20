import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { WorkflowService } from '../workflowService';
import { NotificationService } from '../notificationService';
import { LoanApplicationStatus } from '../../models/workflow';
import { NotificationType } from '../../models/notification';

describe('WorkflowService', () => {
  let workflowService: WorkflowService;
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    workflowService = new WorkflowService(notificationService);
  });

  describe('Workflow Lifecycle', () => {
    it('should create a new workflow', async () => {
      const workflow = await workflowService.createWorkflow('app_123');
      
      expect(workflow).toBeDefined();
      expect(workflow.currentStatus).toBe(LoanApplicationStatus.SUBMITTED);
      expect(workflow.history).toHaveLength(0);
    });

    it('should update workflow status', async () => {
      const workflow = await workflowService.createWorkflow('app_123');
      const updatedWorkflow = await workflowService.updateStatus(
        workflow.id,
        LoanApplicationStatus.DOCUMENT_VERIFICATION,
        'user_123',
        'Started document verification'
      );

      expect(updatedWorkflow.currentStatus).toBe(LoanApplicationStatus.DOCUMENT_VERIFICATION);
      expect(updatedWorkflow.history).toHaveLength(1);
      expect(updatedWorkflow.history[0].actor).toBe('user_123');
    });

    it('should assign workflow to user', async () => {
      const workflow = await workflowService.createWorkflow('app_123');
      const assignedWorkflow = await workflowService.assignWorkflow(
        workflow.id,
        'user_456',
        'admin_789'
      );

      expect(assignedWorkflow.assignedTo).toBe('user_456');
      expect(assignedWorkflow.history).toHaveLength(1);
    });
  });

  describe('Workflow Queries', () => {
    it('should get pending workflows', async () => {
      // Create multiple workflows
      await workflowService.createWorkflow('app_1');
      await workflowService.createWorkflow('app_2');
      const workflow3 = await workflowService.createWorkflow('app_3');
      
      // Complete one workflow
      await workflowService.updateStatus(
        workflow3.id,
        LoanApplicationStatus.APPROVED,
        'user_123'
      );

      const pendingWorkflows = await workflowService.getPendingWorkflows();
      expect(pendingWorkflows).toHaveLength(2);
    });

    it('should get workflows by assignee', async () => {
      const workflow = await workflowService.createWorkflow('app_123');
      await workflowService.assignWorkflow(workflow.id, 'user_456', 'admin_789');

      const assigneeWorkflows = await workflowService.getPendingWorkflows('user_456');
      expect(assigneeWorkflows).toHaveLength(1);
      expect(assigneeWorkflows[0].assignedTo).toBe('user_456');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent workflow', async () => {
      await expect(
        workflowService.updateStatus(
          'non_existent_id',
          LoanApplicationStatus.DOCUMENT_VERIFICATION,
          'user_123'
        )
      ).rejects.toThrow('Workflow not found');
    });

    it('should handle invalid status transitions', async () => {
      const workflow = await workflowService.createWorkflow('app_123');
      
      await expect(
        workflowService.updateStatus(
          workflow.id,
          LoanApplicationStatus.APPROVED,
          'user_123'
        )
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('Notifications', () => {
    it('should send notification on status update', async () => {
      const sendNotificationSpy = jest.spyOn(notificationService, 'sendNotification');
      const workflow = await workflowService.createWorkflow('app_123');
      
      await workflowService.updateStatus(
        workflow.id,
        LoanApplicationStatus.DOCUMENT_VERIFICATION,
        'user_123'
      );

      expect(sendNotificationSpy).toHaveBeenCalledWith(
        expect.any(String),
        NotificationType.WORKFLOW_UPDATE,
        expect.objectContaining({
          workflowId: workflow.id,
          status: LoanApplicationStatus.DOCUMENT_VERIFICATION
        })
      );
    });

    it('should send notification on workflow assignment', async () => {
      const sendNotificationSpy = jest.spyOn(notificationService, 'sendNotification');
      const workflow = await workflowService.createWorkflow('app_123');
      
      await workflowService.assignWorkflow(workflow.id, 'user_456', 'admin_789');

      expect(sendNotificationSpy).toHaveBeenCalledWith(
        'user_456',
        NotificationType.WORKFLOW_ASSIGNED,
        expect.objectContaining({
          workflowId: workflow.id,
          assignedBy: 'admin_789'
        })
      );
    });
  });
}); 