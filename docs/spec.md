# GitHub Trending AI - 项目规格文档

> 面向 AI 应用开发者的 GitHub 热门开源项目展示网站
>
> 版本：2.0.0 | 最后更新：2026-06-28

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
| 部署平台 | Cloudflare Pages | 纯静态托管，免费无限请求 |
| 数据抓取 | GitHub Actions | 定时构建时抓取数据 |
| 前端框架 | Astro 5 | SSG 静态生成 |
| CSS 框架 | Tailwind CSS v4 | 原子化 CSS |
| 组件库 | shadcn/ui | 可定制组件 |
| 搜索引擎 | Pagefind | 静态搜索，浏览器端本地索引 |
| CI/CD | GitHub Actions | 每天定时构建 + 自动部署 |
| 月成本 | **$0** | 完全免费 |

### 1.4 数据更新策略

**更新频率：** 每天 1-2 次（GitHub Trending 按天更新）

**历史数据策略：累积 + 过期清理**

| 策略 | 说明 |
|------|------|
| 累积 | 每次构建时，将新抓取的项目合并到历史库 |
| 标记 | 记录 `last_trending_date` 字段，标记是否当前在 trending |
| 展示 | 榜单页仅展示当前在 trending 的项目 |
| 过期 | 清理 90 天未出现在 trending 的项目 |
| 保留 | AI 评分高的明星项目可标记为"永久保留" |

**数据流：**
```
GitHub Actions (每天 1-2 次)
    │
    ├─ 抓取当前 GitHub Trending 项目
    │
    ├─ 合并到历史项目库
    │   ├─ 新项目 → 插入
    │   └─ 已存在 → 更新统计 + last_trending_date
    │
    ├─ 清理过期项目 (90 天未 trending 且非明星项目)
    │
    ├─ 计算排名和 AI 评分
    │
    └─ 生成静态页面 + 搜索索引 → 部署到 Cloudflare Pages
```

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
| 搜索结果页 | `/search` | SSG | Pagefind 静态搜索 |
| 全部项目页 | `/projects` | SSG | 所有历史项目（含非 trending） |

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

**搜索方案：Pagefind（静态搜索）**

Pagefind 是一个静态搜索库，在构建时生成索引，浏览器端本地搜索，无需网络请求。

| 特性 | 说明 |
|------|------|
| 原理 | 构建时生成索引文件，浏览器端加载后本地搜索 |
| 速度 | < 50ms，无网络延迟 |
| 索引大小 | ~200-800KB（分片按需加载） |
| 中文支持 | ✅ 支持 |
| 集成方式 | `npx pagefind --site dist` |

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

**结果统计：** "找到 X 个匹配项目"

**结果展示：** 与榜单卡片样式一致

**Pagefind 配置：**
```javascript
// 构建后运行
npx pagefind --site dist

// 前端使用
import * as pagefind from '/_pagefind/pagefind.js';

const search = await pagefind.search('llm agent');
const results = search.results.slice(0, 20);
```

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

**数据来源：** 构建时统计项目 topics 频率，生成静态热门标签

**展示位置：**
- Hero 区域的热门标签（硬编码 + 动态结合）
- 搜索框下拉区域（当无输入且无历史时）

---

## 3. 技术规格

### 3.1 架构概述

**纯静态架构：** 所有数据在 GitHub Actions 构建时生成静态页面，Cloudflare Pages 仅负责托管。

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions (每天 1-2 次)                  │
│                                                                  │
│  1. 抓取 GitHub Trending 数据                                    │
│  2. 合并到历史项目库 (JSON)                                       │
│  3. 清理过期项目 (90天)                                           │
│  4. 计算排名和 AI 评分                                           │
│  5. astro build 生成静态页面                                     │
│  6. pagefind 生成搜索索引                                        │
│  7. 部署到 Cloudflare Pages                                      │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (免费)                        │
│                                                                  │
│  纯静态文件托管：                                                 │
│  - HTML 页面（预渲染）                                           │
│  - CSS / JS                                                      │
│  - Pagefind 搜索索引                                             │
│  - 项目图片                                                      │
│                                                                  │
│  CDN 全球分发，免费无限请求                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 项目结构

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
│   │   │   └── FilterBar.astro
│   │   ├── project/           # 项目详情组件
│   │   │   ├── ProjectHeader.astro
│   │   │   ├── AIScoreCard.astro
│   │   │   └── RelatedProjects.astro
│   │   ├── search/            # 搜索组件
│   │   │   └── SearchBox.ts   # Pagefind 搜索
│   │   ├── collection/        # 专题组件
│   │   │   ├── CollectionCard.astro
│   │   │   └── CollectionHeader.astro
│   │   └── ui/                # 通用 UI 组件
│   │       ├── Badge.astro
│   │       └── BackToTop.ts
│   ├── layouts/               # 页面布局
│   │   └── BaseLayout.astro
│   ├── pages/                 # 页面路由
│   │   ├── index.astro        # 首页
│   │   ├── trending.astro     # 榜单页
│   │   ├── projects.astro     # 全部项目页
│   │   ├── repo/
│   │   │   └── [owner]/
│   │   │       └── [name].astro  # 项目详情页
│   │   ├── collections.astro  # 专题列表页
│   │   ├── collection/
│   │   │   └── [slug].astro   # 专题详情页
│   │   └── search.astro       # 搜索结果页
│   ├── lib/                   # 工具函数
│   │   ├── format.ts          # 数字/日期格式化
│   │   └── data.ts            # 数据加载
│   ├── data/                  # 构建时生成的数据
│   │   ├── projects.json      # 项目数据
│   │   ├── trending.json      # 当前 trending 列表
│   │   └── spotlights.json    # 专题数据
│   ├── styles/                # 全局样式
│   │   └── global.css
│   └── types/                 # TypeScript 类型
│       └── index.ts
├── scripts/                   # 构建脚本
│   ├── crawl.mjs              # 数据抓取脚本
│   ├── calculate-scores.mjs   # 评分计算
│   └── generate-spotlights.mjs # 专题生成
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions 配置
├── astro.config.mjs           # Astro 配置
├── tailwind.config.mjs        # Tailwind 配置
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 前端架构

#### 3.2.1 Astro 配置

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static', // 纯静态生成
  integrations: [tailwind()],
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
- `SearchBox.ts` — Pagefind 搜索
- `BackToTop.ts` — 回到顶部按钮

**不需要 Islands 的组件（纯 Astro）：**
- 所有布局组件
- 卡片组件
- 筛选组件（使用 URL 参数）
- 页头/页脚

#### 3.2.3 状态管理

**方案：URL 参数 + 本地存储，无全局状态库**

- 筛选状态：URL 查询参数（`?language=python&period=daily`）
- 搜索历史：localStorage
- 主题偏好：localStorage + CSS 变量

### 3.3 数据架构

**无后端 API，所有数据在构建时生成静态文件：**

#### 3.3.1 数据文件

| 文件 | 说明 | 生成方式 |
|------|------|---------|
| `src/data/projects.json` | 所有项目数据 | crawl.mjs 生成 |
| `src/data/trending.json` | 当前 trending 列表 | crawl.mjs 生成 |
| `src/data/spotlights.json` | 专题数据 | generate-spotlights.mjs 生成 |

#### 3.3.2 数据加载

```typescript
// src/lib/data.ts
import projectsData from '../data/projects.json';
import trendingData from '../data/trending.json';
import spotlightsData from '../data/spotlights.json';

export function getProjects() {
  return projectsData;
}

export function getTrendingProjects() {
  return trendingData;
}

export function getSpotlights() {
  return spotlightsData;
}

export function getProjectByFullName(owner: string, name: string) {
  return projectsData.find(p => p.owner_login === owner && p.name === name);
}
```

#### 3.3.3 搜索方案：Pagefind

```bash
# 构建后生成搜索索引
npx pagefind --site dist
```

```typescript
// src/components/search/SearchBox.ts
import * as pagefind from '/_pagefind/pagefind.js';

async function search(query: string) {
  const results = await pagefind.search(query);
  return results.results.slice(0, 20);
}
```
    ...responseToCache,
    headers: { ...responseToCache.headers, ...corsHeaders, 'X-Cache': 'MISS' },
  });
};
```

### 3.4 数据结构设计

**存储方式：** JSON 文件（构建时生成，无需数据库）

#### 3.4.1 项目数据结构

```typescript
// src/data/projects.json
interface Project {
  // 基本信息
  id: number;                          // GitHub 仓库 ID
  full_name: string;                   // owner/repo
  name: string;                        // repo 名称
  owner_login: string;                 // 所有者用户名
  owner_avatar_url: string;            // 头像 URL
  owner_type: 'User' | 'Organization'; // 所有者类型
  description: string;                 // 英文描述
  description_zh?: string;             // 中文描述（AI 翻译）
  html_url: string;                    // GitHub 链接
  homepage?: string;                   // 项目官网

  // 技术信息
  language?: string;                   // 主要编程语言
  languages_breakdown?: Record<string, number>; // 语言占比
  topics?: string[];                   // 标签列表
  license_spdx?: string;               // 许可证
  default_branch: string;              // 默认分支

  // 统计数据
  stargazers_count: number;            // Star 数
  forks_count: number;                 // Fork 数
  open_issues_count: number;           // 开放 Issue 数
  watchers_count: number;              // Watcher 数
  contributors_count?: number;         // 贡献者数量
  size_kb: number;                     // 仓库大小

  // 状态标志
  archived: boolean;                   // 是否归档
  is_fork: boolean;                    // 是否 Fork
  has_wiki: boolean;
  has_discussions: boolean;

  // AI 分析
  readme_summary?: string;             // README 摘要
  ai_quality_score: number;            // AI 质量评分 0-100
  ai_tags?: string[];                  // AI 标签

  // Trending 数据
  trending_score: number;              // Trending 分数 0-100
  comprehensive_rank: number;          // 综合排名
  star_velocity_7d: number;            // 近 7 天 Star 日均增速
  star_velocity_30d: number;           // 近 30 天 Star 日均增速

  // 历史追踪
  first_seen_at: string;               // 首次出现在 trending 的时间
  last_trending_date: string;          // 最后一次出现在 trending 的日期
  trending_history: TrendingRecord[];  // 历史 trending 记录

  // 时间戳
  created_at: string;                  // GitHub 创建时间
  updated_at: string;                  // GitHub 更新时间
  pushed_at: string;                   // 最后推送时间
  crawled_at: string;                  // 最后抓取时间
}

interface TrendingRecord {
  date: string;                        // 日期 YYYY-MM-DD
  rank: number;                        // 排名
  category: string;                    // 分类：overall, python, typescript...
  period: string;                      // 周期：daily, weekly, monthly
  stars_gained: number;                // 当日新增 Star
}
```

#### 3.4.2 Trending 列表数据结构

```typescript
// src/data/trending.json
interface TrendingData {
  last_updated: string;                // 最后更新时间
  period: string;                      // daily, weekly, monthly
  projects: TrendingEntry[];           // 当前 trending 项目列表
}

interface TrendingEntry {
  project_id: number;                  // 关联项目 ID
  rank: number;                        // 排名
  stars_gained: number;                // 新增 Star 数
  category: string;                    // 分类
}
```

#### 3.4.3 专题数据结构

```typescript
// src/data/spotlights.json
interface Spotlight {
  slug: string;                        // URL slug
  title: string;                       // 英文标题
  title_zh: string;                    // 中文标题
  description: string;                 // 英文描述
  description_zh: string;              // 中文描述
  icon: string;                        // emoji 或图标名
  category: string;                    // 分类
  project_ids: number[];               // 包含的项目 ID 列表
  project_count: number;               // 项目数量
  updated_at: string;                  // 最后更新时间
}
```

#### 3.4.4 历史数据保留策略

| 数据类型 | 保留策略 | 说明 |
|----------|---------|------|
| 当前 trending 项目 | 永久保留 | 只要在 trending 中出现过 |
| 非 trending 项目 | 90 天过期 | 清理 90 天未出现在 trending 的项目 |
| 明星项目 (AI >= 75) | 永久保留 | 高质量项目标记为永久保留 |
| Trending 历史记录 | 保留最近 10 条 | 每个项目最多保留 10 条历史记录 |

**清理逻辑：**
```javascript
// scripts/cleanup.mjs
function cleanupProjects(projects) {
  const now = new Date();
  const EXPIRY_DAYS = 90;

  return projects.filter(project => {
    // 明星项目永久保留
    if (project.ai_quality_score >= 75 && project.stargazers_count >= 500) {
      return true;
    }

    // 当前在 trending 中的项目保留
    const lastTrending = new Date(project.last_trending_date);
    const daysSinceTrending = (now - lastTrending) / (1000 * 60 * 60 * 24);
    if (daysSinceTrending <= 1) {
      return true;
    }

    // 过期项目删除
    return daysSinceTrending <= EXPIRY_DAYS;
  });
}
```

### 3.5 数据抓取脚本

**执行环境：** GitHub Actions（每天 1-2 次）

#### 3.5.1 GitHub Actions Workflow

```yaml
# .github/workflows/build.yml
name: Build & Deploy

on:
  schedule:
    - cron: '0 0,12 * * *'  # 每天 0:00 和 12:00 UTC
  workflow_dispatch:  # 支持手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Crawl GitHub Trending
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: node scripts/crawl.mjs

      - name: Calculate scores
        run: node scripts/calculate-scores.mjs

      - name: Generate spotlights
        run: node scripts/generate-spotlights.mjs

      - name: Cleanup expired projects
        run: node scripts/cleanup.mjs

      - name: Build Astro
        run: npm run build

      - name: Build search index
        run: npx pagefind --site dist

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name github-trending-ai
```

#### 3.5.2 抓取脚本

```javascript
// scripts/crawl.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DATA_FILE = 'src/data/projects.json';
const TRENDING_FILE = 'src/data/trending.json';

// 加载现有数据
function loadExistingProjects() {
  if (existsSync(DATA_FILE)) {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  }
  return [];
}

// 抓取 GitHub Trending
async function crawlTrending() {
  const languages = ['', 'python', 'typescript', 'javascript', 'rust', 'go'];
  const projects = [];

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

  return deduplicateByFullName(projects);
}

// 补充 GitHub API 详情
async function enrichProject(owner, name) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  return response.json();
}

// 合并数据
function mergeProjects(existing, trending) {
  const today = new Date().toISOString().split('T')[0];
  const merged = new Map(existing.map(p => [p.id, p]));

  for (const item of trending) {
    const existingProject = merged.get(item.id);

    if (existingProject) {
      // 更新现有项目
      existingProject.last_trending_date = today;
      existingProject.trending_history = [
        { date: today, rank: item.rank, stars_gained: item.starsToday },
        ...(existingProject.trending_history || []).slice(0, 9),
      ];
      // 更新统计数据
      Object.assign(existingProject, item.details);
    } else {
      // 新项目
      merged.set(item.id, {
        ...item.details,
        first_seen_at: today,
        last_trending_date: today,
        trending_history: [
          { date: today, rank: item.rank, stars_gained: item.starsToday },
        ],
      });
    }
  }

  return Array.from(merged.values());
}

// 主流程
async function main() {
  console.log('[Crawler] Starting...');

  // 1. 加载现有数据
  const existing = loadExistingProjects();
  console.log(`[Crawler] Loaded ${existing.length} existing projects`);

  // 2. 抓取 Trending
  const trending = await crawlTrending();
  console.log(`[Crawler] Found ${trending.length} trending projects`);

  // 3. 补充详情
  const enriched = [];
  for (const item of trending) {
    try {
      const details = await enrichProject(item.owner, item.name);
      enriched.push({ ...item, details });
      await sleep(1000); // 速率限制
    } catch (err) {
      console.error(`[Crawler] Failed: ${item.fullName}`, err.message);
    }
  }

  // 4. 合并数据
  const merged = mergeProjects(existing, enriched);
  console.log(`[Crawler] Total projects: ${merged.length}`);

  // 5. 保存
  writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));

  // 6. 保存 trending 列表
  writeFileSync(TRENDING_FILE, JSON.stringify({
    last_updated: new Date().toISOString(),
    period: 'daily',
    projects: enriched.map(p => ({
      project_id: p.id,
      rank: p.rank,
      stars_gained: p.starsToday,
      category: 'overall',
    })),
  }, null, 2));

  console.log('[Crawler] Done!');
}

main().catch(console.error);
```

#### 3.5.3 GitHub API 速率限制处理

```javascript
// scripts/lib/github-api.mjs
async function fetchWithRateLimit(url, token) {
  const headers = {
    'Authorization': `token ${token}`,
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
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limit low (${remaining}), waiting ${waitTime}ms`);
      await sleep(waitTime);
    }

    if (response.status === 403 || response.status === 429) {
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
```

#### 3.5.4 构建频率说明

| 构建时间 | 频率 | 说明 |
|---------|------|------|
| 00:00 UTC | 每天 | 跟踪 daily trending 更新 |
| 12:00 UTC | 每天 | 可选，捕获更实时的变化 |

**说明：** GitHub Trending 的 daily 列表每天更新一次，因此每天构建 1-2 次即可。如果需要更频繁的更新，可以手动触发 workflow。

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

### 7.1 Cloudflare Pages 配置

**纯静态托管，无需 D1/KV/R2/Functions**

#### 7.1.1 创建 Pages 项目

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 Pages 项目
wrangler pages project create github-trending-ai --production-branch main
```

#### 7.1.2 配置自定义域名（可选）

在 Cloudflare Dashboard > Pages > github-trending-ai > Custom domains 中添加域名。

### 7.2 GitHub Secrets 配置

在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加：

| Secret 名称 | 说明 | 获取方式 |
|-------------|------|---------|
| `GITHUB_TOKEN` | GitHub PAT | Settings > Developer settings > Personal access tokens |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Dashboard > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | Dashboard > 右侧边栏 |
| `OPENAI_API_KEY` | OpenAI API Key（可选） | platform.openai.com |

**GitHub Token 权限：**
- `repo` — 访问仓库（用于 API 调用）

**Cloudflare API Token 权限：**
- Account > Cloudflare Pages > Edit

### 7.3 构建和部署脚本

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:full": "node scripts/crawl.mjs && node scripts/calculate-scores.mjs && node scripts/generate-spotlights.mjs && npm run build && npx pagefind --site dist",
    "preview": "astro preview",
    "crawl": "node scripts/crawl.mjs",
    "deploy": "npm run build:full && wrangler pages deploy dist"
  }
}
```

### 7.4 GitHub Actions Workflow

```yaml
# .github/workflows/build.yml
name: Build & Deploy

on:
  schedule:
    - cron: '0 0,12 * * *'  # 每天 0:00 和 12:00 UTC
  workflow_dispatch:  # 支持手动触发

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Crawl GitHub Trending
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: node scripts/crawl.mjs

      - name: Calculate scores
        run: node scripts/calculate-scores.mjs

      - name: Generate spotlights
        run: node scripts/generate-spotlights.mjs

      - name: Cleanup expired projects
        run: node scripts/cleanup.mjs

      - name: Build Astro
        run: npm run build

      - name: Build search index
        run: npx pagefind --site dist

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
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
| TTFB | < 100ms | 纯静态，CDN 直接响应 |
| 搜索响应 | < 50ms | Pagefind 本地搜索，无网络延迟 |
| 页面大小 | < 100KB | 首页 HTML + CSS（不含图片） |

### 8.2 缓存策略

| 资源 | 缓存层 | TTL | 说明 |
|------|--------|-----|------|
| 页面 HTML | Cloudflare CDN | 自动 | 静态文件自动缓存 |
| CSS/JS | CDN | 1 年 | 带 hash 的文件名 |
| Pagefind 索引 | CDN | 自动 | 分片加载 |
| 图片 | CDN | 自动 | 项目头像等 |
| 字体 | CDN | 1 年 | woff2 格式 |

### 8.3 优化方案

1. **纯静态预渲染** — 所有页面构建时生成，CDN 直接分发
2. **零 JS 默认** — 列表页纯 HTML+CSS，减少 JS 传输
3. **Pagefind 按需加载** — 搜索索引分片，首次加载 < 200KB
4. **图片优化** — WebP 格式 + 懒加载 + blur placeholder
5. **字体优化** — `font-display: swap` + 系统字体回退
6. **预加载** — `<link rel="preload">` 关键资源
7. **压缩** — Brotli 压缩 HTML/CSS/JS
8. **HTTP/2** — Cloudflare 默认支持

---

## 9. 成本估算

### 9.1 Cloudflare 免费计划

| 资源 | 免费额度 | 本项目预估用量 | 是否充足 |
|------|---------|---------------|---------|
| Pages 请求 | 无限 | 主要流量 | ✅ |
| Pages 构建 | 500 次/月 | ~60 次/月（每天 2 次） | ✅ |
| 带宽 | 无限 | - | ✅ |

### 9.2 GitHub Actions 免费计划

| 资源 | 免费额度 | 本项目预估用量 | 是否充足 |
|------|---------|---------------|---------|
| 构建时间 | 无限（公开仓库） | ~60 分钟/月 | ✅ |
| 存储 | 500MB | ~50MB | ✅ |

### 9.3 总成本

| 项目 | 月费 |
|------|------|
| Cloudflare Pages | $0 |
| GitHub Actions | $0 |
| GitHub API Token | 免费 |
| OpenAI API（可选） | ~$1-3/月 |
| 域名（可选） | ~$10/年 |
| **总计** | **$0-3/月** |

**完全免费！** （OpenAI API 为可选，用于生成中文描述）

---

## 10. 验收标准

### 10.1 功能验收

| 功能点 | 验收标准 | 优先级 |
|--------|---------|--------|
| 首页展示 | Hero 区域 + Top 5 榜单 + AI 专题 | P0 |
| 榜单页 | 完整排名列表，支持筛选 | P0 |
| 项目详情 | 完整信息展示 + AI 评分 | P0 |
| 专题系统 | 8 个预设专题，自动筛选展示 | P0 |
| 搜索功能 | Pagefind 即时搜索 + 结果页 | P0 |
| 响应式 | 5 个断点正常显示 | P0 |
| 深色模式 | 默认深色，支持亮色切换 | P1 |
| 数据抓取 | GitHub Actions 自动抓取 | P0 |
| AI 评分 | 多维度评分 + 明星项目标记 | P0 |
| 历史数据 | 累积 + 90 天过期清理 | P0 |

### 10.2 性能验收

| 指标 | 验收标准 |
|------|---------|
| FCP | < 1.0s |
| LCP | < 2.0s |
| CLS | < 0.1 |
| TTFB | < 100ms |
| 搜索响应 | < 50ms |

### 10.3 部署验收

| 检查项 | 验收标准 |
|--------|---------|
| Cloudflare Pages | 部署成功，可访问 |
| GitHub Actions | 定时任务正常执行 |
| 数据抓取 | Trending 数据正确抓取 |
| 静态页面 | 所有页面正常渲染 |
| 搜索功能 | Pagefind 搜索正常工作 |
| HTTPS | 自动启用 SSL |

---

## 附录

详细 API 规格、数据字典、部署指南请参考 [appendix.md](./appendix.md)

---

*文档版本：2.0.0 | 最后更新：2026-06-28*
