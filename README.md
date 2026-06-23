# @lyndon/static-resource-server

> 基于 Node.js 原生 `http` 模块的轻量**静态资源服务器**，零运行时框架依赖，内置 **MIME 推断**、**ETag/Last-Modified 缓存协商**、**Gzip 压缩**、**Range 分片**与**目录浏览**。

![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A518-339933?logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white) ![pnpm](https://img.shields.io/badge/pnpm-managed-F69220?logo=pnpm&logoColor=white) ![license](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ 特性

- 🧩 **零框架依赖** — 仅基于 Node.js 原生 `http`，运行时唯一依赖是用于彩色日志的 `chalk`。
- 📄 **MIME 推断** — 内置覆盖文本、图片、字体、音视频、压缩包等 40+ 扩展名的映射，未知类型回退 `application/octet-stream`。
- 🗂️ **缓存协商** — 基于文件大小与修改时间生成弱 ETag，支持 `If-None-Match` 与 `If-Modified-Since`，命中返回 `304`。
- 🗜️ **Gzip 压缩** — 按 `Accept-Encoding` 自动协商，仅对文本 / JSON / JS / XML / SVG 等可压缩类型启用。
- 🎯 **Range 分片** — 支持 `bytes=0-99`、`bytes=-500`、`bytes=1000-` 三种范围格式，返回 `206`，非法范围返回 `416`。
- 📁 **目录浏览** — 无 `index.html` 时生成玻璃拟态风格的目录列表页，目录优先排序，展示大小与修改时间。
- 🛡️ **路径遍历防护** — URL 解码与规范化后校验路径是否越出根目录，拦截 `../` 穿越返回 `403`。
- 🎨 **美观的页面** — 目录列表页与错误页共享统一设计令牌，深色渐变背景，移动端自适应。
- 📊 **彩色访问日志** — 按状态码着色，记录方法、URL、状态码与请求耗时。

## 📦 安装

```bash
pnpm install
```

## 🚀 使用

开发模式直接以 `tsx` 运行 TypeScript 源码：

```bash
pnpm dev
```

默认启动在 [http://localhost:9527/](http://localhost:9527/)，根目录为 `public/`。

构建并以编译产物运行：

```bash
pnpm build   # tsc 编译到 dist/
pnpm start   # node dist/index.js
```

### 命令行选项

| 选项     | 简写 | 说明                       | 默认值      |
| -------- | ---- | -------------------------- | ----------- |
| `--port` | `-p` | 监听端口（1–65535）        | `9527`      |
| `--root` | `-r` | 静态资源根目录（相对 cwd） | `public`    |
| `--host` | `-h` | 监听地址                   | `localhost` |
| `--help` |      | 显示帮助信息               |             |

通过 `pnpm dev` 传参时需在选项前加 `--`：

```bash
pnpm dev -- --port 8080
pnpm dev -- --root ./dist --port 9000
```

## 📂 目录结构

```
src/
├─ index.ts              # 入口：解析配置 → 创建 HTTP 服务 → 监听端口
├─ core/                 # 核心领域逻辑
│  ├─ mime-type.ts       # 扩展名 → MIME 映射与可压缩判断
│  ├─ path-resolver.ts   # URL → 文件系统路径解析与遍历防护
│  └─ resource.ts        # 资源与配置的类型定义
├─ server/               # HTTP 处理层
│  ├─ request-handler.ts # 请求处理流程编排
│  ├─ cache.ts           # ETag 生成与缓存新鲜度判断
│  ├─ compressor.ts      # Gzip 流与压缩支持检测
│  ├─ range-parser.ts    # Range 请求头解析
│  ├─ response-builder.ts# 响应头设置、流管道、状态码
│  └─ html-renderer.ts   # 目录列表页与错误页 HTML 渲染
└─ utils/                # 通用工具
   ├─ cli.ts             # 命令行参数解析
   ├─ file-reader.ts     # 文件流与目录读取
   ├─ formatter.ts       # 文件大小、日期格式化
   └─ logger.ts          # 统一彩色日志出口
```

## 🔁 请求处理流程

1. 仅放行 `GET` / `HEAD`，其余方法返回 `405`。
2. URL 解码、规范化并做路径遍历安全校验，越界返回 `403`。
3. 查找资源：不存在返回 `404`。
4. 命中目录：URL 未以 `/` 结尾时 `301` 重定向；存在 `index.html` 则返回该文件，否则生成目录列表页。
5. 命中文件：缓存协商命中返回 `304`，存在合法 `Range` 返回 `206` 分片，可压缩类型按需 Gzip，否则正常 `200`。

## 🛠️ 技术栈

- **运行时**：Node.js 原生 `http` / `zlib` / `stream` / `fs`
- **语言**：TypeScript 5.7（`NodeNext` 模块，`strict` 模式）
- **开发运行**：tsx
- **依赖**：chalk（终端着色）
- **格式化**：Prettier

## 📜 License

[MIT](./LICENSE) © Lyndon
