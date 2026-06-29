/**
 * HTML 页面渲染
 *
 * 集中管理所有 HTML 模板生成，包括目录列表页和错误页面。
 * 共享统一的设计令牌（颜色、字体、背景、动效），与首页保持一致的视觉与交互语言。
 */

import type { DirectoryEntry } from '../core/resource.js';
import { formatFileSize, formatDate } from '../utils/formatter.js';

// ============================================================
// 共享设计令牌
// ============================================================

// 页面共享的基础样式：重置 + 极光背景 + 字体 + 玻璃拟态 + 通用动效
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
      background: #0a0a1a;
      color: #e2e8f0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* 流动的极光背景，与首页一致 */
    body::before {
      content: '';
      position: fixed;
      inset: -20vmax;
      z-index: -1;
      background:
        radial-gradient(40vmax 40vmax at 18% 12%, rgba(96, 165, 250, 0.14), transparent 60%),
        radial-gradient(36vmax 36vmax at 82% 78%, rgba(167, 139, 250, 0.12), transparent 60%);
      filter: blur(8px);
      animation: aurora 22s ease-in-out infinite alternate;
    }

    @keyframes aurora {
      0% { transform: translate3d(-4%, -3%, 0) scale(1); }
      50% { transform: translate3d(5%, 4%, 0) scale(1.12); }
      100% { transform: translate3d(-2%, 5%, 0) scale(1.05); }
    }

    @keyframes title-shimmer {
      to { background-position: 250% center; }
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.18); }
    }

    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: none; }
    }

    a {
      color: #60a5fa;
      text-decoration: none;
      transition: color 0.15s ease;
    }

    a:hover {
      color: #93c5fd;
    }

    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }

    ::selection {
      background: rgba(96, 165, 250, 0.3);
      color: #fff;
    }

    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.16);
      background-clip: padding-box;
    }

    /* 顶部滚动进度条 */
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 100%;
      transform: scaleX(var(--scroll, 0));
      transform-origin: 0 50%;
      background: linear-gradient(90deg, #60a5fa, #a78bfa, #22d3ee);
      z-index: 100;
      will-change: transform;
    }
`;

// 顶部滚动进度条交互脚本（自包含，供服务端页面内联使用）
const SCROLL_PROGRESS_SCRIPT = `
    (function () {
      var bar = document.querySelector('.scroll-progress');
      if (!bar) return;
      var ticking = false;
      function update() {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        bar.style.setProperty('--scroll', String(progress));
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    })();
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
  return '#60a5fa';
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
    .error { position: relative; text-align: center; padding: 3rem; max-width: 480px; animation: fade-in-up 0.5s ease; }
    /* 卡片后方与状态色呼应的脉动光晕 */
    .error::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 42%;
      width: 320px;
      height: 320px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, ${accentColor}33, transparent 70%);
      z-index: -1;
      filter: blur(12px);
      animation: glow-pulse 4s ease-in-out infinite;
      pointer-events: none;
    }
    .error__code { font-size: 4rem; font-weight: 700; color: ${accentColor}; line-height: 1; margin-bottom: 0.5rem; text-shadow: 0 0 32px ${accentColor}55; }
    .error__status { font-size: 1.25rem; color: #94a3b8; margin-bottom: 1rem; }
    .error__message { font-size: 0.875rem; color: #64748b; line-height: 1.5; }
    .error__link { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1.5rem; padding: 0.5rem 1.5rem; border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 8px; transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease; }
    .error__link:hover { background: rgba(96, 165, 250, 0.1); border-color: rgba(96, 165, 250, 0.5); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(96, 165, 250, 0.12); }
    .error__link-arrow { display: inline-block; transition: transform 0.2s ease; }
    .error__link:hover .error__link-arrow { transform: translateX(-4px); }
  </style>
</head>
<body>
  <div class="error card">
    <div class="error__code">${statusCode}</div>
    <div class="error__status">${statusText}</div>
    <p class="error__message">${message}</p>
    <a href="/" class="error__link"><span class="error__link-arrow">←</span> 返回首页</a>
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

  // 行入场动画的错落延迟（按索引递增，封顶避免长列表延迟过久）
  const rowDelay = (index: number): string =>
    `animation-delay: ${Math.min(index * 25, 360)}ms;`;

  const parentRow = isRoot
    ? ''
    : `<tr class="entry entry--directory" style="${rowDelay(0)}">
          <td class="entry__icon">📁</td>
          <td class="entry__name"><a href="../">../</a></td>
          <td class="entry__size">-</td>
          <td class="entry__date">-</td>
        </tr>`;

  const entryRows = entries
    .map(({ isDirectory, name, size: bytes, modifiedAt }, index) => {
      const icon = isDirectory ? '📁' : '📄';
      const label = isDirectory ? `${name}/` : name;
      const href = `${normalizedPath}${name}${isDirectory ? '/' : ''}`;
      const size = isDirectory ? '-' : formatFileSize(bytes);
      const date = formatDate(modifiedAt);
      const cls = isDirectory ? 'directory' : 'file';

      return `<tr class="entry entry--${cls}" style="${rowDelay(index + 1)}">
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
    .container { max-width: 960px; margin: 0 auto; animation: fade-in-up 0.5s ease; }
    .header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
    .header__title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.4rem;
      background: linear-gradient(115deg, #60a5fa, #a78bfa, #22d3ee, #60a5fa);
      background-size: 250% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: title-shimmer 6s linear infinite;
    }
    .header__meta { display: flex; align-items: center; gap: 0.75rem; }
    .header__path { font-size: 0.875rem; color: #94a3b8; }
    .header__badge { padding: 0.2rem 0.6rem; font-size: 0.75rem; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); border-radius: 9999px; color: #60a5fa; }
    table { width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; }
    thead th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
    tbody tr { animation: fade-in-up 0.4s ease backwards; transition: background 0.18s ease, box-shadow 0.18s ease; }
    tbody tr:hover { background: rgba(96, 165, 250, 0.07); box-shadow: inset 3px 0 0 #60a5fa; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.03); font-size: 0.875rem; transition: transform 0.18s ease; }
    tbody tr:hover .entry__name { transform: translateX(4px); }
    .entry__icon { width: 2rem; text-align: center; }
    .entry__name { transition: transform 0.18s ease; }
    .entry__name a { color: #e2e8f0; }
    .entry--directory .entry__name a { color: #60a5fa; font-weight: 500; }
    .entry__size, .entry__date { color: #64748b; text-align: right; white-space: nowrap; }
    .footer { margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #475569; }
    @media (max-width: 640px) { body { padding: 1rem; } .entry__date { display: none; } thead th:last-child { display: none; } }
  </style>
</head>
<body>
  <div class="scroll-progress"></div>
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
  <script>${SCROLL_PROGRESS_SCRIPT}</script>
</body>
</html>`;
}
