# 字体目录

此目录用于存放 Web 字体文件（`.woff`、`.woff2`、`.ttf`、`.otf` 等）。

服务器会为这些文件设置正确的 `Content-Type` 响应头，例如：

| 扩展名   | MIME 类型                       |
| -------- | ------------------------------- |
| `.woff`  | `font/woff`                     |
| `.woff2` | `font/woff2`                    |
| `.ttf`   | `font/ttf`                      |
| `.otf`   | `font/otf`                      |
| `.eot`   | `application/vnd.ms-fontobject` |
