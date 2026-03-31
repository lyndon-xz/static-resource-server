/**
 * HTTP 请求处理流程编排
 *
 * 串联核心模块和工具模块完成请求处理的完整流程。
 * 本模块不包含具体业务逻辑，仅做流程编排。
 */

import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveResourcePath } from '../core/path-resolver.js';
import { getMimeType } from '../core/mime-type.js';
import { getFileStats, readDirectory } from '../utils/file-reader.js';
import { generateETag, isFresh } from './cache.js';
import { parseRange } from './range-parser.js';
import { logger } from '../utils/logger.js';
import {
  sendFile,
  sendError,
  sendNotModified,
  sendHtml,
} from './response-builder.js';
import { renderDirectoryPage } from './html-renderer.js';

// 处理文件类型的响应（缓存协商 → Range → 发送）
async function handleFileResponse(
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string,
  stats: import('node:fs').Stats,
): Promise<void> {
  const extension = path.extname(filePath);
  const mimeType = getMimeType(extension);
  const etag = generateETag(stats);

  // 缓存协商
  if (isFresh(req.headers, etag, stats.mtime)) {
    sendNotModified(res);
    return;
  }

  // Range 请求解析
  const range = parseRange(req.headers['range'], stats.size);

  // 如果有 Range 头但解析失败，返回 416
  if (req.headers['range'] && !range) {
    res.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
    res.end();
    return;
  }

  await sendFile(res, {
    filePath,
    mimeType,
    stats,
    etag,
    acceptEncoding: req.headers['accept-encoding'] as string | undefined,
    range: range ?? undefined,
  });
}

/**
 * 处理 HTTP 请求的核心编排函数
 *
 * 处理流程：
 * 1. 仅允许 GET / HEAD 方法
 * 2. URL 解码 → 路径安全校验
 * 3. 查找资源（文件 / 目录 / 不存在）
 * 4. 目录 → 尝试 index.html → 目录列表
 * 5. 文件 → 缓存协商 → Range → 压缩 → 响应
 */
export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string,
): Promise<void> {
  const method = req.method ?? 'GET';
  const urlPath = req.url ?? '/';

  // 仅允许 GET 和 HEAD 方法
  if (method !== 'GET' && method !== 'HEAD') {
    sendError(res, 405, '仅支持 GET 和 HEAD 请求方法');
    return;
  }

  try {
    // 1. 路径解析与安全校验
    const resolution = resolveResourcePath(rootDir, urlPath);

    if (!resolution.isSafe) {
      sendError(res, 403, '禁止访问：检测到路径遍历尝试');
      return;
    }

    // 2. 获取文件/目录信息
    const stats = await getFileStats(resolution.absolutePath);

    if (!stats) {
      sendError(res, 404, `资源不存在：${resolution.relativePath}`);
      return;
    }

    // 3. 目录处理
    if (stats.isDirectory()) {
      // 确保目录 URL 以 / 结尾（防止相对路径问题）
      if (!urlPath.endsWith('/')) {
        res.writeHead(301, { Location: `${urlPath}/` });
        res.end();
        return;
      }

      // 尝试查找 index.html
      const indexPath = path.join(resolution.absolutePath, 'index.html');
      const indexStats = await getFileStats(indexPath);

      if (indexStats && indexStats.isFile()) {
        await handleFileResponse(req, res, indexPath, indexStats);
        return;
      }

      // 无 index.html，生成目录列表
      const entries = await readDirectory(resolution.absolutePath);
      const html = renderDirectoryPage(urlPath, entries);
      sendHtml(res, html);
      return;
    }

    // 4. 文件处理
    if (stats.isFile()) {
      await handleFileResponse(req, res, resolution.absolutePath, stats);
      return;
    }

    // 其他类型（符号链接等），不予处理
    sendError(res, 403, '不支持的资源类型');
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    logger.requestError(method, urlPath, message);
    sendError(res, 500, `服务器内部错误：${message}`);
  }
}
