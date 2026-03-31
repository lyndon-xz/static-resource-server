/**
 * 路径解析与安全校验
 *
 * 将 URL 路径映射到本地文件系统路径，并防止路径遍历攻击。
 */

import path from 'node:path';

/**
 * 路径解析结果
 */
export interface PathResolution {
  /** 是否安全（未检测到路径遍历） */
  isSafe: boolean;
  /** 解析后的绝对路径（仅在安全时有效） */
  absolutePath: string;
  /** 相对于根目录的路径 */
  relativePath: string;
}

/**
 * 将 URL 路径解析为安全的文件系统绝对路径
 *
 * 核心安全逻辑：
 * 1. 对 URL 进行解码
 * 2. 使用 `path.normalize` 消除 `.` 和 `..`
 * 3. 校验解析后的路径是否仍在根目录范围内
 *
 * @param rootDir - 静态资源根目录的绝对路径
 * @param urlPath - 请求的 URL 路径（如 `/css/style.css`）
 * @returns 路径解析结果，包含安全标志和绝对路径
 */
export function resolveResourcePath(
  rootDir: string,
  urlPath: string,
): PathResolution {
  // 解码 URL 编码的字符（如 %20 → 空格）
  const decodedPath = decodeURIComponent(urlPath);

  // 移除查询字符串和 hash
  const cleanPath = decodedPath.split('?')[0]?.split('#')[0] ?? '/';

  // 规范化路径并拼接到根目录
  const normalizedRelative = path.normalize(cleanPath);
  const absolutePath = path.join(rootDir, normalizedRelative);

  // 确保解析后的路径在根目录范围内（核心安全校验）
  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(absolutePath);

  const isSafe =
    resolvedPath === resolvedRoot ||
    resolvedPath.startsWith(resolvedRoot + path.sep);

  return {
    isSafe,
    absolutePath: resolvedPath,
    relativePath: normalizedRelative,
  };
}
