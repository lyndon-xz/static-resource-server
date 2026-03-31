/**
 * HTML 页面渲染
 *
 * 集中管理所有 HTML 模板生成，包括目录列表页和错误页面。
 * 共享统一的设计令牌（颜色、字体、背景等），确保视觉一致性。
 */

import type { DirectoryEntry } from '../core/resource.js';
import { formatFileSize, formatDate } from '../utils/formatter.js';

// ============================================================
// 共享设计令牌
// ============================================================

// 页面共享的基础样式（重置 + 背景 + 字体 + 玻璃拟态）
const BASE_STYLES = `
    *,
    *::before,
    *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
      background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%);
      color: #e2e8f0;
      min-height: 100vh;
    }

    a {
      color: #7dd3fc;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    a:hover {
      color: #38bdf8;
    }

    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
`;

// HTTP 状态码到文本描述
const STATUS_TEXTS: Record<number, string> = {
  200: 'OK',
  206: 'Partial Content',
  304: 'Not Modified',
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  416: 'Range Not Satisfiable',
  500: 'Internal Server Error',
};

// 状态码对应的强调色
function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return '#f87171';
  if (statusCode >= 400) return '#fbbf24';
  return '#7dd3fc';
}

// ============================================================
// 页面渲染
// ============================================================

/**
 * 渲染错误页面 HTML
 */
export function renderErrorPage(statusCode: number, message: string): string {
  const statusText = STATUS_TEXTS[statusCode] ?? 'Unknown';
  const accentColor = getStatusColor(statusCode);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusCode} ${statusText}</title>
  <style>
    ${BASE_STYLES}
    body { display: flex; align-items: center; justify-content: center; }
    .error { text-align: center; padding: 3rem; max-width: 480px; }
    .error__code { font-size: 4rem; font-weight: 700; color: ${accentColor}; line-height: 1; margin-bottom: 0.5rem; }
    .error__status { font-size: 1.25rem; color: #94a3b8; margin-bottom: 1rem; }
    .error__message { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
    .error__link { display: inline-block; margin-top: 1.5rem; padding: 0.5rem 1.5rem; border: 1px solid rgba(125, 211, 252, 0.3); border-radius: 8px; transition: all 0.2s; }
    .error__link:hover { background: rgba(125, 211, 252, 0.1); }
  </style>
</head>
<body>
  <div class="error card">
    <div class="error__code">${statusCode}</div>
    <div class="error__status">${statusText}</div>
    <p class="error__message">${message}</p>
    <a href="/" class="error__link">← 返回首页</a>
  </div>
</body>
</html>`;
}

/**
 * 渲染目录列表 HTML 页面
 */
export function renderDirectoryPage(
  currentPath: string,
  entries: DirectoryEntry[],
): string {
  const normalizedPath = currentPath.endsWith('/')
    ? currentPath
    : `${currentPath}/`;
  const isRoot = normalizedPath === '/';

  const parentRow = isRoot
    ? ''
    : `<tr class="entry entry--directory">
          <td class="entry__icon">📁</td>
          <td class="entry__name"><a href="../">../</a></td>
          <td class="entry__size">-</td>
          <td class="entry__date">-</td>
        </tr>`;

  const entryRows = entries
    .map(({ isDirectory, name, size: bytes, modifiedAt }) => {
      const icon = isDirectory ? '📁' : '📄';
      const label = isDirectory ? `${name}/` : name;
      const href = `${normalizedPath}${name}${isDirectory ? '/' : ''}`;
      const size = isDirectory ? '-' : formatFileSize(bytes);
      const date = formatDate(modifiedAt);
      const cls = isDirectory ? 'directory' : 'file';

      return `<tr class="entry entry--${cls}">
          <td class="entry__icon">${icon}</td>
          <td class="entry__name"><a href="${href}">${label}</a></td>
          <td class="entry__size">${size}</td>
          <td class="entry__date">${date}</td>
        </tr>`;
    })
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>目录浏览 — ${currentPath}</title>
  <style>
    ${BASE_STYLES}
    body { padding: 2rem; }
    .container { max-width: 960px; margin: 0 auto; }
    .header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .header__title { font-size: 1.25rem; font-weight: 600; color: #7dd3fc; margin-bottom: 0.25rem; }
    .header__meta { display: flex; align-items: center; gap: 0.75rem; }
    .header__path { font-size: 0.875rem; color: #94a3b8; }
    .header__badge { padding: 0.2rem 0.6rem; font-size: 0.75rem; background: rgba(125, 211, 252, 0.1); border: 1px solid rgba(125, 211, 252, 0.2); border-radius: 9999px; color: #7dd3fc; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; }
    thead th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
    tbody tr { transition: background 0.15s ease; }
    tbody tr:hover { background: rgba(125, 211, 252, 0.05); }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.875rem; }
    .entry__icon { width: 2rem; text-align: center; }
    .entry__name a { color: #e2e8f0; }
    .entry--directory .entry__name a { color: #7dd3fc; font-weight: 500; }
    .entry__size, .entry__date { color: #64748b; text-align: right; white-space: nowrap; }
    .footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #475569; }
    @media (max-width: 640px) { body { padding: 1rem; } .entry__date { display: none; } thead th:last-child { display: none; } }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="header__title">📂 目录浏览</h1>
      <div class="header__meta">
        <p class="header__path">${currentPath}</p>
        <span class="header__badge">${entries.length} 个项目</span>
      </div>
    </header>
    <table class="card">
      <thead>
        <tr>
          <th></th>
          <th>名称</th>
          <th style="text-align: right;">大小</th>
          <th style="text-align: right;">修改时间</th>
        </tr>
      </thead>
      <tbody>
        ${parentRow}
        ${entryRows}
      </tbody>
    </table>
    <footer class="footer">
      static-resource-server · Node.js ${process.version}
    </footer>
  </div>
</body>
</html>`;
}
