/**
 * HTTP 响应构建
 *
 * 纯 HTTP 响应机制：设置响应头、管道流、发送状态码。
 * HTML 模板生成由 html-renderer 模块负责。
 */

import type { ServerResponse } from 'node:http';
import type { Stats } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { isCompressible } from '../core/mime-type.js';
import { readFileStream } from '../utils/file-reader.js';
import { createGzipStream, supportsGzip } from './compressor.js';
import { renderErrorPage } from './html-renderer.js';

// 文件响应选项
interface SendFileOptions {
  filePath: string; // 文件绝对路径
  mimeType: string; // MIME 类型
  stats: Stats; // 文件 Stats
  etag: string; // ETag 值
  acceptEncoding?: string; // 客户端的 Accept-Encoding
  range?: { start: number; end: number }; // Range 请求范围
}

/**
 * 发送文件响应
 *
 * 支持 gzip 压缩和 Range 分片传输。
 */
export async function sendFile(
  res: ServerResponse,
  options: SendFileOptions,
): Promise<void> {
  const { filePath, mimeType, stats, etag, acceptEncoding, range } = options;
  const isHeadRequest = res.req.method === 'HEAD';

  // 通用响应头
  const headers: Record<string, string | number> = {
    'Content-Type': mimeType,
    ETag: etag,
    'Last-Modified': stats.mtime.toUTCString(),
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=0',
  };

  // HEAD 请求：仅返回元信息，不发送响应体
  if (isHeadRequest) {
    headers['Content-Length'] = stats.size;
    res.writeHead(200, headers);
    res.end();
    return;
  }

  // Range 请求处理
  if (range) {
    const { start, end } = range;
    const contentLength = end - start + 1;
    headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
    headers['Content-Length'] = contentLength;

    res.writeHead(206, headers);
    const stream = readFileStream(filePath, { start, end });
    await pipeline(stream, res);
    return;
  }

  // 判断是否启用 gzip 压缩
  const shouldCompress =
    isCompressible(mimeType) && supportsGzip(acceptEncoding);

  if (shouldCompress) {
    headers['Content-Encoding'] = 'gzip';
    // 压缩后长度未知，使用 Transfer-Encoding: chunked（Node.js 默认行为）
    delete headers['Content-Length'];
  } else {
    headers['Content-Length'] = stats.size;
  }

  res.writeHead(200, headers);

  const fileStream = readFileStream(filePath);

  if (shouldCompress) {
    const gzip = createGzipStream();
    await pipeline(fileStream, gzip, res);
  } else {
    await pipeline(fileStream, res);
  }
}

/**
 * 发送 304 Not Modified 响应
 */
export function sendNotModified(res: ServerResponse): void {
  res.writeHead(304);
  res.end();
}

/**
 * 发送错误页面
 */
export function sendError(
  res: ServerResponse,
  statusCode: number,
  message: string,
): void {
  sendHtml(res, renderErrorPage(statusCode, message), statusCode);
}

/**
 * 发送 HTML 页面
 */
export function sendHtml(
  res: ServerResponse,
  html: string,
  statusCode: number = 200,
): void {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
  });

  // HEAD 请求只返回响应头，不发送响应体
  if (res.req.method === 'HEAD') {
    res.end();
    return;
  }

  res.end(html);
}
