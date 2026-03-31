/**
 * Gzip 压缩
 *
 * 提供 gzip 压缩流创建和客户端压缩支持检测。
 */

import zlib from 'node:zlib';
import type { Transform } from 'node:stream';

/**
 * 创建 gzip 压缩转换流
 *
 * @returns gzip 转换流实例
 */
export function createGzipStream(): Transform {
  return zlib.createGzip({
    level: zlib.constants.Z_DEFAULT_COMPRESSION,
  });
}

/**
 * 判断客户端是否支持 gzip 编码
 *
 * 通过解析 `Accept-Encoding` 请求头来判断。
 *
 * @param acceptEncoding - 请求头中的 `Accept-Encoding` 值
 * @returns 是否支持 gzip
 */
export function supportsGzip(acceptEncoding?: string): boolean {
  if (!acceptEncoding) {
    return false;
  }
  return acceptEncoding.includes('gzip');
}
