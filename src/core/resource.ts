/**
 * 静态资源实体定义
 *
 * 定义服务器核心中的资源类型与结构。
 */

/** 目录条目（用于目录列表页展示） */
export interface DirectoryEntry {
  /** 条目名称 */
  name: string;
  /** 是否为目录 */
  isDirectory: boolean;
  /** 文件大小（字节），目录时为 0 */
  size: number;
  /** 最后修改时间 */
  modifiedAt: Date;
}

/** 服务器配置 */
export interface ServerConfig {
  /** 监听端口 */
  port: number;
  /** 静态资源根目录（绝对路径） */
  rootDir: string;
  /** 主机地址 */
  host: string;
}
