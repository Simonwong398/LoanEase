import { PaymentScheduleItem } from './loanCalculations';

// 分块处理数据
export const processInChunks = <T>(
  data: T[],
  chunkSize: number,
  processor: (chunk: T[]) => void,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve) => {
    let index = 0;
    const totalItems = data.length;

    function processNextChunk() {
      const chunk = data.slice(index, index + chunkSize);
      if (chunk.length === 0) {
        onProgress?.(1);
        resolve();
        return;
      }

      processor(chunk);
      index += chunkSize;
      onProgress?.(index / totalItems);
      
      // 使用 requestAnimationFrame 避免阻塞UI
      requestAnimationFrame(processNextChunk);
    }

    processNextChunk();
  });
};

// 优化还款计划数据
export const optimizeScheduleData = (
  schedule: PaymentScheduleItem[]
): PaymentScheduleItem[] => {
  // 对于大量数据，可以采样或合并处理
  if (schedule.length > 120) { // 如果超过10年的月度数据
    return schedule.filter((_, index) => index % 3 === 0); // 每季度采样一次
  }
  return schedule;
};

// 估算导出文件大小
export const estimateFileSize = (
  data: any,
  format: 'csv' | 'excel' | 'pdf'
): number => {
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