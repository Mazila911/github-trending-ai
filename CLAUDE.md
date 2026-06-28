# GitHub Trending AI (GTAI) - 项目开发指南

## 项目概述

面向 AI 应用开发者的 GitHub 热门开源项目展示网站。纯静态架构，Astro 5 SSG + Tailwind CSS v4 + Pagefind 搜索。

## Spec 文档

**实现任何功能前必须先阅读对应的 spec 章节：**

- `docs/spec.md` — 完整项目规格（功能、技术、UI、部署、验收标准）
- `docs/appendix.md` — 数据结构、脚本实现、部署指南

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Astro 5 (SSG, output: 'static') |
| CSS | Tailwind CSS v4 |
| 搜索 | Pagefind（构建后生成索引） |
| CI/CD | GitHub Actions |
| 部署 | Cloudflare Pages |
| 语言 | TypeScript |

## 代码规范

### Astro 组件
- 文件名使用 PascalCase：`ProjectCard.astro`
- Props 使用 TypeScript interface 定义在 frontmatter 中
- 零 JS 默认，仅搜索和回到顶部使用客户端脚本

### TypeScript
- 严格模式
- 类型定义集中在 `src/types/index.ts`
- 数据加载函数集中在 `src/lib/data.ts`
- 格式化工具集中在 `src/lib/format.ts`

### Tailwind CSS
- 使用 CSS 变量实现主题切换（深色默认）
- 响应式断点：sm(375px), md(641px), lg(1025px), xl(1440px)
- 所有颜色通过 CSS 变量引用，不硬编码

### 构建脚本
- 放在 `scripts/` 目录
- 使用 ESM (.mjs 后缀)
- 操作 `src/data/` 下的 JSON 文件

## 数据文件

| 文件 | 说明 |
|------|------|
| `src/data/projects.json` | 所有项目数据 |
| `src/data/trending.json` | 当前 trending 列表 |
| `src/data/spotlights.json` | 专题数据 |

## 验证命令

```bash
# 类型检查
npx tsc --noEmit

# 构建
npm run build

# 搜索索引（构建后）
npx pagefind --site dist

# 本地预览
npm run preview
```

## 页面路由

| 路由 | 文件 |
|------|------|
| `/` | `src/pages/index.astro` |
| `/trending` | `src/pages/trending.astro` |
| `/repo/:owner/:name` | `src/pages/repo/[owner]/[name].astro` |
| `/collections` | `src/pages/collections.astro` |
| `/collection/:slug` | `src/pages/collection/[slug].astro` |
| `/search` | `src/pages/search.astro` |
| `/projects` | `src/pages/projects.astro` |

## 关键约定

1. 所有页面使用 `BaseLayout.astro` 包裹
2. 项目描述优先显示 `description_zh`，fallback 到 `description`
3. Star 数使用格式化显示（如 12.3k）
4. 深色模式为默认主题，CSS 变量见 spec 6.2 节
5. 筛选状态通过 URL 查询参数传递，不使用全局状态库
6. 搜索历史存储在 localStorage，key 为 `gtai_search_history`
