/**
 * MIME 类型映射与推断
 *
 * 提供文件扩展名到 MIME 类型的映射，以及判断某种 MIME 类型是否适合压缩的能力。
 */

// 扩展名到 MIME 类型的映射表
const MIME_MAP: Record<string, string> = {
  // 文本类
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.ts': 'application/typescript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',

  // 图片类
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',

  // 字体类
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',

  // 音频类
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',

  // 视频类
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',

  // 压缩包与二进制
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.tar': 'application/x-tar',
  '.pdf': 'application/pdf',
  '.wasm': 'application/wasm',
};

// 适合进行 gzip 压缩的 MIME 类型前缀
const COMPRESSIBLE_PREFIXES = [
  'text/',
  'application/javascript',
  'application/json',
  'application/xml',
  'application/typescript',
  'image/svg+xml',
];

/**
 * 根据文件扩展名获取对应的 MIME 类型
 *
 * @param extension - 文件扩展名（含点号，如 `.html`）
 * @returns 对应的 MIME 类型字符串，未知类型返回 `application/octet-stream`
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase();
  return MIME_MAP[ext] ?? 'application/octet-stream';
}

/**
 * 判断给定的 MIME 类型是否适合进行 gzip 压缩
 *
 * 文本类、JSON、JavaScript、XML、SVG 等类型适合压缩；
 * 图片（PNG/JPEG）、视频、压缩包等已有压缩的类型不适合。
 *
 * @param mimeType - MIME 类型字符串
 * @returns 是否适合压缩
 */
export function isCompressible(mimeType: string): boolean {
  return COMPRESSIBLE_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}
