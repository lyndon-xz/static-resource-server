/**
 * CLI 参数解析
 *
 * 支持 --port / --root / --host / --help 参数。
 */

import { parseArgs } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ServerConfig } from '../core/resource.js';
import { logger } from './logger.js';

// 项目根目录（基于当前文件位置，稳定不受 cwd 影响）
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..', // src/utils/ → 项目根
);

// 默认配置
const DEFAULTS = {
  port: 9527,
  host: 'localhost',
  root: 'public',
};

// 参数定义
const OPTIONS = {
  port: { type: 'string' as const, short: 'p' },
  root: { type: 'string' as const, short: 'r' },
  host: { type: 'string' as const, short: 'h' },
  help: { type: 'boolean' as const },
};

/**
 * 解析命令行参数并返回服务器配置
 */
export function parseCliArgs(argv: string[]): ServerConfig {
  const { values } = parseArgs({ args: argv, options: OPTIONS, strict: false });

  const { help, port: portArg, host: hostArg, root: rootArg } = values;

  if (help) {
    logger.help(DEFAULTS);
    process.exit(0);
  }

  // 端口校验
  let port = DEFAULTS.port;
  if (typeof portArg === 'string') {
    const parsed = parseInt(portArg, 10);
    if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
      logger.error(`无效的端口号: ${portArg}`);
      process.exit(1);
    }
    port = parsed;
  }

  const host = typeof hostArg === 'string' ? hostArg : DEFAULTS.host;

  // --root 指定的路径相对于 cwd，默认 public 相对于项目根目录
  const rootDir =
    typeof rootArg === 'string'
      ? path.resolve(process.cwd(), rootArg)
      : path.resolve(PROJECT_ROOT, DEFAULTS.root);

  if (!fs.existsSync(rootDir)) {
    logger.error(`根目录不存在: ${rootDir}`);
    logger.info('请创建目录或通过 --root 指定正确的路径');
    process.exit(1);
  }

  return { port, host, rootDir };
}
