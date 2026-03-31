/**
 * 示例 JavaScript 文件
 *
 * 为首页添加简单的交互效果。
 */

document.addEventListener('DOMContentLoaded', () => {
  // 为卡片添加鼠标跟踪高光效果
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.background = `
        radial-gradient(
          300px circle at ${x}px ${y}px,
          rgba(96, 165, 250, 0.06),
          transparent 40%
        ),
        rgba(255, 255, 255, 0.03)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.background = 'rgba(255, 255, 255, 0.03)';
    });
  });

  // 在控制台打印服务器信息
  console.log(
    '%c⚡ 静态资源服务器',
    'color: #60a5fa; font-size: 16px; font-weight: bold;',
  );
  console.log(
    '%c基于 Node.js 原生 http 模块 · TypeScript · DDD 架构',
    'color: #8892a8; font-size: 12px;',
  );
});
