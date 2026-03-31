/**
 * 缓存协商（ETag / Last-Modified）
 *
 * 基于文件元信息生成 ETag，并判断客户端缓存是否仍然有效。
 */

import type { Stats } from 'node:fs';
import type { IncomingHttpHeaders } from 'node:http';

/**
 * 基于文件大小和修改时间生成弱 ETag
 *
 * 格式：W/"<size>-<mtime_hex>"
 * 使用弱 ETag 是因为我们并不逐字节比较文件内容。
 *
 * @param stats - 文件 Stats 对象
 * @returns ETag 字符串
 */
export function generateETag(stats: Stats): string {
  const mtime = stats.mtime.getTime().toString(16);
  const size = stats.size.toString(16);
  return `W/"${size}-${mtime}"`;
}

/**
 * 判断客户端缓存是否仍然有效（是否应返回 304）
 *
 * 优先检查 `If-None-Match`（ETag），如不存在则检查 `If-Modified-Since`。
 *
 * @param reqHeaders - 请求头
 * @param etag - 当前资源的 ETag
 * @param lastModified - 当前资源的最后修改时间
 * @returns 缓存是否有效（true 表示应返回 304）
 */
export function isFresh(
  reqHeaders: IncomingHttpHeaders,
  etag: string,
  lastModified: Date,
): boolean {
  // 优先检查 ETag
  const ifNoneMatch = reqHeaders['if-none-match'];
  if (ifNoneMatch) {
    return ifNoneMatch === etag || ifNoneMatch === `"${etag}"`;
  }

  // 回退到 If-Modified-Since
  const ifModifiedSince = reqHeaders['if-modified-since'];
  if (ifModifiedSince) {
    const clientDate = new Date(ifModifiedSince);
    // 以秒级精度比较（HTTP 日期精度为秒）
    return (
      Math.floor(lastModified.getTime() / 1000) <=
      Math.floor(clientDate.getTime() / 1000)
    );
  }

  return false;
}
