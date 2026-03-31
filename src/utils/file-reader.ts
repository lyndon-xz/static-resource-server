/**
 * 文件系统读取
 *
 * 封装文件和目录的读取操作，以流式方式提供文件内容。
 */

import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import type { ReadStream } from 'node:fs';
import type { DirectoryEntry } from '../core/resource.js';

/**
 * 以流式方式读取文件
 *
 * @param filePath - 文件的绝对路径
 * @param options - 可选的读取范围（用于 Range 请求）
 * @returns 可读文件流
 */
export function readFileStream(
  filePath: string,
  options?: { start?: number; end?: number },
): ReadStream {
  return fs.createReadStream(filePath, options);
}

/**
 * 获取文件或目录的元信息
 *
 * @param filePath - 文件或目录的绝对路径
 * @returns 文件 Stats 对象，若路径不存在则返回 null
 */
export async function getFileStats(filePath: string): Promise<fs.Stats | null> {
  try {
    return await fsPromises.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * 读取目录内容
 *
 * @param dirPath - 目录的绝对路径
 * @returns 目录条目数组，按目录优先、名称排序
 */
export async function readDirectory(
  dirPath: string,
): Promise<DirectoryEntry[]> {
  const items = await fsPromises.readdir(dirPath, { withFileTypes: true });

  const entries: DirectoryEntry[] = await Promise.all(
    items.map(async (item) => {
      const fullPath = `${dirPath}/${item.name}`;
      const stats = await getFileStats(fullPath);

      return {
        name: item.name,
        isDirectory: item.isDirectory(),
        size: stats?.size ?? 0,
        modifiedAt: stats?.mtime ?? new Date(),
      };
    }),
  );

  // 目录排在前面，同类按名称排序
  return entries.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
