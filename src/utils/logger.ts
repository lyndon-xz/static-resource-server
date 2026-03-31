/**
 * 统一日志模块
 *
 * 集中管理所有终端输出，包括启动信息、访问日志、错误日志和 CLI 提示。
 * 其他模块通过语义化方法调用日志，不直接接触 chalk 或 console。
 */

import chalk from 'chalk';

// 启动 banner 所需的配置信息
interface BannerConfig {
  host: string;
  port: number;
  rootDir: string;
}

// 访问日志所需的请求信息
interface AccessLogEntry {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
}

// CLI 帮助信息所需的默认值
interface HelpDefaults {
  port: number;
  root: string;
  host: string;
}

// 根据 HTTP 状态码返回带颜色的字符串
function colorizeStatus(statusCode: number): string {
  if (statusCode >= 500) return chalk.red(String(statusCode));
  if (statusCode >= 400) return chalk.yellow(String(statusCode));
  if (statusCode >= 300) return chalk.cyan(String(statusCode));
  if (statusCode >= 200) return chalk.green(String(statusCode));
  return String(statusCode);
}

/**
 * 语义化日志工具
 *
 * 所有终端输出的唯一出口，统一管理格式与颜色。
 */
export const logger = {
  /**
   * 打印服务器启动 banner
   */
  banner(config: BannerConfig): void {
    const { host, port, rootDir } = config;

    console.log(`
  ${chalk.cyan('⚡ 静态资源服务器已启动')}

  ${chalk.gray('┌─')} 地址:  ${chalk.bold(`http://${host}:${port}/`)}
  ${chalk.gray('├─')} 根目录: ${chalk.yellow(rootDir)}
  ${chalk.gray('└─')} 功能:  MIME · 缓存 · Gzip · Range · 目录浏览

  ${chalk.gray('按 Ctrl+C 停止服务器')}
`);
  },

  /**
   * 打印 HTTP 访问日志（带彩色状态码和耗时）
   */
  access(entry: AccessLogEntry): void {
    const { method, url, statusCode, duration } = entry;
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    const colored = colorizeStatus(statusCode);
    console.log(
      `  ${timestamp}  ${colored}  ${method.padEnd(4)}  ${url}  ${chalk.gray(`${duration}ms`)}`,
    );
  },

  /**
   * 打印一般错误信息
   */
  error(message: string): void {
    console.error(chalk.red(`✗ ${message}`));
  },

  /**
   * 打印致命错误（含错误对象）
   */
  fatal(message: string, error?: unknown): void {
    console.error(chalk.red(`[FATAL] ${message}`));
    if (error) {
      console.error(error);
    }
  },

  /**
   * 打印请求处理过程中的错误
   */
  requestError(method: string, url: string, message: string): void {
    console.error(
      chalk.red('[ERROR]'),
      chalk.gray(`${method} ${url}`),
      message,
    );
  },

  /**
   * 打印 CLI 帮助信息
   */
  help(defaults: HelpDefaults): void {
    console.log(`
  ${chalk.cyan('静态资源服务器')}

  ${chalk.bold('用法:')}
    pnpm dev [选项]

  ${chalk.bold('选项:')}
    --port, -p <number>   监听端口 (默认: ${defaults.port})
    --root, -r <path>     静态资源根目录 (默认: ./${defaults.root})
    --host, -h <address>  监听地址 (默认: ${defaults.host})
    --help                显示此帮助信息

  ${chalk.bold('示例:')}
    pnpm dev
    pnpm dev -- --port 8080
    pnpm dev -- --root ./dist --port 9000
`);
  },

  /**
   * 打印提示信息（非错误）
   */
  info(message: string): void {
    console.log(chalk.gray(`  ${message}`));
  },
};
