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
exports.WorkflowService = void 0;
const notification_1 = require("../models/notification");
const workflow_1 = require("../models/workflow");
class WorkflowService {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    // 创建工作流
    createWorkflow(applicationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflow = {
                id: this.generateId(),
                applicationId,
                currentStatus: workflow_1.LoanApplicationStatus.SUBMITTED,
                history: [],
                priority: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            yield this.saveWorkflow(workflow);
            return workflow;
        });
    }
    // 更新工作流状态
    updateStatus(workflowId, status, actor, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflow = yield this.getWorkflow(workflowId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            // 记录历史
            const historyEntry = {
                status,
                timestamp: new Date(),
                actor,
                comment
            };
            workflow.history.push(historyEntry);
            // 更新当前状态
            workflow.currentStatus = status;
            workflow.updatedAt = new Date();
            yield this.saveWorkflow(workflow);
            // 发送通知，使用枚举值
            yield this.notificationService.sendNotification(workflow.assignedTo || 'SYSTEM', notification_1.NotificationType.WORKFLOW_UPDATE, // 使用枚举值
            {
                workflowId: workflow.id,
                status: workflow.currentStatus,
                updatedAt: workflow.updatedAt,
                actor,
                comment
            });
            return workflow;
        });
    }
    // 分配工作流
    assignWorkflow(workflowId, assignee, assigner) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflow = yield this.getWorkflow(workflowId);
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
            yield this.saveWorkflow(workflow);
            // 发送分配通知
            yield this.notificationService.sendNotification(assignee, notification_1.NotificationType.WORKFLOW_ASSIGNED, {
                workflowId: workflow.id,
                assignedBy: assigner,
                status: workflow.currentStatus
            });
            return workflow;
        });
    }
    // 获取工作流历史
    getWorkflowHistory(workflowId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflow = yield this.getWorkflow(workflowId);
            if (!workflow) {
                throw new Error('Workflow not found');
            }
            return workflow.history;
        });
    }
    // 获取待处理工作流
    getPendingWorkflows(assignee) {
        return __awaiter(this, void 0, void 0, function* () {
            const workflows = yield this.getAllWorkflows();
            return workflows.filter(workflow => {
                const isPending = ![
                    workflow_1.LoanApplicationStatus.APPROVED,
                    workflow_1.LoanApplicationStatus.REJECTED,
                    workflow_1.LoanApplicationStatus.CANCELLED
                ].includes(workflow.currentStatus);
                return isPending && (!assignee || workflow.assignedTo === assignee);
            });
        });
    }
    generateId() {
        return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getWorkflow(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取工作流逻辑
            return null;
        });
    }
    saveWorkflow(workflow) {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现保存工作流逻辑
        });
    }
    getAllWorkflows() {
        return __awaiter(this, void 0, void 0, function* () {
            // 实现获取所有工作流逻辑
            return [];
        });
    }
}
exports.WorkflowService = WorkflowService;
