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
const globals_1 = require("@jest/globals");
const workflowService_1 = require("../workflowService");
const notificationService_1 = require("../notificationService");
const workflow_1 = require("../../models/workflow");
const notification_1 = require("../../models/notification");
(0, globals_1.describe)('WorkflowService', () => {
    let workflowService;
    let notificationService;
    (0, globals_1.beforeEach)(() => {
        notificationService = new notificationService_1.NotificationService();
        workflowService = new workflowService_1.WorkflowService(notificationService);
    });
    (0, globals_1.describe)('Workflow Lifecycle', () => {
        (0, globals_1.it)('should create a new workflow', () => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield workflowService.createWorkflow('app_123');
            (0, globals_1.expect)(workflow).toBeDefined();
            (0, globals_1.expect)(workflow.currentStatus).toBe(workflow_1.LoanApplicationStatus.SUBMITTED);
            (0, globals_1.expect)(workflow.history).toHaveLength(0);
        }));
        (0, globals_1.it)('should update workflow status', () => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield workflowService.createWorkflow('app_123');
            const updatedWorkflow = yield workflowService.updateStatus(workflow.id, workflow_1.LoanApplicationStatus.DOCUMENT_VERIFICATION, 'user_123', 'Started document verification');
            (0, globals_1.expect)(updatedWorkflow.currentStatus).toBe(workflow_1.LoanApplicationStatus.DOCUMENT_VERIFICATION);
            (0, globals_1.expect)(updatedWorkflow.history).toHaveLength(1);
            (0, globals_1.expect)(updatedWorkflow.history[0].actor).toBe('user_123');
        }));
        (0, globals_1.it)('should assign workflow to user', () => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield workflowService.createWorkflow('app_123');
            const assignedWorkflow = yield workflowService.assignWorkflow(workflow.id, 'user_456', 'admin_789');
            (0, globals_1.expect)(assignedWorkflow.assignedTo).toBe('user_456');
            (0, globals_1.expect)(assignedWorkflow.history).toHaveLength(1);
        }));
    });
    (0, globals_1.describe)('Workflow Queries', () => {
        (0, globals_1.it)('should get pending workflows', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create multiple workflows
            yield workflowService.createWorkflow('app_1');
            yield workflowService.createWorkflow('app_2');
            const workflow3 = yield workflowService.createWorkflow('app_3');
            // Complete one workflow
            yield workflowService.updateStatus(workflow3.id, workflow_1.LoanApplicationStatus.APPROVED, 'user_123');
            const pendingWorkflows = yield workflowService.getPendingWorkflows();
            (0, globals_1.expect)(pendingWorkflows).toHaveLength(2);
        }));
        (0, globals_1.it)('should get workflows by assignee', () => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield workflowService.createWorkflow('app_123');
            yield workflowService.assignWorkflow(workflow.id, 'user_456', 'admin_789');
            const assigneeWorkflows = yield workflowService.getPendingWorkflows('user_456');
            (0, globals_1.expect)(assigneeWorkflows).toHaveLength(1);
            (0, globals_1.expect)(assigneeWorkflows[0].assignedTo).toBe('user_456');
        }));
    });
    (0, globals_1.describe)('Error Handling', () => {
        (0, globals_1.it)('should handle non-existent workflow', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, globals_1.expect)(workflowService.updateStatus('non_existent_id', workflow_1.LoanApplicationStatus.DOCUMENT_VERIFICATION, 'user_123')).rejects.toThrow('Workflow not found');
        }));
        (0, globals_1.it)('should handle invalid status transitions', () => __awaiter(void 0, void 0, void 0, function* () {
            const workflow = yield workflowService.createWorkflow('app_123');
            yield (0, globals_1.expect)(workflowService.updateStatus(workflow.id, workflow_1.LoanApplicationStatus.APPROVED, 'user_123')).rejects.toThrow('Invalid status transition');
        }));
    });
    (0, globals_1.describe)('Notifications', () => {
        (0, globals_1.it)('should send notification on status update', () => __awaiter(void 0, void 0, void 0, function* () {
            const sendNotificationSpy = globals_1.jest.spyOn(notificationService, 'sendNotification');
            const workflow = yield workflowService.createWorkflow('app_123');
            yield workflowService.updateStatus(workflow.id, workflow_1.LoanApplicationStatus.DOCUMENT_VERIFICATION, 'user_123');
            (0, globals_1.expect)(sendNotificationSpy).toHaveBeenCalledWith(globals_1.expect.any(String), notification_1.NotificationType.WORKFLOW_UPDATE, globals_1.expect.objectContaining({
                workflowId: workflow.id,
                status: workflow_1.LoanApplicationStatus.DOCUMENT_VERIFICATION
            }));
        }));
        (0, globals_1.it)('should send notification on workflow assignment', () => __awaiter(void 0, void 0, void 0, function* () {
            const sendNotificationSpy = globals_1.jest.spyOn(notificationService, 'sendNotification');
            const workflow = yield workflowService.createWorkflow('app_123');
            yield workflowService.assignWorkflow(workflow.id, 'user_456', 'admin_789');
            (0, globals_1.expect)(sendNotificationSpy).toHaveBeenCalledWith('user_456', notification_1.NotificationType.WORKFLOW_ASSIGNED, globals_1.expect.objectContaining({
                workflowId: workflow.id,
                assignedBy: 'admin_789'
            }));
        }));
    });
});
