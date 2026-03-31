/**
 * HTTP Range 请求头解析
 *
 * 支持标准的 bytes 范围请求格式：
 * - `bytes=0-99` — 指定范围
 * - `bytes=-500` — 后缀范围（最后 500 字节）
 * - `bytes=1000-`  — 从偏移量到文件末尾
 */

/**
 * 解析 Range 请求头
 *
 * @param rangeHeader - 原始 Range 头字符串
 * @param fileSize - 文件总大小
 * @returns 解析后的 start/end 范围，无效时返回 null
 */
export function parseRange(
  rangeHeader: string | undefined,
  fileSize: number,
): { start: number; end: number } | null {
  if (!rangeHeader?.startsWith('bytes=')) return null;

  const [startStr, endStr] = rangeHeader.slice(6).split('-');

  let start: number;
  let end: number;

  if (startStr === '') {
    // 后缀范围：bytes=-500（最后 500 字节）
    const suffixLength = parseInt(endStr ?? '0', 10);
    if (isNaN(suffixLength) || suffixLength <= 0) return null;
    start = Math.max(0, fileSize - suffixLength);
    end = fileSize - 1;
  } else {
    start = parseInt(startStr, 10);
    end = endStr ? parseInt(endStr, 10) : fileSize - 1;
  }

  const isInvalid =
    isNaN(start) || isNaN(end) || start > end || start >= fileSize;
  if (isInvalid) return null;

  return { start, end: Math.min(end, fileSize - 1) };
}
