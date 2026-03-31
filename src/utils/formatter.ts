/**
 * 通用格式化工具函数
 */

/**
 * 格式化文件大小为人类可读格式
 *
 * @example formatFileSize(1536) // '1.5 KB'
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const clampedIndex = Math.min(unitIndex, units.length - 1);
  const size = (bytes / Math.pow(1024, clampedIndex)).toFixed(
    clampedIndex > 0 ? 1 : 0,
  );
  return `${size} ${units[clampedIndex]}`;
}

/**
 * 格式化日期为简洁的中文格式
 *
 * @example formatDate(new Date()) // '2026/03/31 14:30'
 */
export function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
