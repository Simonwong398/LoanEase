export const generateFileName = (
  format: string,
  prefix: string = '贷款计算结果',
  timestamp: boolean = true
): string => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = timestamp ? 
    `_${date.getHours()}${date.getMinutes()}${date.getSeconds()}` : 
    '';
  
  return `${prefix}_${dateStr}${timeStr}.${format.toLowerCase()}`;
};

export const sanitizeFileName = (fileName: string): string => {
  // 移除不合法的文件名字符
  return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}; 