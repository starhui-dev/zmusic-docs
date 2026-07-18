# AGENTS.md

本文件面向 AI 编码代理，介绍本仓库的结构、命令与约定。阅读本文件即可上手，无需其他背景知识。

## 项目概述

这是 **ZMusic 官方文档站**（`zmusic-docs`），基于 [VitePress](https://vitepress.dev/) 2.0.0-alpha.17 构建的纯静态站点，线上地址为 `https://docs.zmusic.cc`。

ZMusic 本身是一个 Minecraft 跨平台点歌插件（主仓库在 `starhui-dev/zmusic-plugin`，不在本仓库）。本站包含：

- **V4 文档**（当前开发版，根路径 `/guide/`、`/netease-api/`、`/faq.md`）
- **V2 (LTS) 文档**（长期支持版，挂载在 `/v2/` 前缀下）
- 三个语言版本：简体中文（root 语言，`/`）、English（`/en/`）、日本語（`/ja/`）

站点还包含 giscus 评论（`@giscus/vue`）、Umami 统计脚本、备案信息页脚，以及从 GitHub Releases 获取下载信息的下载表格组件。

## 技术栈

- **运行时**：Node.js（`engines` 要求 `>=22.18.0`；`mise.toml` 与 `.node-version` 均指定 Node 24）
- **包管理器**：pnpm 10.33.0（`packageManager` 字段锁定，`.npmrc` 开启 `engine-strict=true`）。不要改用 npm/yarn
- **框架**：VitePress `2.0.0-alpha.17` + Vue 3；`package.json` 通过 `pnpm.overrides` 将 `vite` 锁定为 `7.3.2`（改动依赖时不要删除这个 override）
- **语言**：配置与主题为 TypeScript（ESM，`"type": "module"`）；内容为 Markdown + VitePress frontmatter
- 项目没有 lint、格式化工具（ESLint/Prettier）配置，也没有测试框架

## 常用命令

```bash
mise install        # 安装项目指定的 Node 版本（如使用 mise）
pnpm install        # 安装依赖；CI 中使用 pnpm install --frozen-lockfile
pnpm dev            # 本地开发服务器（vitepress dev docs）
pnpm build          # 构建到 docs/.vitepress/dist/（自动触发 postbuild）
pnpm preview        # 本地预览构建产物
```

`pnpm build` 会先执行 `vitepress build docs`，然后自动运行 `postbuild`（`node docs/postbuild.ts`）。Node 22.6+ 可直接运行 `.ts` 文件，无需 tsx/ts-node。

**验证方式**：本项目没有测试。改动后至少运行 `pnpm build` 确认构建通过；涉及导航/侧边栏/主题组件的改动，应再 `pnpm dev` 或 `pnpm preview` 人工检查页面。

## 目录结构

```
docs/                        # VitePress 站点根目录（所有 vitepress 命令都以 docs 为 root）
├── .vitepress/
│   ├── config.ts            # 主配置：head、sitemap、locales、Vite 别名（组件覆盖）
│   └── theme/               # 自定义主题（继承默认主题）
│       ├── index.ts         # 主题入口：Layout 插槽 + 全局组件注册
│       ├── style.css
│       ├── components/      # Vue 组件（见下）
│       ├── data/            # 数据文件（如 netease-api.ts 公共 API 列表）
│       └── utils/           # i18n.ts、site-icons.ts
├── config.ts                # 中文（root locale）附加配置：nav/sidebar/搜索文案/页脚
├── index.md、faq.md         # 中文页面
├── guide/                   # V4 指南（中文）
├── netease-api/             # 网易云音乐 API 部署文档（中文）
├── v2/                      # V2 (LTS) 文档（中文），有自己的 config.ts
├── en/、ja/                 # 英文/日文镜像，目录结构与中文一致
└── public/                  # 静态资源（icons/、images/），以 / 开头引用
scripts/deploy-docs.sh       # 部署脚本（CI 调用，见下）
.github/workflows/           # GitHub Actions 工作流
docs/postbuild.ts            # 构建后生成旧 URL 重定向页面
```

## 关键架构细节

### 多语言（locales）

- 主配置 `docs/.vitepress/config.ts` 的 `locales` 声明三个语言；每个 locale 通过对应目录下的 `config.ts`（用 `defineAdditionalConfig`）提供自己的 nav/sidebar/文案：`docs/config.ts`（中文）、`docs/en/config.ts`、`docs/ja/config.ts`；V2 部分另有 `docs/v2/config.ts`、`docs/en/v2/config.ts`、`docs/ja/v2/config.ts`。
- **新增或重命名页面时，必须同步三语**：创建 `docs/<path>.md`、`docs/en/<path>.md`、`docs/ja/<path>.md`，并同时更新各语言 `config.ts` 的 nav/sidebar。英文/日文内容应真实翻译，不要留中文占位。
- 如果暂时没有翻译资源，至少要让三种语言的路径结构保持一致，避免构建出 404 侧边栏链接。

### 自定义主题（docs/.vitepress/theme/）

- `index.ts` 继承 `DefaultTheme`，通过 Layout 插槽注入：`doc-before` → `DocPageHeading`（页面标题）、`doc-after` → `GiscusComments`（评论）、`home-hero-image` → `HomeHeroScene`（首页动效）。
- `enhanceApp` 注册的全局组件可直接在 Markdown 中使用：`<DownloadTable />`、`<ExternalLinks />`、`<ModDownload />`、`<ModExternalLinks />`、`<NeteaseApiTable />`。
- **Vite 别名覆盖默认主题内部组件**：`docs/.vitepress/config.ts` 把 `VPNavBarMenuLink.vue`、`VPMenuLink.vue`、`VPSidebarItem.vue` 重定向到 `theme/components/` 下的同名自定义实现（主要用于站点图标渲染）。这些组件直接 import `vitepress/dist/client/theme-default/...` 的内部路径——升级 VitePress 版本时最容易在这里出问题，升级后必须逐一核对这些内部 API 是否仍然存在、签名是否变化。
- 组件内文案不走 VitePress locale，而是用 `theme/utils/i18n.ts` 里的 `useI18n()`：根据路由路径前缀（`/`、`/en/`、`/ja/`）取对应文案。**给组件加新文案时要同时加三语**。
- 公共网易云 API 列表等站点数据放在 `theme/data/`（如 `netease-api.ts`），改数据改这里，不要改组件。

### postbuild 重定向

`docs/postbuild.ts` 在构建后向 `dist` 写入一批 HTML meta-refresh 重定向页，用于兼容旧 URL（如 `/netease-api.html` → `/netease-api/public.html`）。页面路径发生破坏性变更时，应在这里追加对应的重定向条目（注意每个 locale 各一条）。

## 内容约定

- 文档与注释主要使用**中文**；en/ja 目录为对应语言的真实翻译。
- Markdown 页面使用 frontmatter 至少声明 `title:`；首页用 `layout: home`。
- 标题锚点显式声明，如 `# 介绍 {#introduction}`。
- V4 文档页面顶部统一有「V4 仍在开发中」的 warning 容器（三语各有对应文案），新增 V4 页面时保持这一约定。
- TypeScript 代码风格：ESM、单引号、无分号（参照现有 `.ts` 文件）；Vue 组件用 `<script setup lang="ts">`。
- 静态资源放在 `docs/public/` 下，引用路径以 `/` 开头（如 `/icons/xxx.svg`）。

## 部署（CI/CD）

- CI 使用 **GitHub Actions**，入口为 `.github/workflows/deploy-docs.yml`。
- 触发条件：push 到 `main` 且改动匹配 `docs/**`、`package.json`、`pnpm-lock.yaml`、`.npmrc`、`.node-version`、`mise.toml`、`.github/workflows/deploy-docs.yml`、`scripts/deploy-docs.sh`；也支持手动触发。
- 流水线（`ubuntu-latest`）：安装 pnpm 和项目指定的 Node.js 版本 → `pnpm install --frozen-lockfile` → `pnpm build` → 安装 openssh-client/rsync → `bash scripts/deploy-docs.sh`。
- `scripts/deploy-docs.sh` 通过 SSH/rsync 做**原子化发布**：上传到远端 `releases/<UTC时间戳>/`，再把 `$DEPLOY_TARGET` 软链接切换到新版本，保留最近 `DEPLOY_HISTORY_LIMIT`（默认 5）个历史版本。`DEPLOY_USER` 和 `DEPLOY_TARGET` 来自 GitHub Actions Variables，`DEPLOY_HOST`、`DEPLOY_PORT` 和 `SSH_PRIVATE_KEY` 来自 Actions Secrets。脚本会在部署时生成 SSH 配置，不单独保存 `SSH_CONFIG` 或 `SSH_KNOWN_HOSTS`；当前与现有部署项目一致，关闭了 SSH 主机密钥校验。
- **不要**在本地运行 `scripts/deploy-docs.sh`——它会向生产服务器发布。

## 安全注意事项

- 仓库内不存放任何密钥；SSH 部署地址、端口和私钥保存在 GitHub Actions Secrets。
- `docs/.vitepress/config.ts` 的 `head` 中含第三方脚本（Umami 统计、autoGray），不要随意新增外部脚本引用。
- `pnpm-lock.yaml` 应提交并保持冻结安装（`--frozen-lockfile`）；升级依赖后同步更新 lockfile。
- 依赖更新由 renovate 管理（`renovate.json`）。

## 其他

- 构建产物 `docs/.vitepress/dist/` 与缓存 `docs/.vitepress/cache/` 已 gitignore，不要提交。
- 本仓库 2026 年 3 月曾归档、文档一度迁入 zmusic-plugin 仓库，后迁回，两段历史通过合并提交保留（见 README「历史说明」）。
- Git 提交遵循 Conventional Commits；不要主动提交，除非用户明确要求。
