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
exports.concurrencyManager = exports.TaskStatus = exports.TaskPriority = void 0;
const logger_1 = require("../logger");
const resourceMonitor_1 = require("../monitor/resourceMonitor");
// 任务优先级定义
var TaskPriority;
(function (TaskPriority) {
    TaskPriority[TaskPriority["HIGH"] = 0] = "HIGH";
    TaskPriority[TaskPriority["NORMAL"] = 1] = "NORMAL";
    TaskPriority[TaskPriority["LOW"] = 2] = "LOW";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
// 任务状态定义
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["RUNNING"] = "running";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
class ConcurrencyManager {
    constructor() {
        this.taskQueue = [];
        this.runningTasks = new Map();
        this.config = {
            initialMaxConcurrent: 5,
            minConcurrent: 2,
            maxConcurrent: 10,
            scaleInterval: 5000, // 5秒检查一次
            scaleUpThreshold: 0.8, // 80% 负载触发扩容
            scaleDownThreshold: 0.3, // 30% 负载触发缩容
            scaleStep: 1, // 每次调整步长
        };
        this.currentMaxConcurrent = this.config.initialMaxConcurrent;
        this.startScaling();
    }
    static getInstance() {
        if (!ConcurrencyManager.instance) {
            ConcurrencyManager.instance = new ConcurrencyManager();
        }
        return ConcurrencyManager.instance;
    }
    // 添加任务
    addTask(execute_1) {
        return __awaiter(this, arguments, void 0, function* (execute, options = {}) {
            var _a;
            const task = {
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                priority: (_a = options.priority) !== null && _a !== void 0 ? _a : TaskPriority.NORMAL,
                execute,
                timestamp: Date.now(),
                timeout: options.timeout,
                retries: options.retries,
                status: TaskStatus.PENDING,
            };
            this.taskQueue.push(task);
            this.sortQueue();
            this.processQueue();
            return new Promise((resolve, reject) => {
                const checkTask = setInterval(() => {
                    if (task.status === TaskStatus.COMPLETED && task.result !== undefined) {
                        clearInterval(checkTask);
                        resolve(task.result);
                    }
                    else if (task.status === TaskStatus.FAILED && task.error) {
                        clearInterval(checkTask);
                        reject(task.error);
                    }
                }, 100);
            });
        });
    }
    // 取消任务
    cancelTask(taskId) {
        const runningTask = this.runningTasks.get(taskId);
        if (runningTask) {
            runningTask.status = TaskStatus.CANCELLED;
            this.runningTasks.delete(taskId);
        }
        const queuedTaskIndex = this.taskQueue.findIndex(task => task.id === taskId);
        if (queuedTaskIndex !== -1) {
            this.taskQueue[queuedTaskIndex].status = TaskStatus.CANCELLED;
            this.taskQueue.splice(queuedTaskIndex, 1);
        }
    }
    // 动态调整并发度
    startScaling() {
        setInterval(() => {
            this.adjustConcurrency();
        }, this.config.scaleInterval);
    }
    adjustConcurrency() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 获取系统资源使用情况
                const metrics = yield resourceMonitor_1.resourceMonitor.getResourceTrends(this.config.scaleInterval);
                const lastMetric = metrics.cpu[metrics.cpu.length - 1];
                if (!lastMetric)
                    return;
                const cpuUsage = lastMetric.usage;
                const currentLoad = this.runningTasks.size / this.currentMaxConcurrent;
                // 根据 CPU 使用率和当前负载调整并发度
                if (cpuUsage > 80 || currentLoad > this.config.scaleUpThreshold) {
                    // 需要降低并发度
                    this.scaleConcurrency('down');
                }
                else if (cpuUsage < 50 && currentLoad < this.config.scaleDownThreshold) {
                    // 可以提高并发度
                    this.scaleConcurrency('up');
                }
                logger_1.logger.info('ConcurrencyManager', 'Concurrency adjusted', {
                    currentMaxConcurrent: this.currentMaxConcurrent,
                    cpuUsage,
                    currentLoad,
                });
            }
            catch (error) {
                // 将 unknown 类型的 error 转换为 Error 对象
                const actualError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error('ConcurrencyManager', 'Failed to adjust concurrency', actualError);
            }
        });
    }
    scaleConcurrency(direction) {
        if (direction === 'up') {
            this.currentMaxConcurrent = Math.min(this.currentMaxConcurrent + this.config.scaleStep, this.config.maxConcurrent);
        }
        else {
            this.currentMaxConcurrent = Math.max(this.currentMaxConcurrent - this.config.scaleStep, this.config.minConcurrent);
        }
    }
    // 处理任务队列
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.runningTasks.size >= this.currentMaxConcurrent) {
                return;
            }
            while (this.taskQueue.length > 0 &&
                this.runningTasks.size < this.currentMaxConcurrent) {
                const task = this.taskQueue.shift();
                if (!task)
                    break;
                this.runningTasks.set(task.id, task);
                task.status = TaskStatus.RUNNING;
                this.executeTask(task).finally(() => {
                    this.runningTasks.delete(task.id);
                    this.processQueue();
                });
            }
        });
    }
    // 执行单个任务
    executeTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            let attempts = 0;
            const maxAttempts = task.retries ? task.retries + 1 : 1;
            while (attempts < maxAttempts) {
                try {
                    const timeoutPromise = task.timeout
                        ? new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('Task timeout')), task.timeout);
                        })
                        : null;
                    const executePromise = task.execute();
                    const result = yield (timeoutPromise
                        ? Promise.race([executePromise, timeoutPromise])
                        : executePromise);
                    task.status = TaskStatus.COMPLETED;
                    task.result = result;
                    return;
                }
                catch (error) {
                    attempts++;
                    if (attempts === maxAttempts) {
                        task.status = TaskStatus.FAILED;
                        task.error = error instanceof Error ? error : new Error(String(error));
                    }
                    else {
                        // 重试延迟
                        yield new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                    }
                }
            }
        });
    }
    // 对队列进行排序
    sortQueue() {
        this.taskQueue.sort((a, b) => {
            // 首先按优先级排序
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            // 然后按时间戳排序
            return a.timestamp - b.timestamp;
        });
    }
    // 获取当前状态
    getStatus() {
        return {
            queueLength: this.taskQueue.length,
            runningTasks: this.runningTasks.size,
            maxConcurrent: this.currentMaxConcurrent,
        };
    }
}
ConcurrencyManager.instance = null;
exports.concurrencyManager = ConcurrencyManager.getInstance();
