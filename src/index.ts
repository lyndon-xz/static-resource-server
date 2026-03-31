/**
 * 静态资源服务器入口
 *
 * 这里是应用的核心启动流程：
 * 解析配置 → 创建 HTTP 服务器 → 绑定请求处理 → 监听端口
 */

import http from 'node:http';
import { parseCliArgs } from './utils/cli.js';
import { logger } from './utils/logger.js';
import { handleRequest } from './server/request-handler.js';

// 解析命令行配置
const { port, rootDir, host } = parseCliArgs(process.argv.slice(2));

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const startTime = Date.now();
  const method = req.method ?? 'GET';
  const url = req.url ?? '/';

  // 响应完成时记录访问日志
  res.on('finish', () => {
    logger.access({
      method,
      url,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
    });
  });

  // 委托请求处理器
  handleRequest(req, res, rootDir).catch((error) => {
    logger.fatal('未捕获的请求处理异常', error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
});

// 启动监听
server.listen(port, host, () => {
  logger.banner({ host, port, rootDir });
});

// 端口冲突处理
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`端口 ${port} 已被占用，请更换端口`);
  } else {
    logger.error(`服务器错误: ${error.message}`);
  }
  process.exit(1);
});
