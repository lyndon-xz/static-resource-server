# ⚡ @lyndon/static-resource-server

> 一个极致精简、零框架依赖的纯 Node.js 原生静态资源服务器。  
> 主打**领域隔离、职责单一、代码极简**，专注于文件流的最优传输。

[![Node.js](https://img.shields.io/badge/Node.js-≥20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## ✨ 特性

- 🚀 **纯原生实现** — 基于 `node:http` + `node:fs`，不依赖 Express/Koa 等任何 HTTP 框架
- 📦 **极简依赖** — 仅使用 `chalk`（终端着色），核心逻辑零外部依赖
- 🛡️ **安全防护** — 路径遍历拦截 + 同级前缀防护，双重纵深防御
- ⚡ **流式传输** — 基于 `createReadStream` 管道式传输，不在内存中缓存文件
- 🗜️ **Gzip 压缩** — 对文本类资源自动启用 gzip 流式压缩
- 📋 **协商缓存** — 弱 ETag + `Last-Modified` 双重 304 缓存机制
- 🌐 **Range 分片** — 支持断点续传 / 大文件分片传输（206 Partial Content）
- 📂 **目录浏览** — 优先查找 `index.html`，无则渲染玻璃拟态风格的目录列表页
- 🔍 **MIME 推断** — 覆盖 40+ 文件类型，自动设置正确的 `Content-Type`
- ⚙️ **CLI 配置** — 通过命令行参数灵活指定端口、根目录、监听地址

---

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev                               # 默认端口 9527，根目录 ./public
pnpm dev -- --port 8080 --root ./dist  # 自定义端口和根目录
```

### 生产构建

```bash
pnpm build     # 编译 TypeScript → dist/
pnpm start     # 启动生产服务器
```

---

## ⚙️ CLI 参数

| 参数     | 缩写 | 默认值      | 说明           |
| -------- | ---- | ----------- | -------------- |
| `--port` | `-p` | `9527`      | 监听端口       |
| `--root` | `-r` | `./public`  | 静态资源根目录 |
| `--host` | `-h` | `localhost` | 监听地址       |
| `--help` |      |             | 显示帮助信息   |

> `--root` 指定的路径相对于当前工作目录解析；未指定时默认使用项目自带的 `public/` 目录。

---

## 📁 目录结构

```
src/
├── index.ts                   # 应用入口：解析配置 → 创建服务器 → 监听端口
│
├── core/                      # 🔧 领域层（纯逻辑，不依赖 HTTP，零外部导入）
│   ├── mime-type.ts           #    扩展名 → MIME 映射 + 可压缩性判断
│   ├── path-resolver.ts       #    URL → 安全绝对路径（含遍历防护）
│   └── resource.ts            #    共享类型定义（DirectoryEntry / ServerConfig）
│
├── server/                    # 🌐 服务层（HTTP 协议能力 + 请求响应编排）
│   ├── request-handler.ts     #    请求编排：路径校验 → 资源查找 → 分发响应
│   ├── response-builder.ts    #    响应构建：设置 Header / 管道流 / 状态码
│   ├── html-renderer.ts       #    HTML 模板：错误页 + 目录列表（玻璃拟态主题）
│   ├── cache.ts               #    协商缓存：ETag 生成 + 新鲜度判断
│   ├── compressor.ts          #    Gzip 压缩：流式压缩 + 客户端能力检测
│   └── range-parser.ts        #    Range 解析：标准范围 / 后缀范围 / 偏移范围
│
└── utils/                     # 🛠️ 工具层（通用能力，与业务无关）
    ├── cli.ts                 #    CLI 参数解析（基于 Node.js 原生 util.parseArgs）
    ├── file-reader.ts         #    文件 / 目录读取（流式 + Stats）
    ├── formatter.ts           #    格式化（文件大小 / 日期）
    └── logger.ts              #    统一日志（banner / 访问日志 / 错误输出）
```

> 依赖方向严格单向：`server/` → `core/` + `utils/`，`core/` 零外部依赖。

---

## 💡 请求生命周期

```
浏览器请求
    │
    ▼
index.ts                  → 拉起服务，注入配置
    │
    ▼
request-handler.ts        → Method 过滤 → URL 解码 → 路径安全校验
    │
    ├── [安检失败]         → response-builder.ts → html-renderer.ts → 403/404
    │
    ▼
fs.stat                   → 判定资源类型
    │
    ├── [目录]             → 查找 index.html → 找到则按文件处理
    │                      → 未找到 → readDirectory → renderDirectoryPage → 目录列表
    │
    └── [文件]             → cache.ts (ETag 协商)
                                │
                                ├── [缓存命中]    → 304 Not Modified
                                │
                                └── [缓存未命中]  → range-parser.ts (Range 解析)
                                                       │
                                                       ├── [有效 Range] → 206 + 分片流
                                                       │
                                                       └── [无 Range]   → compressor.ts (Gzip?) → 200 + 文件流
```

---

## 🏗️ 架构设计原则

| 原则             | 落地方式                                                          |
| ---------------- | ----------------------------------------------------------------- |
| **三层领域隔离** | `core/` 不导入任何 `server/` 或 `utils/` 模块，依赖单向流动       |
| **注释双轨制**   | `/** */` JSDoc 仅用于 `export` 的公开 API，`//` 用于内部实现      |
| **文件内排序**   | 同一文件内严格按 `类型 → 常量 → 辅助函数 → 主导出` 排列           |
| **流式传输**     | 所有文件响应通过 `pipeline(stream, res)` 管道传输，零内存缓存     |
| **防御纵深**     | 路径遍历防护 + 同级前缀防护（`resolvedRoot + path.sep`）双重校验  |
| **单一真相源**   | ETag 在 `handleFileResponse` 中生成一次，通过参数传递给所有消费者 |

---

## 📜 License

[MIT](./LICENSE) © Lyndon
