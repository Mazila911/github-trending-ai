# GitHub Trending AI - 项目规格文档

> 面向 AI 应用开发者的 GitHub 热门开源项目展示网站
>
> 版本：1.0.0 | 最后更新：2026-06-28

---

## 目录

1. [项目概述](#1-项目概述)
2. [功能规格](#2-功能规格)
3. [技术规格](#3-技术规格)
4. [排名算法规格](#4-排名算法规格)
5. [AI 筛选模型规格](#5-ai-筛选模型规格)
6. [UI/UX 规格](#6-uiux-规格)
7. [部署规格](#7-部署规格)
8. [性能规格](#8-性能规格)
9. [成本估算](#9-成本估算)
10. [验收标准](#10-验收标准)

---

## 1. 项目概述

### 1.1 项目定位

**项目名称：** GitHub Trending AI（GTAI）

**定位：** 面向 AI 应用开发者的 GitHub 热门开源项目聚合展示平台，通过 AI 自动筛选和排名，帮助开发者快速发现高质量的 AI 相关开源项目。

**目标用户：**
- AI/ML 工程师和研究员
- 全栈开发者（关注 AI 工具链）
- 技术管理者（追踪 AI 技术趋势）
- 开源爱好者

### 1.2 核心价值主张

1. **实时追踪** — 自动抓取 GitHub Trending 数据，每日更新
2. **AI 精选** — 基于多维度 AI 评分模型，筛选明星项目
3. **榜单排名** — 综合排名算法，公平对待新老项目
4. **智能搜索** — 全文搜索 + 模糊匹配 + 筛选过滤
5. **专题策展** — AI 自动分类，按技术领域组织项目

### 1.3 技术栈总结

| 层面 | 技术选型 | 说明 |
|------|---------|------|
| 部署平台 | Cloudflare Pages + Functions | 静态分发 + 边缘 API |
| 数据抓取 | Cloudflare Worker + Cron Trigger | 定时任务 |
| 前端框架 | Astro 5 | SSG + Islands 架构 |
| CSS 框架 | Tailwind CSS v4 | 原子化 CSS |
| 组件库 | shadcn/ui | 可定制组件 |
| 数据库 | Cloudflare D1 | SQLite，支持 FTS5 |
| 缓存 | Cloudflare KV + Cache API | 边缘缓存 |
| 对象存储 | Cloudflare R2 | 图片/静态资源 |
| 搜索引擎 | D1 FTS5 | 全文搜索 |
| 月成本 | ~$5 | Workers Paid Plan |

---

## 2. 功能规格

### 2.1 页面结构

#### 2.1.1 页面清单

| 页面 | 路由 | 渲染方式 | 说明 |
|------|------|---------|------|
| 首页 | `/` | SSG | 总览入口，展示榜单、专题、搜索 |
| 榜单页 | `/trending` | SSG | 完整项目排名列表 |
| 项目详情页 | `/repo/:owner/:name` | SSG | 单个项目详细信息 |
| 专题页 | `/collections` | SSG | AI 筛选的各类专题集合 |
| 专题详情页 | `/collection/:slug` | SSG | 某专题下的完整项目列表 |
| 搜索结果页 | `/search` | CSR | 动态搜索结果 |

#### 2.1.2 导航关系

```
首页 (入口枢纽)
├── 榜单页 (顶部导航)
│   └── 项目详情页 (点击项目卡片)
├── 专题页 (顶部导航)
│   └── 专题详情页 (点击专题卡片)
│       └── 项目详情页 (点击项目)
├── 搜索结果页 (全局搜索框)
│   └── 项目详情页
└── 项目详情页 (首页精选直达)
```

### 2.2 首页

#### 2.2.1 Hero 区域

**布局：** 垂直居中，最大宽度 720px

**元素：**
1. **主标题** — "发现 AI 开发者最爱的开源项目"
2. **副标题** — "实时追踪 GitHub 热门项目，AI 精选专题推荐"
3. **搜索框** — 大尺寸，带图标，placeholder "搜索项目、技术栈、关键词..."
4. **热门标签** — 6-8 个可点击标签：`LLM` `RAG` `Agent` `Vector DB` `Fine-tuning` `MLOps` `Multimodal` `Code Gen`

**交互：**
- 搜索框输入时延迟 300ms 触发即时搜索
- 下拉显示 5 条搜索建议
- 点击标签跳转到 `/search?q=标签`
- 回车跳转到 `/search?q=关键词`

#### 2.2.2 今日热门区域

**标题：** "🔥 今日热门 Top 5"

**布局：**
- Top 1-3：大卡片（突出展示，包含描述、贡献者头像、语言标签）
- Top 4-5：紧凑列表行

**每个卡片包含：**
- 排名序号（Top 1-3 使用金银铜色徽章）
- 项目名称 (owner/repo)
- 项目描述（1-2 行截断）
- Star 总数（格式化，如 12.3k）
- 今日 Star 增长（如 "+1,470 stars today"，绿色）
- 编程语言标签（带颜色圆点）
- 贡献者头像（最多 5 个）

**底部：** "查看完整榜单 →" 链接跳转到 `/trending`

#### 2.2.3 AI 专题区域

**标题：** "✨ AI 精选专题"

**布局：** 横向滚动卡片组，支持鼠标拖拽和触摸滑动

**每个专题卡片包含：**
- 专题图标（emoji 或 SVG）
- 专题名称（中英文）
- 专题描述（1 行）
- 包含项目数量
- 3-5 个代表性项目头像

**底部：** "查看全部专题 →" 链接跳转到 `/collections`

**预设专题：**
1. 🤖 LLM 框架与工具
2. 📚 RAG 与知识库
3. 🕹️ AI Agent
4. 💻 代码生成与辅助
5. 🎨 多模态 AI
6. 🏋️ 模型训练与微调
7. ⚡ AI 基础设施
8. 📊 数据处理与分析

### 2.3 榜单页

#### 2.3.1 页面布局

```
┌─────────────────────────────────────────────────┐
│ 导航栏                                            │
├─────────────────────────────────────────────────┤
│ 标题: "GitHub Trending AI 榜单"                   │
│                                                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ 筛选栏: [时间: 今日▼] [语言: 全部▼] [排序▼] │ │
│ └─────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 项目卡片 1 ─────────────────────────────────┐ │
│ │ #1  owner/repo                                │ │
│ │ 描述...  ⭐ 12.3k  📈 +1,470 today  🟢 Python │ │
│ └───────────────────────────────────────────────┘ │
│ ┌─ 项目卡片 2 ─────────────────────────────────┐ │
│ │ #2  owner/repo                                │ │
│ │ 描述...  ⭐ 8.5k  📈 +890 today  🔵 TypeScript│ │
│ └───────────────────────────────────────────────┘ │
│ ...                                               │
│                                                   │
│ [加载更多...]                                     │
└─────────────────────────────────────────────────┘
```

#### 2.3.2 筛选/排序功能

**时间维度切换（Tab 式）：**
- 今日 (daily) — 默认
- 本周 (weekly)
- 本月 (monthly)

**语言筛选（下拉选择）：**
- 全部
- Python
- TypeScript / JavaScript
- Rust
- Go
- Java
- C++
- Jupyter Notebook

**排序方式（下拉选择）：**
- 综合排名（默认）
- Star 最多
- 最新创建
- 最近更新
- Trending 最热
- AI 评分最高

**星标范围筛选（可选）：**
- 1k - 10k
- 10k - 100k
- 100k+

#### 2.3.3 项目卡片设计

**卡片元素：**

| 元素 | 优先级 | 说明 |
|------|--------|------|
| 排名序号 | P0 | 大号显示，Top 3 使用金银铜色，带排名变化箭头 |
| 项目头像 | P1 | 40px 圆形，来自 owner_avatar_url |
| 项目名称 | P0 | owner/repo 格式，可点击跳转详情页 |
| 项目描述 | P0 | 1-2 行，超长截断，显示 description_zh 优先 |
| Star 总数 | P0 | 格式化显示（如 12.3k） |
| Star 增长 | P0 | 如 "+1,470 stars today"，绿色文字 |
| 编程语言 | P0 | 带颜色圆点的语言标签 |
| Fork 数 | P1 | 格式化显示 |
| 贡献者头像 | P1 | 最多显示 5 个圆形头像 |
| AI 评分 | P1 | 徽章样式，如 "AI 8.5" |
| 标签/Topics | P2 | 可点击的技术标签，最多显示 3 个 |

**排名变化指示：**
- 上升：绿色箭头 ↑ + 变化幅度
- 下降：红色箭头 ↓ + 变化幅度
- 持平：灰色横线 —
- 新上榜：蓝色 "NEW" 徽章

#### 2.3.4 无限滚动实现

**行为规范：**
- 首次加载 20 条
- 滚动到距底部 200px 时自动加载下一批
- 每批加载 20 条
- 加载中显示骨架屏 + "加载中..." 文字
- 全部加载完毕显示 "已加载全部 X 个项目"
- 提供"回到顶部"浮动按钮（滚动超过 500px 时显示）

**API 调用：**
```
GET /api/trending?period=daily&language=python&page=1&limit=20
```

### 2.4 项目详情页

#### 2.4.1 页面路由

```
/repo/:owner/:name
```

示例：`/repo/langchain-ai/langchain`

#### 2.4.2 页面布局

```
┌─────────────────────────────────────────────────┐
│ 导航栏                                            │
├─────────────────────────────────────────────────┤
│ 面包屑: 榜单 > Python > langchain                 │
│                                                   │
│ ┌─ 项目头部 ──────────────────────────────────┐ │
│ │ 🖼️ 项目头像   langchain-ai/langchain          │ │
│ │               ⭐ 95.2k  🍴 15.1k  👁️ 1.2k     │ │
│ │               🟢 Python  📜 MIT               │ │
│ │               [🔗 GitHub] [🌐 Homepage]       │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ AI 评分卡 ──────────────────────────────────┐ │
│ │ AI 综合评分: 87/100 (A级)                      │ │
│ │ 代码质量 ████████░░ 80                         │ │
│ │ 文档质量 █████████░ 90                         │ │
│ │ 社区健康 ████████░░ 85                         │ │
│ │ 项目活跃 █████████░ 95                         │ │
│ │ 创新性   ███████░░░ 75                         │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 项目描述 ──────────────────────────────────┐ │
│ │ AI 生成的 README 摘要...                       │ │
│ │ Topics: [langchain] [llm] [agent] [rag]       │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 趋势图表 ──────────────────────────────────┐ │
│ │ 📈 Star 增长趋势 (30天)                        │ │
│ │ [图表区域]                                     │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ ┌─ 相关推荐 ──────────────────────────────────┐ │
│ │ 相似项目推荐 (基于 topics 和 AI 标签)          │ │
│ │ [卡片1] [卡片2] [卡片3]                        │ │
│ └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 2.4.3 展示字段清单

| 字段 | 来源 | 说明 |
|------|------|------|
| 项目头像 | owner_avatar_url | 64px 圆形 |
| 项目名称 | full_name | owner/repo 格式 |
| 项目描述 | description_zh / description | 优先显示中文 |
| Star 数 | stargazers_count | 格式化 |
| Fork 数 | forks_count | 格式化 |
| Watcher 数 | watchers_count | 格式化 |
| 编程语言 | language | 带颜色圆点 |
| 许可证 | license_spdx | SPDX 标识 |
| Topics | topics | 可点击标签 |
| 创建时间 | created_at | 相对时间 |
| 最后更新 | pushed_at | 相对时间 |
| AI 评分 | ai_quality_score | 分项展示 |
| AI 标签 | ai_tags | 分类标签 |
| README 摘要 | readme_summary | AI 生成 |
| GitHub 链接 | html_url | 外部链接 |
| 官网链接 | homepage | 外部链接（可选） |
| Star 趋势 | 历史数据计算 | 30 天折线图 |

### 2.5 专题系统

#### 2.5.1 专题列表页 `/collections`

**布局：** 网格卡片，2 列（移动端 1 列）

**每个专题卡片包含：**
- 专题图标（大尺寸）
- 专题名称（中英文）
- 专题描述
- 包含项目数量
- 最后更新时间
- 3-5 个代表性项目头像
- "查看详情 →" 链接

#### 2.5.2 专题详情页 `/collection/:slug`

**布局：** 标准列表页，与榜单页类似

**顶部区域：**
- 专题图标 + 名称
- 专题描述
- AI 筛选标准说明
- 项目数量统计

**主体区域：** 项目卡片列表（与榜单卡片一致）

#### 2.5.3 预设专题定义

| slug | 名称 | 英文名 | 筛选逻辑 |
|------|------|--------|----------|
| `llm-frameworks` | LLM 框架与工具 | LLM Frameworks | topics 包含 llm, langchain, llamaindex, vllm 等 |
| `rag-tools` | RAG 与知识库 | RAG & Knowledge Base | topics 包含 rag, vector-database, embeddings 等 |
| `ai-agents` | AI Agent | AI Agents | topics 包含 ai-agent, agent, autonomous 等 |
| `code-gen` | 代码生成与辅助 | Code Generation | topics 包含 code-generation, copilot, code-review 等 |
| `multimodal` | 多模态 AI | Multimodal AI | topics 包含 multimodal, image-generation, speech 等 |
| `training` | 模型训练与微调 | Model Training | topics 包含 fine-tuning, training, lora, rlhf 等 |
| `infra` | AI 基础设施 | AI Infrastructure | topics 包含 inference, serving, deployment, mlops 等 |
| `data-tools` | 数据处理与分析 | Data Processing | topics 包含 etl, data-pipeline, analytics 等 |

#### 2.5.4 AI 专题筛选逻辑

```
筛选流程：
1. 每周执行一次专题筛选
2. 对每个专题定义的 topics 关键词进行匹配
3. 匹配条件：项目 topics 数组包含专题关键词（不区分大小写）
4. 额外过滤：
   - ai_quality_score >= 60
   - stargazers_count >= 100
   - NOT archived
   - pushed_at >= NOW() - 180 days
5. 按 ai_quality_score 降序排列
6. 每个专题最多保留 50 个项目
7. 结果写入 spotlights 和 spotlights_projects 表
```

### 2.6 搜索功能

#### 2.6.1 即时搜索（搜索框下拉）

**触发条件：**
- 输入延迟 300ms（debounce）
- 输入长度 >= 2 字符

**下拉内容：**
- 最多显示 5 条建议
- 每条包含：项目头像（24px）、项目名称、Star 数、语言标签
- 底部显示 "查看全部 X 条结果" 链接

**键盘导航：**
- ↑/↓ 箭头选择建议
- Enter 跳转到选中项目或搜索结果页
- Escape 关闭下拉

#### 2.6.2 搜索结果页 `/search?q=xxx`

**页面布局：**
- 左侧/顶部：筛选面板
- 右侧/主体：结果列表

**筛选条件：**
- 编程语言（下拉）
- 星标范围（下拉）
- 排序方式：相关度（默认）、Star 最多、最近更新、AI 评分最高
- 时间范围：创建时间、最近更新时间

**结果统计：** "找到 X 个匹配项目"

**结果展示：** 与榜单卡片样式一致

#### 2.6.3 搜索历史（本地存储）

**存储方式：** localStorage，key 为 `gtai_search_history`

**数据结构：**
```json
{
  "history": ["langchain", "llm agent", "vector database"],
  "maxItems": 10,
  "updatedAt": "2026-06-28T00:00:00Z"
}
```

**行为：**
- 搜索框获得焦点时，如果无输入，显示最近搜索历史
- 每条历史记录右侧有删除按钮（×）
- 提供"清除全部历史"选项
- 最多保留 10 条

#### 2.6.4 热门搜索

**数据来源：** 后端统计搜索频率，缓存到 KV

**展示位置：**
- Hero 区域的热门标签（硬编码 + 动态结合）
- 搜索框下拉区域（当无输入且无历史时）

---

## 3. 技术规格

### 3.1 项目结构

```
github-trending-ai/
├── public/                    # 静态资源
│   ├── favicon.svg
│   ├── og-image.png
│   └── fonts/
├── src/
│   ├── components/            # Astro 组件
│   │   ├── layout/            # 布局组件
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── BaseLayout.astro
│   │   ├── home/              # 首页组件
│   │   │   ├── Hero.astro
│   │   │   ├── TrendingPreview.astro
│   │   │   └── SpotlightCarousel.astro
│   │   ├── trending/          # 榜单组件
│   │   │   ├── ProjectCard.astro
│   │   │   ├── FilterBar.astro
│   │   │   └── InfiniteScroll.ts
│   │   ├── project/           # 项目详情组件
│   │   │   ├── ProjectHeader.astro
│   │   │   ├── AIScoreCard.astro
│   │   │   ├── StarChart.ts
│   │   │   └── RelatedProjects.astro
│   │   ├── search/            # 搜索组件
│   │   │   ├── SearchBox.ts    # Islands 组件
│   │   │   ├── SearchResults.ts
│   │   │   └── SearchFilters.astro
│   │   ├── collection/        # 专题组件
│   │   │   ├── CollectionCard.astro
│   │   │   └── CollectionHeader.astro
│   │   └── ui/                # 通用 UI 组件
│   │       ├── Badge.astro
│   │       ├── Skeleton.astro
│   │       ├── Pagination.astro
│   │       └── BackToTop.ts
│   ├── layouts/               # 页面布局
│   │   └── BaseLayout.astro
│   ├── pages/                 # 页面路由
│   │   ├── index.astro        # 首页
│   │   ├── trending.astro     # 榜单页
│   │   ├── repo/
│   │   │   └── [owner]/
│   │   │       └── [name].astro  # 项目详情页
│   │   ├── collections.astro  # 专题列表页
│   │   ├── collection/
│   │   │   └── [slug].astro   # 专题详情页
│   │   └── search.astro       # 搜索结果页（CSR）
│   ├── lib/                   # 工具函数
│   │   ├── db.ts              # D1 数据库操作
│   │   ├── github.ts          # GitHub API 封装
│   │   ├── format.ts          # 数字/日期格式化
│   │   ├── cache.ts           # 缓存操作
│   │   └── search.ts          # 搜索逻辑
│   ├── styles/                # 全局样式
│   │   └── global.css
│   └── types/                 # TypeScript 类型
│       └── index.ts
├── worker/                    # Cron Worker（数据抓取）
│   ├── src/
│   │   ├── index.ts           # Worker 入口
│   │   ├── crawler.ts         # Trending 爬虫
│   │   ├── github-api.ts      # GitHub API 调用
│   │   ├── ai-scorer.ts       # AI 评分计算
│   │   └── spotlight.ts       # 专题筛选
│   └── wrangler.toml
├── functions/                 # Pages Functions（API）
│   └── api/
│       ├── trending.ts
│       ├── search.ts
│       ├── projects/
│       │   └── [id].ts
│       ├── spotlights.ts
│       ├── spotlights/
│       │   └── [id].ts
│       └── stats.ts
├── schema.sql                 # D1 建表 SQL
├── astro.config.mjs           # Astro 配置
├── tailwind.config.mjs        # Tailwind 配置
├── wrangler.toml              # Pages 部署配置
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 前端架构

#### 3.2.1 Astro 配置

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'hybrid', // SSG 为主，部分页面 CSR
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    tailwind(),
    react(), // 用于 Islands 组件
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify('https://gtai.dev'),
    },
  },
});
```

#### 3.2.2 Islands 架构

**原则：** 零 JS 默认，仅交互组件使用 Islands

**需要 Islands 的组件：**
- `SearchBox.ts` — 搜索框即时搜索
- `InfiniteScroll.ts` — 无限滚动
- `StarChart.ts` — Star 趋势图表
- `BackToTop.ts` — 回到顶部按钮
- `SearchResults.ts` — 搜索结果动态加载

**不需要 Islands 的组件（纯 Astro）：**
- 所有布局组件
- 卡片组件
- 筛选组件（使用表单提交）
- 页头/页脚

#### 3.2.3 状态管理

**方案：URL 参数 + 本地存储，无全局状态库**

- 筛选状态：URL 查询参数（`?language=python&period=daily`）
- 搜索历史：localStorage
- 主题偏好：localStorage + CSS 变量

### 3.3 后端架构

#### 3.3.1 Pages Functions 路由

| 路由 | 方法 | 处理文件 | 说明 |
|------|------|---------|------|
| `/api/trending` | GET | `functions/api/trending.ts` | 榜单列表 |
| `/api/search` | GET | `functions/api/search.ts` | 搜索 |
| `/api/projects/:id` | GET | `functions/api/projects/[id].ts` | 项目详情 |
| `/api/spotlights` | GET | `functions/api/spotlights.ts` | 专题列表 |
| `/api/spotlights/:id` | GET | `functions/api/spotlights/[id].ts` | 专题详情 |
| `/api/stats` | GET | `functions/api/stats.ts` | 统计数据 |

#### 3.3.2 API 中间件

```typescript
// functions/api/_middleware.ts
export const onRequest: PagesFunction<Env> = async (context) => {
  // 1. CORS 处理
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // 2. 缓存检查
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return new Response(cachedResponse.body, {
      ...cachedResponse,
      headers: { ...cachedResponse.headers, ...corsHeaders, 'X-Cache': 'HIT' },
    });
  }

  // 3. 执行请求
  const response = await context.next();

  // 4. 缓存响应
  const responseToCache = new Response(response.body, {
    ...response,
    headers: {
      ...response.headers,
      'Cache-Control': 'public, max-age=1800', // 30 分钟
    },
  });
  context.waitUntil(cache.put(cacheKey, responseToCache.clone()));

  return new Response(responseToCache.body, {
    ...responseToCache,
    headers: { ...responseToCache.headers, ...corsHeaders, 'X-Cache': 'MISS' },
  });
};
```

### 3.4 数据库设计

#### 3.4.1 D1 表结构

```sql
-- ============================================================
-- 项目主表
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,               -- GitHub 仓库 ID
  full_name TEXT UNIQUE NOT NULL,        -- owner/repo
  name TEXT NOT NULL,                    -- repo 名称
  owner_login TEXT NOT NULL,             -- 所有者用户名
  owner_avatar_url TEXT,                 -- 头像 URL
  owner_type TEXT DEFAULT 'User',        -- User 或 Organization
  description TEXT,                      -- 英文描述
  description_zh TEXT,                   -- 中文描述（AI 翻译）
  html_url TEXT NOT NULL,                -- GitHub 链接
  homepage TEXT,                         -- 项目官网
  language TEXT,                         -- 主要编程语言
  languages_breakdown TEXT,              -- 语言占比 JSON
  topics TEXT,                           -- 标签 JSON 数组
  stargazers_count INTEGER DEFAULT 0,    -- Star 数
  forks_count INTEGER DEFAULT 0,         -- Fork 数
  open_issues_count INTEGER DEFAULT 0,   -- 开放 Issue 数
  watchers_count INTEGER DEFAULT 0,      -- Watcher 数
  contributors_count INTEGER DEFAULT 0,  -- 贡献者数量
  size_kb INTEGER DEFAULT 0,             -- 仓库大小
  license_spdx TEXT,                     -- 许可证 SPDX ID
  archived INTEGER DEFAULT 0,            -- 是否归档
  is_fork INTEGER DEFAULT 0,             -- 是否 Fork
  has_wiki INTEGER DEFAULT 0,
  has_discussions INTEGER DEFAULT 0,
  default_branch TEXT DEFAULT 'main',
  readme_summary TEXT,                   -- README AI 摘要
  ai_quality_score REAL DEFAULT 0,       -- AI 质量评分 0-100
  ai_tags TEXT,                          -- AI 标签 JSON 数组
  trending_score REAL DEFAULT 0,         -- 趋势得分 0-100
  comprehensive_rank INTEGER,            -- 综合排名
  star_velocity_7d REAL DEFAULT 0,       -- 近 7 天 Star 日均增速
  star_velocity_30d REAL DEFAULT 0,      -- 近 30 天 Star 日均增速
  created_at TEXT,                       -- GitHub 创建时间
  updated_at TEXT,                       -- GitHub 更新时间
  pushed_at TEXT,                        -- 最后推送时间
  created_in_db TEXT DEFAULT (datetime('now')),
  updated_in_db TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- 每日快照表
-- ============================================================
CREATE TABLE IF NOT EXISTS project_daily_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  snapshot_date TEXT NOT NULL,
  stargazers_count INTEGER,
  forks_count INTEGER,
  open_issues_count INTEGER,
  watchers_count INTEGER,
  trending_stars INTEGER DEFAULT 0,      -- 当日新增 Star
  trending_score REAL,
  ai_quality_score REAL,
  comprehensive_rank INTEGER,
  UNIQUE(project_id, snapshot_date)
);

-- ============================================================
-- 榜单记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS trending_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  rank INTEGER NOT NULL,
  trending_stars INTEGER,
  category TEXT DEFAULT 'overall',       -- overall, python, typescript...
  period TEXT DEFAULT 'daily'            -- daily, weekly, monthly
);

-- ============================================================
-- 专题表
-- ============================================================
CREATE TABLE IF NOT EXISTS spotlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT,
  description TEXT,
  description_zh TEXT,
  icon TEXT,                             -- emoji 或图标名
  category TEXT,                         -- 分类
  ai_criteria TEXT,                      -- AI 筛选条件 JSON
  project_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- 专题-项目关联表
-- ============================================================
CREATE TABLE IF NOT EXISTS spotlight_projects (
  spotlight_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  rank INTEGER DEFAULT 0,
  added_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (spotlight_id, project_id)
);

-- ============================================================
-- FTS5 全文搜索虚拟表
-- ============================================================
CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts USING fts5(
  name,
  description,
  description_zh,
  topics,
  readme_summary,
  content='projects',
  content_rowid='id'
);

-- ============================================================
-- FTS5 同步触发器
-- ============================================================
CREATE TRIGGER IF NOT EXISTS projects_ai AFTER INSERT ON projects BEGIN
  INSERT INTO projects_fts(rowid, name, description, description_zh, topics, readme_summary)
  VALUES (new.id, new.name, new.description, new.description_zh, new.topics, new.readme_summary);
END;

CREATE TRIGGER IF NOT EXISTS projects_ad AFTER DELETE ON projects BEGIN
  INSERT INTO projects_fts(projects_fts, rowid, name, description, description_zh, topics, readme_summary)
  VALUES ('delete', old.id, old.name, old.description, old.description_zh, old.topics, old.readme_summary);
END;

CREATE TRIGGER IF NOT EXISTS projects_au AFTER UPDATE ON projects BEGIN
  INSERT INTO projects_fts(projects_fts, rowid, name, description, description_zh, topics, readme_summary)
  VALUES ('delete', old.id, old.name, old.description, old.description_zh, old.topics, old.readme_summary);
  INSERT INTO projects_fts(rowid, name, description, description_zh, topics, readme_summary)
  VALUES (new.id, new.name, new.description, new.description_zh, new.topics, new.readme_summary);
END;
```

#### 3.4.2 索引设计

```sql
-- 性能索引
CREATE INDEX IF NOT EXISTS idx_projects_stars ON projects(stargazers_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_language ON projects(language);
CREATE INDEX IF NOT EXISTS idx_projects_trending ON projects(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_ai_score ON projects(ai_quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_projects_rank ON projects(comprehensive_rank);
CREATE INDEX IF NOT EXISTS idx_projects_pushed ON projects(pushed_at);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_snapshots_date ON project_daily_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_project ON project_daily_snapshots(project_id);

CREATE INDEX IF NOT EXISTS idx_trending_date ON trending_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_trending_category ON trending_snapshots(category, date);

CREATE INDEX IF NOT EXISTS idx_spotlight_slug ON spotlights(slug);
CREATE INDEX IF NOT EXISTS idx_spotlight_proj ON spotlight_projects(project_id);
```

### 3.5 数据抓取 Worker

#### 3.5.1 Worker 结构

```typescript
// worker/src/index.ts
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  GITHUB_TOKEN: string;
}

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  GITHUB_TOKEN: string;
  OPENAI_API_KEY: string;  // 用于 AI 评分和翻译
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('[Crawler] Starting scheduled crawl...');

    try {
      // 1. 抓取 GitHub Trending
      const trendingProjects = await crawlTrending();
      console.log(`[Crawler] Found ${trendingProjects.length} trending projects`);

      // 2. 补充 GitHub API 详情
      const enrichedProjects = await enrichProjects(trendingProjects, env.GITHUB_TOKEN);
      console.log(`[Crawler] Enriched ${enrichedProjects.length} projects`);

      // 3. 生成中文描述和 README 摘要
      const projectsWithAI = await generateAIDescriptions(enrichedProjects, env.OPENAI_API_KEY);
      console.log(`[Crawler] Generated AI descriptions for ${projectsWithAI.length} projects`);

      // 4. 写入 D1
      await upsertProjects(env.DB, projectsWithAI);
      console.log('[Crawler] Database updated');

      // 5. 更新排名
      await updateRankings(env.DB);
      console.log('[Crawler] Rankings updated');

      // 6. 清除缓存
      await env.CACHE.put('last_crawl', new Date().toISOString());
      console.log('[Crawler] Crawl completed successfully');
    } catch (error) {
      console.error('[Crawler] Error:', error);
      throw error;
    }
  },
};
```

#### 3.5.2 抓取逻辑

```typescript
// worker/src/crawler.ts
interface TrendingProject {
  fullName: string;
  name: string;
  owner: string;
  description: string;
  language: string;
  starsToday: number;
  totalStars: number;
  forks: number;
}

async function crawlTrending(): Promise<TrendingProject[]> {
  const languages = [
    '', 'python', 'typescript', 'javascript', 'rust', 'go', 'java', 'c++'
  ];
  const projects: TrendingProject[] = [];

  for (const lang of languages) {
    const url = lang
      ? `https://github.com/trending/${lang}?spoken_language_code=en`
      : 'https://github.com/trending?spoken_language_code=en';

    const html = await fetch(url).then(r => r.text());
    const parsed = parseTrendingHTML(html);
    projects.push(...parsed);

    // 请求间隔
    await sleep(2000);
  }

  // 去重
  return deduplicateByFullName(projects);
}
```

#### 3.5.3 AI 描述生成（中文翻译 + README 摘要）

```typescript
// worker/src/ai-generator.ts
interface AIContent {
  description_zh: string;
  readme_summary: string;
}

async function generateAIDescriptions(
  projects: EnrichedProject[],
  apiKey: string
): Promise<EnrichedProject[]> {
  const results: EnrichedProject[] = [];

  for (const project of projects) {
    try {
      // 仅对新项目或描述有变化的项目生成 AI 内容
      const existingProject = await getProjectFromDB(project.id);
      if (existingProject && existingProject.description === project.description) {
        results.push({ ...project, ...existingProject });
        continue;
      }

      const aiContent = await generateAIContent(project, apiKey);
      results.push({ ...project, ...aiContent });

      // 速率限制：每秒最多 10 个请求
      await sleep(100);
    } catch (error) {
      console.error(`[AI] Failed for ${project.full_name}:`, error);
      // 降级：使用英文描述
      results.push({
        ...project,
        description_zh: project.description,
        readme_summary: project.description?.slice(0, 200),
      });
    }
  }

  return results;
}

async function generateAIContent(project: EnrichedProject, apiKey: string): Promise<AIContent> {
  const prompt = `
请为以下 GitHub 项目生成：
1. 中文描述（简洁准确，不超过 200 字）
2. README 摘要（一句话概括核心价值，不超过 100 字）

项目信息：
- 名称：${project.full_name}
- 描述：${project.description}
- 语言：${project.language}
- Topics：${project.topics?.join(', ')}

请以 JSON 格式返回：
{
  "description_zh": "中文描述",
  "readme_summary": "一句话摘要"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',  // 使用 mini 模型降低成本
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
```

#### 3.5.4 GitHub API 速率限制处理

```typescript
// worker/src/github-api.ts
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;  // Unix 时间戳
}

async function fetchWithRateLimit(url: string, token: string): Promise<Response> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Trending-AI',
  };

  let retries = 3;
  while (retries > 0) {
    const response = await fetch(url, { headers });

    // 检查速率限制
    const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '1000');
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

    if (remaining < 100) {
      // 接近限制，等待重置
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limit low (${remaining}), waiting ${waitTime}ms`);
      await sleep(waitTime);
    }

    if (response.status === 403 || response.status === 429) {
      // 已被限流，等待重置
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limited, waiting ${waitTime}ms`);
      await sleep(waitTime);
      retries--;
      continue;
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response;
  }

  throw new Error('GitHub API max retries exceeded');
}

// 批量获取项目详情（使用 GraphQL 减少请求数）
async function fetchProjectsBatch(fullNames: string[], token: string): Promise<any[]> {
  const query = `
    query($repos: [String!]!) {
      nodes(ids: $repos) {
        ... on Repository {
          id
          nameWithOwner
          description
          stargazerCount
          forkCount
          watchers { totalCount }
          issues(states: OPEN) { totalCount }
          licenseInfo { spdxId }
          primaryLanguage { name }
          repositoryTopics(first: 20) { nodes { topic { name } } }
          createdAt
          updatedAt
          pushedAt
          isArchived
          isFork
          homepageUrl
          hasWikiEnabled
          hasDiscussionsEnabled
          defaultBranchRef { name }
          collaborators { totalCount }
        }
      }
    }
  `;

  // GraphQL 单次请求可获取多个项目，大幅减少 API 调用
  const response = await fetchWithRateLimit('https://api.github.com/graphql', token);
  // ... 处理响应
}
```

#### 3.5.5 Star Velocity 计算

```typescript
// worker/src/velocity.ts

/**
 * 计算 Star 增速
 *
 * @param currentStars - 当前 Star 数
 * @param snapshotDate - 目标日期的快照 Star 数
 * @param days - 天数
 * @returns 日均 Star 增速
 */
function calculateVelocity(currentStars: number, snapshotDate: number, days: number): number {
  if (days <= 0) return 0;
  return (currentStars - snapshotDate) / days;
}

// 在排名更新时计算
async function updateStarVelocity(db: D1Database) {
  const projects = await db.prepare(`
    SELECT
      p.id,
      p.stargazers_count,
      s7.stargazers_count as stars_7d_ago,
      s30.stargazers_count as stars_30d_ago
    FROM projects p
    LEFT JOIN project_daily_snapshots s7
      ON p.id = s7.project_id AND s7.snapshot_date = date('now', '-7 days')
    LEFT JOIN project_daily_snapshots s30
      ON p.id = s30.project_id AND s30.snapshot_date = date('now', '-30 days')
  `).all();

  for (const project of projects.results) {
    const velocity7d = calculateVelocity(
      project.stargazers_count,
      project.stars_7d_ago || project.stargazers_count,
      7
    );
    const velocity30d = calculateVelocity(
      project.stargazers_count,
      project.stars_30d_ago || project.stargazers_count,
      30
    );

    await db.prepare(`
      UPDATE projects
      SET star_velocity_7d = ?, star_velocity_30d = ?
      WHERE id = ?
    `).bind(velocity7d, velocity30d, project.id).run();
  }
}
```

#### 3.5.6 Cron 配置

```toml
# worker/wrangler.toml
name = "github-trending-crawler"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
GITHUB_TOKEN = "xxx"  # 生产环境使用 secrets

[[d1_databases]]
binding = "DB"
database_name = "github-trending-ai"
database_id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"

[triggers]
crons = ["0 */6 * * *"]  # 每 6 小时执行一次
```

---

## 4. 排名算法规格

### 4.0 归一化函数定义

```javascript
/**
 * Min-Max 归一化函数
 * 将值归一化到 0-100 范围
 *
 * @param {number} value - 待归一化的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 归一化后的值 (0-100)
 */
function normalize(value, min = 0, max = 100) {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * 带对数变换的归一化
 * 用于 Star 数等长尾分布的数据
 *
 * @param {number} value - 待归一化的值
 * @param {number} maxValue - 最大值
 * @returns {number} 归一化后的值 (0-100)
 */
function logNormalize(value, maxValue = 200000) {
  return Math.log10(value + 1) / Math.log10(maxValue + 1) * 100;
}

/**
 * Z-Score 归一化
 * 用于需要考虑均值和标准差的场景
 *
 * @param {number} value - 待归一化的值
 * @param {number} mean - 均值
 * @param {number} std - 标准差
 * @returns {number} 归一化后的值 (0-100)
 */
function zScoreNormalize(value, mean, std) {
  if (std === 0) return 50;
  const z = (value - mean) / std;
  // 将 z-score 映射到 0-100（假设 z 在 -3 到 3 之间）
  return normalize(z, -3, 3);
}
```

### 4.1 综合排名公式

```
comprehensive_score = (
    w1 * normalize(star_score) +
    w2 * normalize(trending_score) +
    w3 * normalize(ai_quality_score) +
    w4 * normalize(activity_score) +
    w5 * normalize(impact_score)
)
```

**权重：**

| 维度 | 权重 | 说明 |
|------|------|------|
| Star 总量 | 15% | 项目受欢迎程度基础指标 |
| Star 增速 (trending) | 25% | 近期热度 |
| AI 质量评分 | 30% | 综合质量评估 |
| 社区活跃度 | 15% | Issue/PR 活跃度 |
| 生态影响力 | 15% | Fork 数、被引用数 |

### 4.2 Star Score

```javascript
// 使用对数归一化，避免超级大项目碾压小项目
function calculateStarScore(stars, maxStars = 200000) {
  return Math.log10(stars + 1) / Math.log10(maxStars + 1) * 100;
}

// 示例：
// 100 stars   → 38.3
// 10,000 stars → 72.5
// 100,000 stars → 87.0
```

### 4.3 Trending Score

```javascript
function calculateTrendingScore(project, snapshots) {
  const starsGained7d = sumLast(snapshots, 'trending_stars', 7);
  const starsGained30d = sumLast(snapshots, 'trending_stars', 30);
  const avgDaily30d = starsGained30d / 30;
  const todayStars = snapshots[0]?.trending_stars || 0;
  const acceleration = todayStars / (avgDaily30d + 1);

  const score = (
    0.5 * normalize(starsGained7d) +
    0.3 * normalize(starsGained30d) +
    0.2 * normalize(acceleration)
  );

  // 新鲜度衰减
  const daysSincePush = daysBetween(project.pushed_at, new Date());
  return score * freshnessDecay(daysSincePush);
}

function freshnessDecay(days) {
  if (days <= 1) return 1.0;
  if (days <= 7) return 0.95;
  if (days <= 30) return 0.85;
  if (days <= 90) return 0.6;
  if (days <= 365) return 0.3;
  return 0.1;
}
```

### 4.4 新老项目公平性

```javascript
// 年龄段分桶归一化
function getAgeBucket(ageDays) {
  if (ageDays < 30) return 'newborn';
  if (ageDays < 180) return 'young';
  if (ageDays < 730) return 'mature';
  return 'veteran';
}

// 新生项目加分
function getNewbornBonus(ageDays) {
  if (ageDays >= 30) return 0;
  return ((30 - ageDays) / 30) * 10; // 最高加 10 分
}
```

---

## 5. AI 筛选模型规格

### 5.1 评分维度和权重

| 维度 | 权重 | 评估方式 | 更新频率 |
|------|------|---------|---------|
| 代码质量 | 20% | 结构化指标 | 每周 |
| 文档完整度 | 15% | 结构化指标 | 每周 |
| 社区健康度 | 15% | 结构化指标 | 每周 2 次 |
| 项目活跃度 | 15% | 结构化指标 | 每日 |
| 创新性 | 15% | LLM 评估 | 每月 |
| 实用性 | 10% | 结构化指标 | 每周 |
| 生态适配性 | 10% | 结构化指标 | 每周 |

### 5.2 各维度评分公式

#### 代码质量 (20%)

```javascript
function codeQualityScore(project, repoDetails) {
  return (
    0.30 * bool(repoDetails.has_ci_cd) +
    0.20 * bool(repoDetails.has_tests) +
    0.15 * bool(repoDetails.has_code_of_conduct) +
    0.15 * bool(repoDetails.has_contributing_guide) +
    0.10 * licenseScore(project.license_spdx) +
    0.10 * bool(!project.archived)
  ) * 100;
}

function licenseScore(license) {
  const permissive = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'];
  if (permissive.includes(license)) return 1.0;
  if (license?.startsWith('GPL')) return 0.7;
  if (!license) return 0.2;
  return 0.5;
}
```

#### 文档完整度 (15%)

```javascript
function documentationScore(readmeLength, hasApiDocs, hasExamples, hasWiki, hasChangelog) {
  const readmeScore = readmeLength < 100 ? 0.1
    : readmeLength < 500 ? 0.4
    : readmeLength < 2000 ? 0.7
    : 1.0;

  return (
    0.35 * readmeScore +
    0.25 * bool(hasApiDocs) +
    0.20 * bool(hasExamples) +
    0.10 * bool(hasWiki) +
    0.10 * bool(hasChangelog)
  ) * 100;
}
```

#### 社区健康度 (15%)

```javascript
function communityHealthScore(project, stats) {
  const diversity = project.contributor_count <= 1 ? 0.3
    : project.contributor_count <= 5 ? 0.6
    : project.contributor_count <= 20 ? 0.8
    : 1.0;

  return (
    0.30 * responseSpeedScore(stats.avg_issue_response_hours) +
    0.25 * diversity +
    0.20 * stats.issue_close_rate +
    0.15 * stats.pr_merge_rate +
    0.10 * bool(stats.has_code_of_conduct)
  ) * 100;
}
```

#### 创新性 (15%) — LLM 评估

```javascript
// 每月使用 LLM 评估一次
const INNOVATION_PROMPT = `
评估以下开源项目在 AI 开发领域的创新性（0-100 分）：

项目名称：{name}
描述：{description}
标签：{topics}
语言：{language}
README 摘要：{readme_summary}

评分标准：
1. 是否解决了新的技术问题（25%）
2. 技术方案是否有独特之处（25%）
3. 是否引入了新的架构模式（25%）
4. 与同类项目的差异化程度（25%）

请返回一个 0-100 的整数分数，只返回数字。
`;
```

### 5.3 明星项目定义

```javascript
function isStarProject(project) {
  return (
    project.ai_quality_score >= 75 &&
    project.stargazers_count >= 500 &&
    daysSince(project.pushed_at) <= 90 &&
    !project.archived &&
    project.license_spdx !== null
  );
}

function getProjectTier(project) {
  if (project.ai_quality_score >= 90 && project.stargazers_count >= 5000) return 'S';
  if (project.ai_quality_score >= 80 && project.stargazers_count >= 1000) return 'A';
  if (project.ai_quality_score >= 75 && project.stargazers_count >= 500) return 'B';
  return null;
}
```

---

## 6. UI/UX 规格

### 6.1 响应式断点

| 断点 | 宽度 | CSS 变量 | 布局策略 |
|------|------|---------|---------|
| Mobile S | < 375px | `--bp-xs` | 单列，卡片全宽 |
| Mobile | 375-640px | `--bp-sm` | 单列，卡片全宽 |
| Tablet | 641-1024px | `--bp-md` | 双列卡片 |
| Desktop | 1025-1440px | `--bp-lg` | 标准布局 |
| Wide | > 1440px | `--bp-xl` | 最大宽度 1280px 居中 |

### 6.2 主题系统

**默认：深色模式**，支持亮色切换

**CSS 变量定义：**

```css
:root {
  /* 深色模式（默认） */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-bg-card: #1c2128;
  --color-bg-hover: #252c35;
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-muted: #484f58;
  --color-border: #30363d;
  --color-accent: #58a6ff;
  --color-accent-hover: #79c0ff;
  --color-success: #3fb950;
  --color-warning: #d29922;
  --color-danger: #f85149;
  --color-star: #e3b341;
  --color-fork: #8b949e;

  /* 排名颜色 */
  --color-rank-gold: #ffd700;
  --color-rank-silver: #c0c0c0;
  --color-rank-bronze: #cd7f32;

  /* 语言颜色 */
  --color-lang-python: #3572A5;
  --color-lang-typescript: #3178c6;
  --color-lang-javascript: #f1e05a;
  --color-lang-rust: #dea584;
  --color-lang-go: #00ADD8;
  --color-lang-java: #b07219;

  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;

  /* 间距 */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* 圆角 */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
}

[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f6f8fa;
  --color-bg-card: #ffffff;
  --color-bg-hover: #f3f4f6;
  --color-text-primary: #1f2328;
  --color-text-secondary: #656d76;
  --color-text-muted: #8b949e;
  --color-border: #d0d7de;
  --color-accent: #0969da;
  --color-accent-hover: #0550ae;
}
```

### 6.3 动效设计

| 交互 | 动效 | 持续时间 | 缓动 |
|------|------|---------|------|
| 卡片 Hover | translateY(-2px) + 阴影加深 | 200ms | ease-out |
| 排名变化 | 数字翻转动画 | 300ms | ease-in-out |
| 搜索框展开 | 宽度过渡 | 300ms | ease |
| 页面切换 | fade-in | 200ms | ease |
| 标签点击 | scale(0.95 → 1) | 150ms | ease-out |
| 骨架屏加载 | shimmer 扫光 | 1.5s | linear infinite |
| 加载完成 | cross-fade | 300ms | ease |
| Star 数字 | count-up 滚动 | 500ms | ease-out |

### 6.4 加载状态

**骨架屏规范：**

```html
<!-- 项目卡片骨架 -->
<div class="skeleton-card">
  <div class="skeleton-rank skeleton-shimmer"></div>
  <div class="skeleton-avatar skeleton-shimmer"></div>
  <div class="skeleton-title skeleton-shimmer"></div>
  <div class="skeleton-desc skeleton-shimmer"></div>
  <div class="skeleton-tags">
    <span class="skeleton-tag skeleton-shimmer"></span>
    <span class="skeleton-tag skeleton-shimmer"></span>
  </div>
</div>
```

**加载超时处理：**
- 骨架屏最多显示 3 秒
- 超时后显示 "加载失败" + 重试按钮
- 网络错误显示专用错误页

### 6.5 空状态设计

| 场景 | 图标 | 标题 | 描述 | 行动 |
|------|------|------|------|------|
| 搜索无结果 | 🔍 | 未找到匹配的项目 | 试试修改搜索词或浏览热门项目 | 热门搜索标签 |
| 专题为空 | 📭 | 该专题暂无项目 | 我们正在努力筛选 | 返回专题列表 |
| 网络错误 | 🌐 | 网络连接失败 | 请检查网络设置 | 重试按钮 |
| 404 | 🤔 | 页面未找到 | 您访问的页面不存在 | 返回首页 + 搜索 |
| 500 | ⚠️ | 服务器错误 | 我们正在修复中 | 重试按钮 |

---

## 7. 部署规格

### 7.1 Cloudflare 资源配置

#### 7.1.1 D1 数据库

```bash
# 创建数据库
wrangler d1 create github-trending-ai

# 执行建表 SQL
wrangler d1 execute github-trending-ai --file=./schema.sql

# 验证
wrangler d1 execute github-trending-ai --command "SELECT name FROM sqlite_master WHERE type='table'"
```

#### 7.1.2 KV 命名空间

```bash
# 创建 KV
wrangler kv:namespace create CACHE

# 输出类似：
# { binding = "CACHE", id = "xxxxxxxxxx" }
```

#### 7.1.3 R2 存储桶

```bash
# 创建 R2 桶
wrangler r2 bucket create github-trending-ai-assets
```

### 7.2 wrangler.toml（Pages）

```toml
# wrangler.toml
name = "github-trending-ai"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "github-trending-ai"
database_id = "xxx"  # 替换为实际 ID

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"  # 替换为实际 ID

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "github-trending-ai-assets"

[vars]
PUBLIC_SITE_URL = "https://gtai.dev"
```

### 7.3 环境变量

| 变量 | 说明 | 设置方式 |
|------|------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `wrangler secret put` |
| `PUBLIC_SITE_URL` | 站点 URL | wrangler.toml |
| `OPENAI_API_KEY` | OpenAI API（AI 评分用） | `wrangler secret put` |

### 7.4 构建和部署脚本

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "wrangler pages dev dist",
    "deploy": "astro build && wrangler pages deploy dist",
    "db:init": "wrangler d1 execute github-trending-ai --file=./schema.sql",
    "db:seed": "wrangler d1 execute github-trending-ai --file=./seed.sql",
    "worker:deploy": "cd worker && wrangler deploy",
    "worker:test": "cd worker && wrangler dev"
  }
}
```

### 7.5 CI/CD（GitHub Actions）

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name github-trending-ai
```

---

## 8. 性能规格

### 8.1 性能指标目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| FCP | < 1.0s | First Contentful Paint |
| LCP | < 2.0s | Largest Contentful Paint |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTI | < 2.0s | Time to Interactive |
| TTFB | < 200ms | Time to First Byte |
| 搜索响应 | < 200ms | API 响应时间 |
| 页面大小 | < 100KB | 首页 HTML + CSS（不含图片） |

### 8.2 缓存策略

| 资源 | 缓存层 | TTL | 说明 |
|------|--------|-----|------|
| 页面 HTML | Cloudflare CDN | 1 小时 | SSG 页面 |
| API 响应 | Cache API | 30 分钟 | /api/trending 等 |
| 搜索结果 | KV | 5 分钟 | 热门搜索词 |
| 项目详情 | Cache API | 1 小时 | 变化不频繁 |
| 静态资源（CSS/JS） | CDN | 1 年 | 带 hash 的文件名 |
| 图片 | R2 + CDN | 1 天 | 项目头像等 |
| 字体 | CDN | 1 年 | woff2 格式 |

### 8.3 优化方案

1. **SSG 预渲染** — 榜单、专题页面构建时生成，CDN 直接分发
2. **零 JS 默认** — 列表页纯 HTML+CSS，减少 JS 传输
3. **Islands 按需加载** — 搜索、图表等交互组件懒加载
4. **图片优化** — WebP 格式 + 懒加载 + blur placeholder
5. **字体优化** — `font-display: swap` + 系统字体回退
6. **预加载** — `<link rel="preload">` 关键资源
7. **压缩** — Brotli 压缩 HTML/CSS/JS
8. **HTTP/2** — Cloudflare 默认支持

---

## 9. 成本估算

### 9.1 Cloudflare 免费额度

| 资源 | 免费额度 | 本项目预估用量 | 是否充足 |
|------|---------|---------------|---------|
| Pages 请求 | 无限 | 主要流量 | ✅ |
| Pages Functions | 50 万/月 | 10-30 万/月 | ✅ |
| Workers 请求 | 10 万/天 | 4 次/天 | ✅ |
| D1 读取 | 1000 万/天 | 5-20 万/天 | ✅ |
| D1 写入 | 100 万/天 | 1-5 万/天 | ✅ |
| D1 存储 | 5GB | 50-200MB | ✅ |
| KV 读取 | 10 万/天 | 2-5 万/天 | ✅ |
| KV 写入 | 1000/天 | 100-500/天 | ✅ |
| R2 存储 | 10GB | 1-2GB | ✅ |
| R2 Class A | 100 万/月 | 1 万/月 | ✅ |
| R2 Class B | 1000 万/月 | 50 万/月 | ✅ |

### 9.2 付费需求

**Workers Paid Plan — $5/月**

必需原因：
- Cron Triggers（数据抓取）仅在付费计划可用
- Workers CPU 时间从 10ms 提升到 30s

### 9.3 总成本

| 项目 | 月费 |
|------|------|
| Cloudflare Workers Paid | $5 |
| GitHub API Token | 免费 |
| 域名（可选） | ~$10/年 |
| **总计** | **~$5/月** |

---

## 10. 验收标准

### 10.1 功能验收

| 功能点 | 验收标准 | 优先级 |
|--------|---------|--------|
| 首页展示 | Hero 区域 + Top 5 榜单 + AI 专题 | P0 |
| 榜单页 | 完整排名列表，支持筛选排序无限滚动 | P0 |
| 项目详情 | 完整信息展示 + AI 评分 + 趋势图 | P0 |
| 专题系统 | 8 个预设专题，自动筛选展示 | P0 |
| 搜索功能 | 即时搜索 + 结果页 + 筛选 | P0 |
| 响应式 | 5 个断点正常显示 | P0 |
| 深色模式 | 默认深色，支持亮色切换 | P1 |
| 数据抓取 | Cron 自动抓取 GitHub Trending | P0 |
| AI 评分 | 多维度评分 + 明星项目标记 | P0 |

### 10.2 性能验收

| 指标 | 验收标准 |
|------|---------|
| FCP | < 1.0s |
| LCP | < 2.0s |
| CLS | < 0.1 |
| 搜索 API | < 200ms |

### 10.3 部署验收

| 检查项 | 验收标准 |
|--------|---------|
| Cloudflare Pages | 部署成功，可访问 |
| D1 数据库 | 表创建成功，数据可读写 |
| Cron Worker | 定时任务正常执行 |
| API 端点 | 所有 API 返回正确数据 |
| HTTPS | 自动启用 SSL |

---

## 附录

详细 API 规格、数据字典、部署指南请参考 [appendix.md](./appendix.md)

---

*文档结束*
