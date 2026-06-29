# @lyndon/static-resource-server

> 基于 Node.js 原生 `http` 模块的**轻量静态资源服务器**，零框架依赖，单进程即可提供 **MIME 推断、ETag 缓存、Gzip 压缩、Range 分片、目录浏览** 与路径遍历防护。

[![npm version](https://img.shields.io/npm/v/@lyndon/static-resource-server.svg)](https://www.npmjs.com/package/@lyndon/static-resource-server) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![node](https://img.shields.io/badge/node-%E2%89%A518-43853d.svg)](https://nodejs.org) [![typescript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org) [![pnpm](https://img.shields.io/badge/pnpm-managed-f69220.svg)](https://pnpm.io)

## ✨ 特性

- 🚀 **零运行时框架** — 仅基于 Node.js 原生 `http`，运行依赖只有 `chalk`（终端着色）。
- 🧠 **MIME 智能推断** — 内置文本、图片、字体、音视频、二进制等数十种扩展名映射，未知类型回退 `application/octet-stream`。
- 🗂️ **目录浏览** — 目录无 `index.html` 时自动生成可点击的目录列表页，有则直接返回。
- 💾 **缓存协商** — 基于文件大小与修改时间生成弱 ETag，支持 `If-None-Match` / `If-Modified-Since`，命中返回 `304`。
- 📦 **Gzip 压缩** — 按 `Accept-Encoding` 协商，仅对文本/JS/JSON/XML/SVG 等可压缩类型启用，流式压缩传输。
- 🎯 **Range 分片** — 支持 `bytes=0-99`、`bytes=-500`、`bytes=1000-` 三种区间，返回 `206`，非法区间返回 `416`。
- 🛡️ **路径安全** — URL 解码后规范化路径并校验是否越出根目录，拦截路径遍历攻击返回 `403`。
- 📋 **彩色访问日志** — 按状态码着色，记录方法、URL、状态码与耗时。

## 📦 安装

```bash
pnpm install
```

> 需要 Node.js ≥ 18（依赖原生 `node:util` 的 `parseArgs` 等能力）。

## 🚀 快速开始

开发模式直接运行（基于 `tsx`，无需预编译）：

```bash
pnpm dev
```

启动后默认监听 `http://localhost:9527/`，根目录为项目下的 `public/`。

构建后以 Node.js 运行：

```bash
pnpm build   # tsc 编译到 dist/
pnpm start   # node dist/index.js
```

## ⚙️ 命令行参数

| 参数 | 简写 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `--port` | `-p` | 监听端口（1–65535） | `9527` |
| `--root` | `-r` | 静态资源根目录（相对 cwd 解析） | `public` |
| `--host` | `-h` | 监听地址 | `localhost` |
| `--help` | | 显示帮助信息 | |

示例：

```bash
pnpm dev -- --port 8080
pnpm dev -- --root ./dist --port 9000
```

> 通过 `pnpm dev` 传参时需用 `--` 分隔，将参数透传给脚本。

## 📜 可用脚本

| 脚本 | 作用 |
| --- | --- |
| `pnpm dev` | 用 `tsx` 直接运行 `src/index.ts` |
| `pnpm build` | 用 `tsc` 编译到 `dist/` |
| `pnpm start` | 运行编译产物 `dist/index.js` |
| `pnpm format` | 用 Prettier 格式化全部文件 |
| `pnpm format:check` | 检查格式是否合规 |

## 🗂️ 项目结构

```
src/
├── index.ts                  # 入口：解析配置 → 创建 HTTP 服务器 → 绑定请求处理 → 监听
├── core/                     # 核心领域逻辑（与 HTTP 无关）
│   ├── mime-type.ts          # 扩展名 → MIME 映射，及可压缩类型判断
│   ├── path-resolver.ts      # URL 路径解析与路径遍历安全校验
│   └── resource.ts           # 资源实体与服务器配置类型定义
├── server/                   # HTTP 层
│   ├── request-handler.ts    # 请求流程编排（方法校验 → 解析 → 缓存 → Range → 响应）
│   ├── response-builder.ts   # 响应构建：响应头、流管道、状态码
│   ├── cache.ts              # ETag 生成与缓存新鲜度判断
│   ├── compressor.ts         # gzip 流创建与客户端支持检测
│   ├── range-parser.ts       # Range 请求头解析
│   └── html-renderer.ts      # 目录列表页与错误页 HTML 渲染
└── utils/                    # 通用工具
    ├── cli.ts                # 命令行参数解析与校验
    ├── file-reader.ts        # 文件 Stats、目录读取与文件流
    ├── formatter.ts          # 格式化辅助
    └── logger.ts             # 统一日志出口（启动 banner、访问日志、错误、帮助）

public/                       # 默认静态资源根目录（示例站点）
```

## 🔁 请求处理流程

1. 仅放行 `GET` / `HEAD`，其余方法返回 `405`。
2. URL 解码并规范化路径，越界访问返回 `403`。
3. 资源不存在返回 `404`。
4. 命中目录：URL 未以 `/` 结尾时 `301` 重定向；存在 `index.html` 则返回，否则生成目录列表。
5. 命中文件：缓存协商（`304`）→ Range 解析（`206` / `416`）→ 按需 gzip → 流式响应。

## 📄 License

[MIT](./LICENSE) © Lyndon
