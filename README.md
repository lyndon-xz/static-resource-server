# @lyndon/static-resource-server

> 基于 Node.js **原生 http 模块**的轻量静态资源服务器，零运行时框架依赖，支持 **MIME 推断**、**ETag 缓存协商**、**Gzip 压缩**、**Range 分片下载**与**目录浏览**。

![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)
![typescript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ 特性

- 🚀 **零框架** — 仅依赖 `node:http` / `node:zlib` / `node:fs`，无 Express/Koa
- 📝 **MIME 自动推断** — 内置 40+ 扩展名映射，未知类型回退 `application/octet-stream`
- ⚡ **ETag & Last-Modified** — 弱 ETag 协商，命中缓存直接返回 304
- 🗜️ **Gzip 压缩** — 文本类资源自动 gzip，图片/视频等已压缩格式跳过
- 📦 **Range 请求** — 支持 `bytes=0-99`、`bytes=-500`、`bytes=1000-` 三种范围语法，206 分片响应
- 📂 **目录浏览** — 玻璃拟态风格 UI，展示文件名、大小、修改时间，移动端适配
- 🎨 **彩色日志** — chalk 驱动的终端输出，方法/状态码/耗时一目了然
- 🛡️ **路径安全** — 自动阻断 `..` 路径穿越

---

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式（tsx 热运行）
pnpm dev

# 构建生产产物
pnpm build

# 生产运行
pnpm start
```

服务默认监听 `http://localhost:9527`，根目录指向项目下的 `public/` 文件夹。

---

## ⚙️ CLI 参数

| 参数     | 缩写 | 默认值      | 说明           |
| -------- | ---- | ----------- | -------------- |
| `--port` | `-p` | `9527`      | 监听端口       |
| `--host` | `-h` | `localhost` | 绑定地址       |
| `--root` | `-r` | `public`    | 静态资源根目录 |
| `--help` |      |             | 打印帮助信息   |

```bash
# 示例：自定义端口和根目录
pnpm dev -- --port 3000 --root ./dist
```

---

## 🏗️ 项目结构

```
src/
├── index.ts              # 入口：解析配置 → 创建服务器 → 绑定处理
├── core/                 # 核心领域
│   ├── mime-type.ts      # MIME 映射与可压缩性判断
│   ├── path-resolver.ts  # URL → 文件路径解析 & 安全校验
│   └── resource.ts       # 类型定义（ServerConfig / DirectoryEntry 等）
├── server/               # HTTP 服务层
│   ├── request-handler.ts  # 请求调度主逻辑
│   ├── response-builder.ts # 响应构建与头部设置
│   ├── cache.ts            # ETag 生成 & 304 协商
│   ├── compressor.ts       # Gzip 压缩流
│   ├── range-parser.ts     # Range 头解析
│   └── html-renderer.ts    # 目录列表 & 错误页 HTML 渲染
└── utils/                # 工具函数
    ├── cli.ts            # CLI 参数解析（node:util parseArgs）
    ├── logger.ts         # 彩色终端日志
    ├── formatter.ts      # 文件大小 / 日期格式化
    └── file-reader.ts    # 文件读取流封装
```

---

## 🔧 技术栈

| 层面       | 选型                         |
| ---------- | ---------------------------- |
| 运行时     | Node.js（ESM）               |
| 语言       | TypeScript 5.7 + strict 模式 |
| HTTP       | `node:http` 原生模块         |
| 压缩       | `node:zlib` 原生模块         |
| 终端样式   | chalk 5                      |
| 开发运行   | tsx                          |
| 代码格式化 | Prettier                     |

---

## 📄 License

[MIT](./LICENSE) © Lyndon
