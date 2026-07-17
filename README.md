# ZMusic 使用文档

ZMusic 官方文档站，基于 [VitePress](https://vitepress.dev/)，覆盖 V4 与 V2 (LTS) 文档，支持中文、English、日本語。

## 本地开发

```bash
mise install
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

产物输出到 `docs/.vitepress/dist/`。推送 `main` 分支且文档相关文件变更时，由 CNB 流水线自动构建并部署。

## 历史说明

本仓库 2026 年 3 月曾归档，文档迁入 zmusic-plugin 仓库的 v4 分支；现迁回本仓库。两段历史已通过合并提交保留，可用 `git log --graph` 查看。
