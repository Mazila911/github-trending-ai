# GitHub Trending AI - 附录文档

> 版本：2.0.0 | 最后更新：2026-06-28

---

## 目录

1. [附录 A：数据结构规格](#附录-a数据结构规格)
2. [附录 B：GitHub Actions Workflow](#附录-bgithub-actions-workflow)
3. [附录 C：抓取脚本规格](#附录-c抓取脚本规格)
4. [附录 D：Pagefind 搜索配置](#附录-dpagefind-搜索配置)
5. [附录 E：部署指南](#附录-e部署指南)
6. [附录 F：常见问题](#附录-f常见问题)
7. [附录 G：版本历史](#附录-g版本历史)

---

## 附录 A：数据结构规格

### A.1 项目数据结构

**文件位置：** `src/data/projects.json`

```typescript
interface Project {
  // 基本信息
  id: number;                          // GitHub 仓库 ID（主键）
  full_name: string;                   // 完整名称 owner/repo
  name: string;                        // 仓库名称
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
  license_spdx?: string;               // 许可证 SPDX ID
  default_branch: string;              // 默认分支

  // 统计数据
  stargazers_count: number;            // Star 数
  forks_count: number;                 // Fork 数
  open_issues_count: number;           // 开放 Issue 数
  watchers_count: number;              // Watcher 数
  contributors_count?: number;         // 贡献者数量
  size_kb: number;                     // 仓库大小 (KB)

  // 状态标志
  archived: boolean;                   // 是否归档
  is_fork: boolean;                    // 是否 Fork
  has_wiki: boolean;                   // 是否启用 Wiki
  has_discussions: boolean;            // 是否启用 Discussions

  // AI 分析
  readme_summary?: string;             // README 摘要（AI 生成）
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

### A.2 Trending 列表数据结构

**文件位置：** `src/data/trending.json`

```typescript
interface TrendingData {
  last_updated: string;                // 最后更新时间 ISO 8601
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

### A.3 专题数据结构

**文件位置：** `src/data/spotlights.json`

```typescript
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

### A.4 预设专题定义

| slug | 英文名 | 中文名 | 筛选关键词 |
|------|--------|--------|-----------|
| `llm-frameworks` | LLM Frameworks | LLM 框架与工具 | llm, langchain, llamaindex, vllm |
| `rag-tools` | RAG & Knowledge Base | RAG 与知识库 | rag, vector-database, embeddings |
| `ai-agents` | AI Agents | AI Agent | ai-agent, agent, autonomous |
| `code-gen` | Code Generation | 代码生成与辅助 | code-generation, copilot |
| `multimodal` | Multimodal AI | 多模态 AI | multimodal, image-generation |
| `training` | Model Training | 模型训练与微调 | fine-tuning, training, lora |
| `infra` | AI Infrastructure | AI 基础设施 | inference, serving, mlops |
| `data-tools` | Data Processing | 数据处理与分析 | etl, data-pipeline |

### A.5 字段枚举值

#### 编程语言列表

```json
[
  "Python", "TypeScript", "JavaScript", "Rust", "Go",
  "Java", "C++", "C", "Jupyter Notebook", "Scala",
  "Kotlin", "Swift", "Ruby", "PHP", "C#"
]
```

#### 许可证列表

```json
[
  "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
  "GPL-2.0", "GPL-3.0", "LGPL-2.1", "LGPL-3.0",
  "MPL-2.0", "AGPL-3.0", "Unlicense", "CC0-1.0"
]
```

---

## 附录 B：GitHub Actions Workflow

### B.1 主构建 Workflow

```yaml
# .github/workflows/build.yml
name: Build & Deploy

on:
  schedule:
    - cron: '0 0,12 * * *'  # 每天 0:00 和 12:00 UTC
  workflow_dispatch:
    inputs:
      force_full_crawl:
        description: '强制全量抓取'
        required: false
        default: 'false'

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
          cache: 'npm'

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
          command: pages deploy dist --project-name github-trending-ai --branch main
```

### B.2 GitHub Secrets 配置

| Secret 名称 | 说明 | 获取方式 |
|-------------|------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Settings > Developer settings > Personal access tokens |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Dashboard > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | Dashboard > 右侧边栏 |
| `OPENAI_API_KEY` | OpenAI API Key（可选） | platform.openai.com |

#### GitHub Token 权限

- `repo` — 访问仓库（用于 API 调用）

#### Cloudflare API Token 权限

- Account > Cloudflare Pages > Edit

---

## 附录 C：抓取脚本规格

### C.1 主抓取脚本

```javascript
// scripts/crawl.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { parse } from 'node-html-parser';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATA_FILE = 'src/data/projects.json';
const TRENDING_FILE = 'src/data/trending.json';

// ========== 工具函数 ==========

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function deduplicateByFullName(projects) {
  const seen = new Set();
  return projects.filter(p => {
    if (seen.has(p.fullName)) return false;
    seen.add(p.fullName);
    return true;
  });
}

// ========== 数据加载 ==========

function loadExistingProjects() {
  if (existsSync(DATA_FILE)) {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  }
  return [];
}

// ========== GitHub Trending 抓取 ==========

function parseTrendingHTML(html) {
  const root = parse(html);
  const articles = root.querySelectorAll('article.Box-row');
  const projects = [];

  for (const article of articles) {
    try {
      const nameLink = article.querySelector('h2 a');
      const fullName = nameLink.getAttribute('href').slice(1).trim();
      const [owner, name] = fullName.split('/');

      const descEl = article.querySelector('p');
      const description = descEl ? descEl.text.trim() : '';

      const langEl = article.querySelector('[itemprop="programmingLanguage"]');
      const language = langEl ? langEl.text.trim() : null;

      const starsEl = article.querySelector('a[href$="/stargazers"]');
      const forksEl = article.querySelector('a[href$="/forks"]');
      const todayEl = article.querySelector('.float-sm-right');

      projects.push({
        fullName,
        owner,
        name,
        description,
        language,
        totalStars: parseNumber(starsEl?.text),
        forks: parseNumber(forksEl?.text),
        starsToday: parseNumber(todayEl?.text),
      });
    } catch (err) {
      console.error('Parse error:', err.message);
    }
  }

  return projects;
}

function parseNumber(text) {
  if (!text) return 0;
  return parseInt(text.replace(/,/g, '').trim()) || 0;
}

async function crawlTrending() {
  const languages = ['', 'python', 'typescript', 'javascript', 'rust', 'go'];
  const projects = [];

  for (const lang of languages) {
    const url = lang
      ? `https://github.com/trending/${lang}?spoken_language_code=en`
      : 'https://github.com/trending?spoken_language_code=en';

    console.log(`[Crawler] Fetching ${url}`);
    const html = await fetch(url).then(r => r.text());
    const parsed = parseTrendingHTML(html);
    projects.push(...parsed);

    await sleep(2000);
  }

  return deduplicateByFullName(projects);
}

// ========== GitHub API ==========

async function enrichProject(owner, name) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Trending-AI',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

// ========== AI 描述生成 ==========

async function generateAIDescription(project) {
  if (!OPENAI_API_KEY) return null;

  const prompt = `请为以下 GitHub 项目生成：
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
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) return null;

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// ========== 数据合并 ==========

function mergeProjects(existing, trending) {
  const today = new Date().toISOString().split('T')[0];
  const merged = new Map(existing.map(p => [p.id, p]));

  for (const item of trending) {
    const existingProject = merged.get(item.details?.id);

    if (existingProject) {
      existingProject.last_trending_date = today;
      existingProject.trending_history = [
        { date: today, rank: item.rank, stars_gained: item.starsToday, category: 'overall', period: 'daily' },
        ...(existingProject.trending_history || []).slice(0, 9),
      ];
      Object.assign(existingProject, item.details);
      existingProject.crawled_at = new Date().toISOString();
    } else if (item.details) {
      merged.set(item.details.id, {
        ...item.details,
        first_seen_at: today,
        last_trending_date: today,
        trending_history: [
          { date: today, rank: item.rank, stars_gained: item.starsToday, category: 'overall', period: 'daily' },
        ],
        crawled_at: new Date().toISOString(),
      });
    }
  }

  return Array.from(merged.values());
}

// ========== 主流程 ==========

async function main() {
  console.log('[Crawler] Starting...');

  const existing = loadExistingProjects();
  console.log(`[Crawler] Loaded ${existing.length} existing projects`);

  const trending = await crawlTrending();
  console.log(`[Crawler] Found ${trending.length} trending projects`);

  const enriched = [];
  for (const item of trending) {
    try {
      const details = await enrichProject(item.owner, item.name);

      // 生成 AI 描述（仅新项目或描述变化的项目）
      const existingProject = existing.find(p => p.id === details.id);
      if (!existingProject || existingProject.description !== details.description) {
        const aiContent = await generateAIDescription(details);
        if (aiContent) {
          details.description_zh = aiContent.description_zh;
          details.readme_summary = aiContent.readme_summary;
        }
        await sleep(500); // OpenAI API 速率限制
      }

      enriched.push({ ...item, details });
      await sleep(1000); // GitHub API 速率限制
    } catch (err) {
      console.error(`[Crawler] Failed: ${item.fullName}`, err.message);
    }
  }

  const merged = mergeProjects(existing, enriched);
  console.log(`[Crawler] Total projects: ${merged.length}`);

  writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));

  writeFileSync(TRENDING_FILE, JSON.stringify({
    last_updated: new Date().toISOString(),
    period: 'daily',
    projects: enriched.map(p => ({
      project_id: p.details?.id,
      rank: p.rank,
      stars_gained: p.starsToday,
      category: 'overall',
    })),
  }, null, 2));

  console.log('[Crawler] Done!');
}

main().catch(console.error);
```

### C.2 评分计算脚本

```javascript
// scripts/calculate-scores.mjs
import { readFileSync, writeFileSync } from 'fs';

const DATA_FILE = 'src/data/projects.json';

function normalize(value, min = 0, max = 100) {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

function logNormalize(value, maxValue = 200000) {
  return Math.log10(value + 1) / Math.log10(maxValue + 1) * 100;
}

function freshnessDecay(days) {
  if (days <= 1) return 1.0;
  if (days <= 7) return 0.95;
  if (days <= 30) return 0.85;
  if (days <= 90) return 0.6;
  if (days <= 365) return 0.3;
  return 0.1;
}

function calculateStarScore(project) {
  return logNormalize(project.stargazers_count);
}

function calculateTrendingScore(project) {
  const history = project.trending_history || [];
  const starsGained7d = history.slice(0, 7).reduce((sum, h) => sum + (h.stars_gained || 0), 0);
  const starsGained30d = history.slice(0, 30).reduce((sum, h) => sum + (h.stars_gained || 0), 0);
  const avgDaily30d = starsGained30d / 30;
  const todayStars = history[0]?.stars_gained || 0;
  const acceleration = todayStars / (avgDaily30d + 1);

  const score = (
    0.5 * normalize(starsGained7d) +
    0.3 * normalize(starsGained30d) +
    0.2 * normalize(acceleration)
  );

  const daysSincePush = (Date.now() - new Date(project.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  return score * freshnessDecay(daysSincePush);
}

function calculateActivityScore(project) {
  const daysSincePush = (Date.now() - new Date(project.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  const freshness = freshnessDecay(daysSincePush);
  return normalize(freshness * 100);
}

function calculateImpactScore(project) {
  const forkRatio = project.stargazers_count > 0 ? project.forks_count / project.stargazers_count : 0;
  return (
    0.4 * logNormalize(project.forks_count) +
    0.3 * logNormalize(project.watchers_count) +
    0.3 * normalize(forkRatio * 100)
  );
}

function calculateComprehensiveScore(project) {
  const starScore = calculateStarScore(project);
  const trendingScore = calculateTrendingScore(project);
  const aiScore = project.ai_quality_score || 0;
  const activityScore = calculateActivityScore(project);
  const impactScore = calculateImpactScore(project);

  return (
    0.15 * starScore +
    0.25 * trendingScore +
    0.30 * aiScore +
    0.15 * activityScore +
    0.15 * impactScore
  );
}

function main() {
  console.log('[Score] Calculating scores...');

  const projects = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));

  for (const project of projects) {
    project.trending_score = calculateTrendingScore(project);
    project.comprehensive_rank = 0; // 将在排序后更新
  }

  // 按综合分数排序
  projects.sort((a, b) => calculateComprehensiveScore(b) - calculateComprehensiveScore(a));

  // 更新排名
  projects.forEach((project, index) => {
    project.comprehensive_rank = index + 1;
  });

  writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
  console.log(`[Score] Updated ${projects.length} projects`);
}

main();
```

### C.3 过期清理脚本

```javascript
// scripts/cleanup.mjs
import { readFileSync, writeFileSync } from 'fs';

const DATA_FILE = 'src/data/projects.json';
const EXPIRY_DAYS = 90;

function main() {
  console.log('[Cleanup] Starting...');

  const projects = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const now = new Date();

  const filtered = projects.filter(project => {
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

  const removed = projects.length - filtered.length;
  writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  console.log(`[Cleanup] Removed ${removed} expired projects, ${filtered.length} remaining`);
}

main();
```

### C.4 GitHub API 速率限制处理

```javascript
// scripts/lib/github-api.mjs
export async function fetchWithRateLimit(url, token) {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Trending-AI',
  };

  let retries = 3;
  while (retries > 0) {
    const response = await fetch(url, { headers });

    const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '1000');
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0');

    if (remaining < 100) {
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limit low (${remaining}), waiting ${waitTime}ms`);
      await new Promise(r => setTimeout(r, waitTime));
    }

    if (response.status === 403 || response.status === 429) {
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limited, waiting ${waitTime}ms`);
      await new Promise(r => setTimeout(r, waitTime));
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

---

## 附录 D：Pagefind 搜索配置

### D.1 安装和配置

```bash
# 安装
npm install -D pagefind

# 构建后运行
npx pagefind --site dist
```

### D.2 前端集成

```typescript
// src/components/search/SearchBox.ts
import * as pagefind from '/_pagefind/pagefind.js';

// 初始化
await pagefind.init();

// 搜索
async function search(query: string) {
  const results = await pagefind.search(query);
  return results.results.slice(0, 20);
}

// 获取结果内容
async function getResultData(result) {
  const data = await result.data();
  return {
    title: data.meta.title,
    url: data.url,
    excerpt: data.excerpt,
  };
}
```

### D.3 Pagefind 配置文件

```yaml
# pagefind.yml
site: dist
output_subdirectory: _pagefind
glob: **/*.html
exclude_selectors:
  - "nav"
  - "footer"
  - ".search-ui"
```

### D.4 搜索索引大小预估

| 项目数量 | 索引大小 | 首次加载 |
|---------|---------|---------|
| 500 | ~200KB | ~50KB |
| 1000 | ~400KB | ~100KB |
| 2000 | ~800KB | ~200KB |

---

## 附录 E：部署指南

### E.1 前置条件

1. GitHub 账号
2. Cloudflare 账号
3. Node.js 20+

### E.2 步骤一：Fork 或克隆仓库

```bash
git clone https://github.com/yourusername/github-trending-ai.git
cd github-trending-ai
npm install
```

### E.3 步骤二：配置 GitHub Secrets

在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加：

| Secret 名称 | 说明 |
|-------------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID |
| `OPENAI_API_KEY` | OpenAI API Key（可选） |

### E.4 步骤三：创建 Cloudflare Pages 项目

```bash
# 安装 wrangler
npm install -g wrangler

# 登录
wrangler login

# 创建项目
wrangler pages project create github-trending-ai --production-branch main
```

### E.5 步骤四：触发首次构建

```bash
# 本地测试
npm run build:full

# 或在 GitHub Actions 中手动触发
gh workflow run build.yml
```

### E.6 步骤五：配置自定义域名（可选）

在 Cloudflare Dashboard > Pages > github-trending-ai > Custom domains 中添加域名。

---

## 附录 F：常见问题

### F.1 构建失败怎么办？

1. 检查 GitHub Actions 日志
2. 确认 Secrets 配置正确
3. 检查 GitHub Token 权限
4. 检查 API 速率限制

### F.2 数据没有更新？

1. 确认 GitHub Actions 定时任务正常运行
2. 检查 `src/data/trending.json` 的 `last_updated` 时间
3. 手动触发 workflow 测试

### F.3 搜索不工作？

1. 确认 Pagefind 索引已生成（`dist/_pagefind/` 目录）
2. 检查浏览器控制台是否有错误
3. 确认搜索组件正确导入 Pagefind

### F.4 如何添加新的专题？

1. 编辑 `scripts/generate-spotlights.mjs`
2. 添加新的专题定义
3. 重新构建

### F.5 如何修改构建频率？

编辑 `.github/workflows/build.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0,12 * * *'  # 每天 0:00 和 12:00 UTC
```

---

## 附录 G：版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 2.0.0 | 2026-06-28 | 纯静态架构，Pagefind 搜索，GitHub Actions 构建 |
| 1.0.0 | 2026-06-28 | 初始版本（动态架构，已废弃） |

---

*文档版本：2.0.0 | 最后更新：2026-06-28*
