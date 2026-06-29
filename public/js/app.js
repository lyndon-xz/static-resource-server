/**
 * 首页交互脚本
 *
 * 全部为体验增强型交互，渲染尽量交给 CSS（只写入 CSS 变量），保证流畅：
 * 1. 卡片随光标 3D 倾斜 + 聚光高光
 * 2. Hero 光晕跟随光标
 * 3. 顶部滚动进度条
 * 4. 内容进入视口时的渐入动画
 */

document.addEventListener('DOMContentLoaded', () => {
  initCardTilt();
  initHeroGlow();
  initScrollProgress();
  initReveal();
  printConsoleBanner();
});

/**
 * 卡片随光标 3D 倾斜 + 聚光高光
 * 仅写入 CSS 变量（--rx/--ry 倾斜角，--mouse-x/--mouse-y 聚光位置），
 * 渲染由 CSS 完成，避免覆写 hover 样式。
 */
function initCardTilt() {
  const MAX_TILT = 6; // 最大倾斜角度（度）
  const cards = document.querySelectorAll('.card');

  cards.forEach((card) => {
    let rafId = 0;

    card.addEventListener('pointermove', (event) => {
      if (rafId) return; // 用 rAF 节流，避免每次 move 都触发重排
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = event.clientX - left;
        const y = event.clientY - top;
        // 以卡片中心为原点，归一化到 [-0.5, 0.5]
        const px = x / width - 0.5;
        const py = y / height - 0.5;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        card.style.setProperty('--ry', `${px * MAX_TILT * 2}deg`);
        card.style.setProperty('--rx', `${-py * MAX_TILT * 2}deg`);
      });
    });

    // 离开时复位倾斜
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

/**
 * Hero 光晕跟随光标移动
 */
function initHeroGlow() {
  const hero = document.querySelector('.hero');
  const glow = document.querySelector('.hero__glow');
  if (!hero || !glow) return;

  hero.addEventListener('pointermove', (event) => {
    const { left, top, width, height } = hero.getBoundingClientRect();
    const xPercent = ((event.clientX - left) / width) * 100;
    const yPercent = ((event.clientY - top) / height) * 100;
    glow.style.setProperty('--glow-x', `${xPercent}%`);
    glow.style.setProperty('--glow-y', `${yPercent}%`);
  });
}

/**
 * 顶部滚动进度条
 */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.setProperty('--scroll', String(progress));
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/**
 * 内容进入视口时渐入
 */
function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * 控制台 banner
 */
function printConsoleBanner() {
  console.log(
    '%c⚡ 静态资源服务器',
    'color: #60a5fa; font-size: 16px; font-weight: bold;',
  );
  console.log(
    '%c基于 Node.js 原生 http 模块 · TypeScript · DDD 架构',
    'color: #8892a8; font-size: 12px;',
  );
}
