# GitHub Trending AI - Cloudflare 免费计划部署指南

> 本文档说明如何仅使用 Cloudflare 免费计划完成全部功能部署，月成本 $0

---

## 一、为什么原方案需要付费？

原方案使用 Workers Paid Plan ($5/月) 的两个原因：

| 功能 | 付费需求 | 免费计划限制 |
|------|---------|-------------|
| Cron Triggers | 定时触发 Worker | 免费计划不支持 |
| Worker CPU 时间 | 数据抓取需 2-5 秒 | 免费计划仅 10ms |

---

## 二、免费替代方案：GitHub Actions

**核心思路：** 将定时数据抓取从 Cloudflare Worker 迁移到 GitHub Actions

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **GitHub Actions** | 公开仓库免费无限分钟；原生 cron；无 CPU 限制 | 仓库需公开 | ⭐⭐⭐⭐⭐ |
| cron-job.org | 免费 | 仅 HTTP 请求；依赖第三方 | ⭐⭐ |
| Vercel Cron | 免费 1 个 cron | 限制多 | ⭐⭐ |

**推荐：GitHub Actions** — 公开仓库完全免费，可运行完整 Node.js 脚本

---

## 三、新架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户浏览器                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare (免费计划)                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Pages (CDN)  │  │ Pages Functions   │  │      D1 数据库    │  │
│  │  静态前端      │  │  API 端点          │  │  项目数据/排名    │  │
│  │  免费无限请求  │  │  50万请求/月       │  │  1000万读/天     │  │
│  └──────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────┐                         │
│  │   KV 缓存     │  │   R2 对象存储     │                         │
│  │  10万读/天    │  │  10GB 免费        │                         │
│  └──────────────┘  └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ Cloudflare REST API
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    GitHub Actions (免费)                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  定时任务: "0 */6 * * *"  每 6 小时                        │  │
│  │                                                          │  │
│  │  1. 抓取 GitHub Trending HTML                            │  │
│  │  2. 调用 GitHub API 补充项目详情                           │  │
│  │  3. 调用 OpenAI API 生成中文描述（可选）                    │  │
│  │  4. 通过 Cloudflare REST API 写入 D1 数据库               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Secrets:                                                        │
│  - CLOUDFLARE_API_TOKEN                                        │
│  - CLOUDFLARE_ACCOUNT_ID                                       │
│  - CLOUDFLARE_DATABASE_ID                                      │
│  - GITHUB_TOKEN                                                │
│  - OPENAI_API_KEY (可选)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、免费额度分析

| 资源 | 免费额度 | 本项目预估用量 | 状态 |
|------|---------|---------------|------|
| Pages 请求 | 无限 | 主要流量 | ✅ |
| Pages Functions | 50 万/月 | 10-30 万/月 | ✅ |
| D1 读取 | 1000 万/天 | 5-20 万/天 | ✅ |
| D1 写入 | 100 万/天 | 1-5 万/天 | ✅ |
| D1 存储 | 5GB | 50-200MB | ✅ |
| KV 读取 | 10 万/天 | 2-5 万/天 | ✅ |
| KV 写入 | 1000/天 | 100-500/天 | ✅ |
| R2 存储 | 10GB | 1-2GB | ✅ |
| GitHub Actions | 无限（公开仓库） | ~120 分钟/月 | ✅ |

---

## 五、GitHub Actions Workflow

```yaml
# .github/workflows/crawl.yml
name: Crawl GitHub Trending

on:
  schedule:
    - cron: '0 */6 * * *'  # 每 6 小时
  workflow_dispatch:  # 支持手动触发

jobs:
  crawl:
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

      - name: Run crawler
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_DATABASE_ID: ${{ secrets.CLOUDFLARE_DATABASE_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: node scripts/crawl.mjs

      - name: Update cache
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          curl -s -X PUT \
            "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${{ secrets.CLOUDFLARE_KV_NAMESPACE_ID }}/values/last_crawl" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -d "\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""
```

---

## 六、抓取脚本（通过 Cloudflare API 操作 D1）

```javascript
// scripts/crawl.mjs
const CF_API = 'https://api.cloudflare.com/client/v4';
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_DB_ID = process.env.CLOUDFLARE_DATABASE_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// 通过 Cloudflare REST API 查询 D1
async function d1Query(sql, params = []) {
  const response = await fetch(
    `${CF_API}/accounts/${CF_ACCOUNT}/d1/database/${CF_DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  );
  const data = await response.json();
  if (!data.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
  }
  return data.result[0];
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
    await new Promise(r => setTimeout(r, 2000));
  }

  return deduplicateByFullName(projects);
}

// 补充 GitHub API 详情
async function enrichProject(owner, name) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${name}`,
    {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );
  return response.json();
}

// 主流程
async function main() {
  console.log('[Crawler] Starting...');

  const trending = await crawlTrending();
  console.log(`[Crawler] Found ${trending.length} projects`);

  for (const project of trending) {
    try {
      const details = await enrichProject(project.owner, project.name);

      await d1Query(`
        INSERT INTO projects (id, full_name, name, owner_login, description, language,
          stargazers_count, forks_count, trending_stars, snapshot_date, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'), datetime('now'))
        ON CONFLICT(id) DO UPDATE SET
          stargazers_count = excluded.stargazers_count,
          forks_count = excluded.forks_count,
          trending_stars = excluded.trending_stars,
          updated_at = datetime('now')
      `, [
        details.id, details.full_name, details.name,
        details.owner.login, details.description, details.language,
        details.stargazers_count, details.forks_count, project.starsToday,
      ]);

      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[Crawler] Failed: ${project.fullName}`, err.message);
    }
  }

  console.log('[Crawler] Done!');
}

main().catch(console.error);
```

---

## 七、GitHub Secrets 配置

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 说明 | 获取方式 |
|-------------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID | Dashboard → 右侧边栏 |
| `CLOUDFLARE_DATABASE_ID` | D1 数据库 ID | `wrangler d1 info github-trending-ai` |
| `CLOUDFLARE_KV_NAMESPACE_ID` | KV 命名空间 ID | `wrangler kv:namespace list` |
| `GITHUB_TOKEN` | GitHub PAT | Settings → Developer settings → PAT |
| `OPENAI_API_KEY` | OpenAI API Key（可选） | platform.openai.com |

**Cloudflare API Token 权限：**
- D1 → Edit
- KV Storage → Edit
- Pages → Edit

---

## 八、成本对比

| 项目 | 原方案 | 免费方案 |
|------|--------|---------|
| Cloudflare Workers Paid | $5/月 | $0 |
| Cloudflare Pages + D1 + KV + R2 | 含在 $5 内 | $0 |
| GitHub Actions | $0 | $0（公开仓库） |
| OpenAI API（可选） | ~$1-3/月 | ~$1-3/月 |
| **总计** | **~$5-8/月** | **$0-3/月** |

---

## 九、限制与注意事项

| 限制 | 影响 | 应对方案 |
|------|------|---------|
| 仓库必须公开 | 代码公开 | 开源项目本身就需要公开 |
| KV 写入 1000/天 | 数据抓取受限 | 每次抓取更新 < 500 个项目，足够 |
| D1 API 速率限制 | Cloudflare API 调用受限 | 分批写入，每批间隔 1 秒 |
| GitHub Actions 执行时间 | 单次最长 6 小时 | 抓取通常 5-15 分钟完成 |

---

## 十、迁移步骤

### 从原方案迁移：

1. **创建 GitHub 仓库（公开）**
   ```bash
   git init
   git remote add origin https://github.com/yourusername/github-trending-ai
   ```

2. **配置 GitHub Secrets**
   - 添加 6 个 Secrets（见第七节）

3. **创建抓取脚本**
   - 添加 `scripts/crawl.mjs`（见第六节）

4. **创建 Workflow**
   - 添加 `.github/workflows/crawl.yml`（见第五节）

5. **移除 Cloudflare Worker**
   - 删除 `worker/` 目录
   - 删除 `wrangler.toml` 中的 `[triggers]` 配置

6. **测试**
   ```bash
   # 手动触发 Workflow
   gh workflow run crawl.yml
   ```

---

*文档版本：1.0.0 | 最后更新：2026-06-28*
