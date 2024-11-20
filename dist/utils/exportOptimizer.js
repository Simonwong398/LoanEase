"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateFileSize = exports.optimizeScheduleData = exports.processInChunks = void 0;
// 分块处理数据
const processInChunks = (data, chunkSize, processor, onProgress) => {
    return new Promise((resolve) => {
        let index = 0;
        const totalItems = data.length;
        function processNextChunk() {
            const chunk = data.slice(index, index + chunkSize);
            if (chunk.length === 0) {
                onProgress === null || onProgress === void 0 ? void 0 : onProgress(1);
                resolve();
                return;
            }
            processor(chunk);
            index += chunkSize;
            onProgress === null || onProgress === void 0 ? void 0 : onProgress(index / totalItems);
            // 使用 requestAnimationFrame 避免阻塞UI
            requestAnimationFrame(processNextChunk);
        }
        processNextChunk();
    });
};
exports.processInChunks = processInChunks;
// 优化还款计划数据
const optimizeScheduleData = (schedule) => {
    // 对于大量数据，可以采样或合并处理
    if (schedule.length > 120) { // 如果超过10年的月度数据
        return schedule.filter((_, index) => index % 3 === 0); // 每季度采样一次
    }
    return schedule;
};
exports.optimizeScheduleData = optimizeScheduleData;
// 估算导出文件大小
const estimateFileSize = (data, format) => {
    const jsonSize = JSON.stringify(data).length;
    // 根据不同格式估算文件大小
    switch (format) {
        case 'csv':
            return jsonSize * 0.7; // CSV通常比JSON小
        case 'excel':
            return jsonSize * 1.5; // Excel通常比JSON大
        case 'pdf':
            return jsonSize * 2; // PDF通常最大
        default:
            return jsonSize;
    }
};
exports.estimateFileSize = estimateFileSize;
