# GitHub Trending AI - 附录文档

## 附录 A：API 规格

### A.1 API 端点清单

#### 1. GET /api/trending

获取 GitHub Trending AI 榜单。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| category | string | 否 | 项目分类 | all |
| period | string | 否 | 时间周期：daily/weekly/monthly | daily |
| page | integer | 否 | 页码 | 1 |
| limit | integer | 否 | 每页数量（最大 100） | 20 |
| language | string | 否 | 编程语言过滤 | - |

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "id": 123456789,
      "full_name": "owner/repo",
      "name": "repo",
      "owner_login": "owner",
      "owner_avatar_url": "https://avatars.githubusercontent.com/u/123456",
      "description": "An awesome AI project",
      "description_zh": "一个很棒的 AI 项目",
      "html_url": "https://github.com/owner/repo",
      "homepage": "https://example.com",
      "language": "Python",
      "topics": ["machine-learning", "deep-learning"],
      "stargazers_count": 15000,
      "forks_count": 2500,
      "open_issues_count": 45,
      "watchers_count": 500,
      "size_kb": 25600,
      "license_spdx": "MIT",
      "archived": false,
      "is_fork": false,
      "trending_stars": 150,
      "trending_rank": 1,
      "ai_quality_score": 85,
      "ai_tags": ["llm", "nlp"],
      "snapshot_date": "2026-06-28"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75
  },
  "meta": {
    "cached": true,
    "cache_age": 300,
    "period": "daily",
    "category": "all"
  }
}
```

**错误码：**
- `400 BAD_REQUEST` - 无效的请求参数
- `429 RATE_LIMITED` - 请求频率超限
- `500 INTERNAL_ERROR` - 服务器内部错误

**缓存策略：** KV 缓存 5 分钟

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/trending?category=machine-learning&period=daily&page=1&limit=20"
```

---

#### 2. GET /api/trending/:category

按分类获取 Trending 榜单。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| category | string | 项目分类 |

**查询参数：**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| period | string | 否 | 时间周期 | daily |
| page | integer | 否 | 页码 | 1 |
| limit | integer | 否 | 每页数量 | 20 |

**响应格式：** 与 `GET /api/trending` 相同

**错误码：**
- `400 BAD_REQUEST` - 无效的分类
- `404 NOT_FOUND` - 分类不存在

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/trending/machine-learning?period=weekly"
```

---

#### 3. GET /api/search

搜索项目。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| q | string | 是 | 搜索关键词 | - |
| language | string | 否 | 编程语言过滤 | - |
| stars | string | 否 | 星标数过滤（如 ">1000"） | - |
| sort | string | 否 | 排序方式：relevance/stars/updated | relevance |
| page | integer | 否 | 页码 | 1 |
| limit | integer | 否 | 每页数量 | 20 |

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "id": 123456789,
      "full_name": "owner/repo",
      "name": "repo",
      "description": "Project description",
      "description_zh": "项目描述",
      "language": "Python",
      "stargazers_count": 15000,
      "ai_quality_score": 85,
      "relevance_score": 0.95
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "totalPages": 13
  },
  "meta": {
    "query": "llm",
    "search_time_ms": 45
  }
}
```

**错误码：**
- `400 BAD_REQUEST` - 缺少搜索关键词或参数无效
- `500 INTERNAL_ERROR` - 搜索服务不可用

**缓存策略：** KV 缓存 2 分钟

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/search?q=llm&language=Python&sort=stars&page=1"
```

---

#### 4. GET /api/projects/:id

获取项目详情。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | integer | 项目 ID（GitHub Repo ID） |

**响应格式：**

```json
{
  "success": true,
  "data": {
    "id": 123456789,
    "full_name": "owner/repo",
    "name": "repo",
    "owner_login": "owner",
    "owner_avatar_url": "https://avatars.githubusercontent.com/u/123456",
    "description": "An awesome AI project",
    "description_zh": "一个很棒的 AI 项目",
    "html_url": "https://github.com/owner/repo",
    "homepage": "https://example.com",
    "language": "Python",
    "topics": ["machine-learning", "deep-learning"],
    "stargazers_count": 15000,
    "forks_count": 2500,
    "open_issues_count": 45,
    "watchers_count": 500,
    "size_kb": 25600,
    "license_spdx": "MIT",
    "archived": false,
    "is_fork": false,
    "has_wiki": true,
    "has_discussions": true,
    "default_branch": "main",
    "languages_breakdown": {
      "Python": 75.5,
      "JavaScript": 15.2,
      "TypeScript": 9.3
    },
    "readme_summary": "This project implements...",
    "ai_quality_score": 8.5,
    "ai_tags": ["llm", "nlp", "transformer"],
    "trending_score": 92.5,
    "comprehensive_rank": 15,
    "created_at": "2020-01-15T10:30:00Z",
    "updated_at": "2024-01-15T08:45:00Z",
    "pushed_at": "2024-01-14T22:30:00Z",
    "snapshot_date": "2024-01-15",
    "trending_history": [
      {
        "date": "2024-01-15",
        "rank": 5,
        "trending_stars": 150
      },
      {
        "date": "2024-01-14",
        "rank": 8,
        "trending_stars": 120
      }
    ],
    "related_projects": [
      {
        "id": 987654321,
        "full_name": "other/repo",
        "name": "repo",
        "stargazers_count": 8000,
        "ai_quality_score": 7.8
      }
    ]
  },
  "meta": {
    "cached": true,
    "cache_age": 600
  }
}
```

**错误码：**
- `404 NOT_FOUND` - 项目不存在
- `500 INTERNAL_ERROR` - 服务器内部错误

**缓存策略：** KV 缓存 10 分钟

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/projects/123456789"
```

---

#### 5. GET /api/spotlights

获取 AI 专题列表。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| category | string | 否 | 专题分类 | - |
| page | integer | 否 | 页码 | 1 |
| limit | integer | 否 | 每页数量 | 20 |

**响应格式：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "best-llm-frameworks",
      "title": "Best LLM Frameworks",
      "title_zh": "最佳 LLM 框架",
      "description": "Curated list of the best LLM frameworks",
      "description_zh": "精选最佳 LLM 框架列表",
      "icon": "🤖",
      "category": "frameworks",
      "project_count": 25,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  },
  "meta": {
    "cached": true,
    "cache_age": 3600
  }
}
```

**错误码：**
- `400 BAD_REQUEST` - 无效的请求参数
- `500 INTERNAL_ERROR` - 服务器内部错误

**缓存策略：** KV 缓存 1 小时

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/spotlights?category=frameworks"
```

---

#### 6. GET /api/spotlights/:id

获取专题详情。

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | string | 专题 ID 或 slug |

**响应格式：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "best-llm-frameworks",
    "title": "Best LLM Frameworks",
    "title_zh": "最佳 LLM 框架",
    "description": "Curated list of the best LLM frameworks",
    "description_zh": "精选最佳 LLM 框架列表",
    "icon": "🤖",
    "category": "frameworks",
    "ai_criteria": {
      "min_stars": 1000,
      "required_topics": ["llm", "ai"],
      "excluded_languages": ["HTML", "CSS"]
    },
    "project_count": 25,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z",
    "projects": [
      {
        "rank": 1,
        "added_at": "2024-01-01T00:00:00Z",
        "project": {
          "id": 123456789,
          "full_name": "owner/repo",
          "name": "repo",
          "description": "An awesome AI project",
          "description_zh": "一个很棒的 AI 项目",
          "language": "Python",
          "stargazers_count": 15000,
          "ai_quality_score": 8.5
        }
      }
    ]
  },
  "meta": {
    "cached": true,
    "cache_age": 1800
  }
}
```

**错误码：**
- `404 NOT_FOUND` - 专题不存在
- `500 INTERNAL_ERROR` - 服务器内部错误

**缓存策略：** KV 缓存 30 分钟

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/spotlights/best-llm-frameworks"
```

---

#### 7. GET /api/stats

获取网站统计数据。

**请求参数：** 无

**响应格式：**

```json
{
  "success": true,
  "data": {
    "total_projects": 15000,
    "total_stars": 75000000,
    "total_spotlights": 50,
    "languages_count": 45,
    "categories_count": 12,
    "trending_today": {
      "count": 250,
      "total_stars_gained": 15000
    },
    "top_languages": [
      {
        "language": "Python",
        "count": 5000,
        "percentage": 33.3
      },
      {
        "language": "JavaScript",
        "count": 3000,
        "percentage": 20.0
      }
    ],
    "top_categories": [
      {
        "category": "machine-learning",
        "count": 2500,
        "percentage": 16.7
      }
    ],
    "last_updated": "2024-01-15T08:00:00Z"
  },
  "meta": {
    "cached": true,
    "cache_age": 3600
  }
}
```

**错误码：**
- `500 INTERNAL_ERROR` - 服务器内部错误

**缓存策略：** KV 缓存 1 小时

**示例请求：**

```bash
curl "https://github-trending-ai.pages.dev/api/stats"
```

---

### A.2 通用响应格式

所有 API 端点均返回以下格式的 JSON 响应：

**成功响应：**

```json
{
  "success": true,
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75
  },
  "meta": {
    "cached": true,
    "cache_age": 300
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| success | boolean | 请求是否成功 |
| data | object/array | 响应数据 |
| pagination | object | 分页信息（仅列表接口） |
| meta | object | 元数据 |

**分页字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| page | integer | 当前页码 |
| limit | integer | 每页数量 |
| total | integer | 总记录数 |
| totalPages | integer | 总页数 |

**元数据字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| cached | boolean | 是否来自缓存 |
| cache_age | integer | 缓存剩余时间（秒） |

---

### A.3 错误响应格式

**错误响应：**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Project not found"
  }
}
```

**错误码清单：**

| HTTP 状态码 | 错误码 | 说明 |
|-------------|--------|------|
| 400 | BAD_REQUEST | 请求参数无效 |
| 404 | NOT_FOUND | 资源不存在 |
| 429 | RATE_LIMITED | 请求频率超限 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

**错误处理最佳实践：**

1. 始终检查 `success` 字段
2. 使用 `error.code` 进行程序化错误处理
3. 向用户展示 `error.message`
4. 实现指数退避重试（针对 429 错误）

---

## 附录 B：数据字典

### B.1 数据库表结构

#### 1. projects 表 - 项目主表

存储所有 GitHub 项目的核心信息。

```sql
CREATE TABLE IF NOT EXISTS projects (
    -- 主键：GitHub Repo ID
    id INTEGER PRIMARY KEY,

    -- 基本信息
    full_name TEXT UNIQUE NOT NULL,           -- 完整名称 (owner/repo)
    name TEXT NOT NULL,                        -- 仓库名称
    owner_login TEXT NOT NULL,                 -- 所有者用户名
    owner_avatar_url TEXT,                     -- 所有者头像 URL
    description TEXT,                          -- 项目描述（英文）
    description_zh TEXT,                       -- 项目描述（中文）
    html_url TEXT NOT NULL,                    -- GitHub 链接
    homepage TEXT,                             -- 项目主页

    -- 技术信息
    language TEXT,                             -- 主要编程语言
    topics TEXT,                               -- 话题标签 (JSON 数组)
    size_kb INTEGER DEFAULT 0,                 -- 仓库大小 (KB)
    license_spdx TEXT,                         -- 许可证 (SPDX 标识符)
    default_branch TEXT DEFAULT 'main',        -- 默认分支
    languages_breakdown TEXT,                  -- 语言占比 (JSON 对象)

    -- 统计数据
    stargazers_count INTEGER DEFAULT 0,        -- 星标数
    forks_count INTEGER DEFAULT 0,             -- Fork 数
    open_issues_count INTEGER DEFAULT 0,       -- 开放 Issue 数
    watchers_count INTEGER DEFAULT 0,          -- 关注者数
    contributors_count INTEGER DEFAULT 0,      -- 贡献者数量

    -- 状态标志
    archived BOOLEAN DEFAULT FALSE,            -- 是否已归档
    is_fork BOOLEAN DEFAULT FALSE,             -- 是否为 Fork
    has_wiki BOOLEAN DEFAULT FALSE,            -- 是否启用 Wiki
    has_discussions BOOLEAN DEFAULT FALSE,     -- 是否启用 Discussions

    -- AI 分析
    readme_summary TEXT,                       -- README 摘要
    ai_quality_score REAL DEFAULT 0,           -- AI 质量评分 (0-100)
    ai_tags TEXT,                              -- AI 标签 (JSON 数组)

    -- Trending 数据
    trending_score REAL DEFAULT 0,             -- Trending 分数 (0-100)
    comprehensive_rank INTEGER,                -- 综合排名
    star_velocity_7d REAL DEFAULT 0,           -- 近 7 天 Star 日均增速
    star_velocity_30d REAL DEFAULT 0,          -- 近 30 天 Star 日均增速

    -- 时间戳
    created_at TEXT,                           -- GitHub 创建时间
    updated_at TEXT,                           -- GitHub 更新时间
    pushed_at TEXT,                            -- 最后推送时间
    created_in_db TEXT DEFAULT (datetime('now')),  -- 数据库创建时间
    updated_in_db TEXT DEFAULT (datetime('now'))   -- 数据库更新时间
);

-- 索引
CREATE INDEX idx_projects_full_name ON projects(full_name);
CREATE INDEX idx_projects_language ON projects(language);
CREATE INDEX idx_projects_stargazers_count ON projects(stargazers_count DESC);
CREATE INDEX idx_projects_trending_score ON projects(trending_score DESC);
CREATE INDEX idx_projects_ai_quality_score ON projects(ai_quality_score DESC);
CREATE INDEX idx_projects_comprehensive_rank ON projects(comprehensive_rank);
CREATE INDEX idx_projects_owner_login ON projects(owner_login);
CREATE INDEX idx_projects_pushed_at ON projects(pushed_at);
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 主键，GitHub Repo ID |
| full_name | TEXT | 是 | 完整名称，格式：owner/repo，唯一约束 |
| name | TEXT | 是 | 仓库名称 |
| owner_login | TEXT | 是 | 所有者用户名 |
| owner_avatar_url | TEXT | 否 | 所有者头像 URL |
| description | TEXT | 否 | 项目描述（英文） |
| description_zh | TEXT | 否 | 项目描述（中文翻译，AI 生成） |
| html_url | TEXT | 是 | GitHub 仓库链接 |
| homepage | TEXT | 否 | 项目主页 URL |
| language | TEXT | 否 | 主要编程语言 |
| topics | TEXT | 否 | 话题标签，JSON 数组格式 |
| size_kb | INTEGER | 否 | 仓库大小，单位 KB |
| license_spdx | TEXT | 否 | 许可证 SPDX 标识符 |
| default_branch | TEXT | 否 | 默认分支名称 |
| languages_breakdown | TEXT | 否 | 各语言占比，JSON 对象格式 |
| stargazers_count | INTEGER | 否 | 星标数 |
| forks_count | INTEGER | 否 | Fork 数 |
| open_issues_count | INTEGER | 否 | 开放 Issue 数 |
| watchers_count | INTEGER | 否 | 关注者数 |
| contributors_count | INTEGER | 否 | 贡献者数量 |
| archived | BOOLEAN | 否 | 是否已归档 |
| is_fork | BOOLEAN | 否 | 是否为 Fork 仓库 |
| has_wiki | BOOLEAN | 否 | 是否启用 Wiki |
| has_discussions | BOOLEAN | 否 | 是否启用 Discussions |
| readme_summary | TEXT | 否 | README 内容摘要（AI 生成） |
| ai_quality_score | REAL | 否 | AI 质量评分，范围 0-100 |
| ai_tags | TEXT | 否 | AI 相关标签，JSON 数组格式 |
| trending_score | REAL | 否 | Trending 计算分数，范围 0-100 |
| comprehensive_rank | INTEGER | 否 | 综合排名 |
| star_velocity_7d | REAL | 否 | 近 7 天 Star 日均增速 |
| star_velocity_30d | REAL | 否 | 近 30 天 Star 日均增速 |
| created_at | TEXT | 否 | GitHub 仓库创建时间 |
| updated_at | TEXT | 否 | GitHub 仓库更新时间 |
| pushed_at | TEXT | 否 | 最后推送时间 |
| created_in_db | TEXT | 否 | 数据库记录创建时间 |
| updated_in_db | TEXT | 否 | 数据库记录更新时间 |

---

#### 2. project_daily_snapshot 表 - 每日快照

记录项目每日的统计数据变化。

```sql
CREATE TABLE IF NOT EXISTS project_daily_snapshots (
    -- 主键
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 关联项目
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- 快照日期
    snapshot_date TEXT NOT NULL,

    -- 每日统计数据
    stargazers_count INTEGER DEFAULT 0,        -- 当日星标数
    forks_count INTEGER DEFAULT 0,             -- 当日 Fork 数
    open_issues_count INTEGER DEFAULT 0,       -- 当日开放 Issue 数
    watchers_count INTEGER DEFAULT 0,          -- 当日关注者数

    -- 增量数据
    stars_gained INTEGER DEFAULT 0,            -- 当日新增星标
    forks_gained INTEGER DEFAULT 0,            -- 当日新增 Fork

    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),

    -- 唯一约束：每个项目每天只有一条记录
    UNIQUE(project_id, snapshot_date)
);

-- 索引
CREATE INDEX idx_snapshot_project_id ON project_daily_snapshot(project_id);
CREATE INDEX idx_snapshot_date ON project_daily_snapshot(snapshot_date);
CREATE INDEX idx_snapshot_stars_gained ON project_daily_snapshot(stars_gained DESC);
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 自增主键 |
| project_id | INTEGER | 是 | 关联项目 ID，外键 |
| snapshot_date | TEXT | 是 | 快照日期，格式：YYYY-MM-DD |
| stargazers_count | INTEGER | 否 | 当日星标总数 |
| forks_count | INTEGER | 否 | 当日 Fork 总数 |
| open_issues_count | INTEGER | 否 | 当日开放 Issue 数 |
| watchers_count | INTEGER | 否 | 当日关注者数 |
| stars_gained | INTEGER | 否 | 当日新增星标数 |
| forks_gained | INTEGER | 否 | 当日新增 Fork 数 |
| created_at | TEXT | 否 | 记录创建时间 |

---

#### 3. trending_snapshots 表 - 榜单记录

记录每日 Trending 榜单快照。

```sql
CREATE TABLE IF NOT EXISTS trending_snapshots (
    -- 主键
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 关联项目
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- 榜单信息
    date TEXT NOT NULL,                        -- 榜单日期
    rank INTEGER NOT NULL,                     -- 排名
    trending_stars INTEGER DEFAULT 0,          -- Trending 星标数
    category TEXT DEFAULT 'overall',           -- 分类
    period TEXT DEFAULT 'daily',               -- 时间周期

    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),

    -- 唯一约束：每个项目在同一天同一分类同一周期只有一条记录
    UNIQUE(project_id, date, category, period)
);

-- 索引
CREATE INDEX idx_trending_date ON trending_snapshots(date);
CREATE INDEX idx_trending_category ON trending_snapshots(category);
CREATE INDEX idx_trending_period ON trending_snapshots(period);
CREATE INDEX idx_trending_rank ON trending_snapshots(date, category, period, rank);
CREATE INDEX idx_trending_project_id ON trending_snapshots(project_id);
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 自增主键 |
| project_id | INTEGER | 是 | 关联项目 ID，外键 |
| date | TEXT | 是 | 榜单日期，格式：YYYY-MM-DD |
| rank | INTEGER | 是 | 排名 |
| trending_stars | INTEGER | 否 | Trending 星标数 |
| category | TEXT | 否 | 分类，默认 overall |
| period | TEXT | 否 | 时间周期，默认 daily |
| created_at | TEXT | 否 | 记录创建时间 |

---

#### 4. spotlights 表 - 专题表

存储 AI 专题信息。

```sql
CREATE TABLE IF NOT EXISTS spotlights (
    -- 主键
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- 基本信息
    slug TEXT UNIQUE NOT NULL,                 -- URL 友好的标识符
    title TEXT NOT NULL,                       -- 专题标题（英文）
    title_zh TEXT,                             -- 专题标题（中文）
    description TEXT,                          -- 专题描述（英文）
    description_zh TEXT,                       -- 专题描述（中文）
    icon TEXT,                                 -- 专题图标（Emoji）

    -- 分类
    category TEXT,                             -- 专题分类

    -- AI 筛选标准
    ai_criteria TEXT,                          -- AI 筛选条件 (JSON)

    -- 统计
    project_count INTEGER DEFAULT 0,           -- 包含项目数

    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX idx_spotlights_slug ON spotlights(slug);
CREATE INDEX idx_spotlights_category ON spotlights(category);
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | INTEGER | 是 | 自增主键 |
| slug | TEXT | 是 | URL 友好的标识符，唯一约束 |
| title | TEXT | 是 | 专题标题（英文） |
| title_zh | TEXT | 否 | 专题标题（中文） |
| description | TEXT | 否 | 专题描述（英文） |
| description_zh | TEXT | 否 | 专题描述（中文） |
| icon | TEXT | 否 | 专题图标，支持 Emoji |
| category | TEXT | 否 | 专题分类 |
| ai_criteria | TEXT | 否 | AI 筛选条件，JSON 格式 |
| project_count | INTEGER | 否 | 包含的项目数量 |
| created_at | TEXT | 否 | 创建时间 |
| updated_at | TEXT | 否 | 更新时间 |

---

#### 5. spotlights_projects 表 - 专题项目关联表

关联专题和项目的多对多关系。

```sql
CREATE TABLE IF NOT EXISTS spotlights_projects (
    -- 复合主键
    spotlight_id INTEGER NOT NULL REFERENCES spotlights(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- 排名
    rank INTEGER DEFAULT 0,                    -- 在专题中的排名

    -- 时间戳
    added_at TEXT DEFAULT (datetime('now')),   -- 添加时间

    -- 复合主键
    PRIMARY KEY (spotlight_id, project_id)
);

-- 索引
CREATE INDEX idx_spotlights_projects_spotlight_id ON spotlights_projects(spotlight_id);
CREATE INDEX idx_spotlights_projects_project_id ON spotlights_projects(project_id);
CREATE INDEX idx_spotlights_projects_rank ON spotlights_projects(spotlight_id, rank);
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| spotlight_id | INTEGER | 是 | 专题 ID，外键，复合主键一部分 |
| project_id | INTEGER | 是 | 项目 ID，外键，复合主键一部分 |
| rank | INTEGER | 否 | 在专题中的排名 |
| added_at | TEXT | 否 | 添加到专题的时间 |

---

#### 6. projects_fts 表 - FTS5 全文搜索虚拟表

用于高效的全文搜索。

```sql
-- FTS5 虚拟表
CREATE VIRTUAL TABLE IF NOT EXISTS projects_fts USING fts5(
    name,                                     -- 仓库名称
    description,                              -- 项目描述（英文）
    description_zh,                           -- 项目描述（中文）
    topics,                                   -- 话题标签
    readme_summary,                           -- README 摘要
    content='projects',                       -- 内容表
    content_rowid='id',                       -- 行 ID 映射
    tokenize='porter unicode61'               -- 分词器配置
);

-- 触发器：插入时同步
CREATE TRIGGER IF NOT EXISTS projects_ai AFTER INSERT ON projects BEGIN
    INSERT INTO projects_fts(rowid, name, description, description_zh, topics, readme_summary)
    VALUES (new.id, new.name, new.description, new.description_zh, new.topics, new.readme_summary);
END;

-- 触发器：更新时同步
CREATE TRIGGER IF NOT EXISTS projects_au AFTER UPDATE ON projects BEGIN
    INSERT INTO projects_fts(projects_fts, rowid, name, description, description_zh, topics, readme_summary)
    VALUES ('delete', old.id, old.name, old.description, old.description_zh, old.topics, old.readme_summary);
    INSERT INTO projects_fts(rowid, name, description, description_zh, topics, readme_summary)
    VALUES (new.id, new.name, new.description, new.description_zh, new.topics, new.readme_summary);
END;

-- 触发器：删除时同步
CREATE TRIGGER IF NOT EXISTS projects_ad AFTER DELETE ON projects BEGIN
    INSERT INTO projects_fts(projects_fts, rowid, name, description, description_zh, topics, readme_summary)
    VALUES ('delete', old.id, old.name, old.description, old.description_zh, old.topics, old.readme_summary);
END;
```

**FTS5 配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| content | projects | 内容来源表 |
| content_rowid | id | 行 ID 映射到 projects 表的 id 字段 |
| tokenize | porter unicode61 | 使用 Porter 词干提取 + Unicode 分词 |

---

### B.2 字段枚举值

#### 编程语言列表

以下为常见的编程语言及其标识符：

| 语言 | 标识符 | 语言 | 标识符 |
|------|--------|------|--------|
| Python | Python | JavaScript | JavaScript |
| TypeScript | TypeScript | Java | Java |
| C++ | C++ | C# | C# |
| Go | Go | Rust | Rust |
| Ruby | Ruby | PHP | PHP |
| Swift | Swift | Kotlin | Kotlin |
| Scala | Scala | R | R |
| Julia | Julia | Dart | Dart |
| Lua | Lua | Haskell | Haskell |
| Elixir | Elixir | Clojure | Clojure |
| Shell | Shell | PowerShell | PowerShell |
| Jupyter Notebook | Jupyter Notebook | HTML | HTML |
| CSS | CSS | Vue | Vue |
| Svelte | Svelte | Astro | Astro |

#### 项目分类列表

| 分类 | 标识符 | 说明 |
|------|--------|------|
| 全部 | all | 所有分类 |
| 机器学习 | machine-learning | ML 框架和工具 |
| 深度学习 | deep-learning | DL 框架和工具 |
| 自然语言处理 | nlp | NLP 相关项目 |
| 计算机视觉 | computer-vision | CV 相关项目 |
| 大语言模型 | llm | LLM 相关项目 |
| 生成式 AI | generative-ai | GenAI 相关项目 |
| AI 助手 | ai-assistants | AI 助手应用 |
| AI 开发工具 | ai-dev-tools | AI 开发工具 |
| 数据处理 | data-processing | 数据处理工具 |
| 模型部署 | model-deployment | 模型部署工具 |
| AI 安全 | ai-safety | AI 安全相关 |

#### 许可证列表

| 许可证 | SPDX 标识符 | 类型 |
|--------|-------------|------|
| MIT License | MIT | 宽松 |
| Apache License 2.0 | Apache-2.0 | 宽松 |
| GNU GPLv3 | GPL-3.0 | Copyleft |
| GNU GPLv2 | GPL-2.0 | Copyleft |
| BSD 3-Clause | BSD-3-Clause | 宽松 |
| BSD 2-Clause | BSD-2-Clause | 宽松 |
| ISC License | ISC | 宽松 |
| Mozilla Public License 2.0 | MPL-2.0 | 弱 Copyleft |
| The Unlicense | Unlicense | 公共领域 |
| Creative Commons Zero v1.0 | CC0-1.0 | 公共领域 |

#### 专题分类列表

| 分类 | 标识符 | 说明 |
|------|--------|------|
| 框架 | frameworks | AI/ML 框架 |
| 应用 | applications | AI 应用 |
| 工具 | tools | 开发工具 |
| 教程 | tutorials | 学习资源 |
| 数据集 | datasets | 数据集资源 |
| 模型 | models | 预训练模型 |
| 部署 | deployment | 部署相关 |
| 评估 | evaluation | 评估工具 |

---

### B.3 FTS5 配置

#### 分词器配置

```sql
-- 默认分词器：porter unicode61
tokenize='porter unicode61'

-- 可选分词器配置：
-- 1. 基础 Unicode 分词
tokenize='unicode61'

-- 2. Porter 词干提取 + Unicode
tokenize='porter unicode61'

-- 3. 移除停用词
tokenize='porter unicode61 remove_diacritics 2'
```

#### 搜索语法

```sql
-- 基础搜索
SELECT * FROM projects_fts WHERE projects_fts MATCH 'machine learning';

-- 短语搜索
SELECT * FROM projects_fts WHERE projects_fts MATCH '"deep learning"';

-- 前缀搜索
SELECT * FROM projects_fts WHERE projects_fts MATCH 'learn*';

-- 布尔搜索
SELECT * FROM projects_fts WHERE projects_fts MATCH 'machine AND learning';
SELECT * FROM projects_fts WHERE projects_fts MATCH 'machine OR learning';
SELECT * FROM projects_fts WHERE projects_fts MATCH 'machine NOT tensorflow';

-- 列指定搜索
SELECT * FROM projects_fts WHERE projects_fts MATCH 'name:transformer';

-- 排名排序
SELECT *, rank FROM projects_fts WHERE projects_fts MATCH 'llm' ORDER BY rank;
```

#### FTS5 同步策略

```sql
-- 手动重建索引
INSERT INTO projects_fts(projects_fts) VALUES('rebuild');

-- 优化索引
INSERT INTO projects_fts(projects_fts) VALUES('optimize');

-- 检查索引完整性
INSERT INTO projects_fts(projects_fts) VALUES('integrity-check');
```

---

## 附录 C：部署指南

### C.1 环境准备

#### 1. Cloudflare 账号配置

1. 注册 Cloudflare 账号：https://dash.cloudflare.com/sign-up
2. 启用以下服务：
   - Cloudflare Pages
   - Workers
   - D1 数据库
   - KV 存储
   - R2 对象存储

#### 2. 安装 wrangler CLI

```bash
# 使用 npm 安装（推荐）
npm install -g wrangler

# 或使用 npx（无需全局安装）
npx wrangler --version

# 登录 Cloudflare
wrangler login
```

#### 3. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create github-trending-ai

# 输出示例：
# ✅ Successfully created DB 'github-trending-ai'
# [[d1_databases]]
# binding = "DB"
# database_name = "github-trending-ai"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 4. 创建 KV 命名空间

```bash
# 创建 KV 命名空间
wrangler kv:namespace create CACHE

# 输出示例：
# ✨ Success!
# Add the following to your configuration file:
# [[kv_namespaces]]
# binding = "CACHE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 创建预览命名空间
wrangler kv:namespace create CACHE --preview
```

#### 5. 创建 R2 存储桶

```bash
# 创建 R2 存储桶
wrangler r2 bucket create github-trending-ai-assets

# 验证创建
wrangler r2 bucket list
```

#### 6. 配置 GitHub Token

1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 创建新 Token，勾选以下权限：
   - `repo` - 访问仓库
   - `read:user` - 读取用户信息
3. 复制 Token 备用

---

### C.2 项目配置

#### 1. wrangler.toml 配置示例

```toml
name = "github-trending-ai"
main = "src/worker.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# 环境变量
[vars]
GITHUB_TOKEN = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
ENVIRONMENT = "production"

# D1 数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "github-trending-ai"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# KV 命名空间绑定
[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# R2 存储桶绑定
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "github-trending-ai-assets"

# Cron 触发器
[triggers]
crons = ["0 */6 * * *"]  # 每 6 小时执行一次

# 环境配置（可选）
[env.staging]
name = "github-trending-ai-staging"
vars = { ENVIRONMENT = "staging" }

[[env.staging.d1_databases]]
binding = "DB"
database_name = "github-trending-ai-staging"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 2. astro.config.mjs 配置示例

```javascript
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
    react(),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_SITE_URL': JSON.stringify('https://gtai.dev'),
    },
  },
});
```

#### 3. 环境变量配置

创建 `.env` 文件（仅用于本地开发）：

```bash
# GitHub 配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 数据库配置
DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
KV_NAMESPACE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 应用配置
NODE_ENV=development
API_BASE_URL=http://localhost:4321
```

创建 `.dev.vars` 文件（用于 wrangler 本地开发）：

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENVIRONMENT=development
```

---

### C.3 构建和部署

#### 1. 本地开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 使用 wrangler 本地开发（包含 D1/KV/R2）
npm run dev:wrangler

# 或直接使用 wrangler
wrangler pages dev --d1=DB --kv=CACHE --r2=ASSETS
```

#### 2. 构建命令

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run check

# 运行测试
npm test
```

#### 3. 部署命令

```bash
# 部署到 Cloudflare Pages
npm run deploy

# 或使用 wrangler 直接部署
wrangler pages deploy dist

# 部署到预览环境
wrangler pages deploy dist --branch=staging

# 查看部署历史
wrangler pages deployment list
```

#### 4. Cron Worker 部署

```bash
# 部署 Worker（包含 Cron 触发器）
wrangler deploy

# 查看 Cron 触发器状态
wrangler cron list

# 手动触发 Cron 任务
wrangler cron trigger github-trending-ai

# 查看 Worker 日志
wrangler tail
```

---

### C.4 数据库初始化

#### 1. 执行建表 SQL

```bash
# 创建数据库表
wrangler d1 execute github-trending-ai --file=./schema.sql

# 或使用多条命令
wrangler d1 execute github-trending-ai --command="
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    full_name TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    owner_login TEXT NOT NULL,
    -- ... 其他字段
);
"
```

#### 2. 创建索引

```bash
# 执行索引创建脚本
wrangler d1 execute github-trending-ai --file=./indexes.sql

# 验证索引
wrangler d1 execute github-trending-ai --command="
SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL;
"
```

#### 3. 初始化 FTS5

```bash
# 创建 FTS5 虚拟表
wrangler d1 execute github-trending-ai --file=./fts.sql

# 验证 FTS5 表
wrangler d1 execute github-trending-ai --command="
SELECT name FROM sqlite_master WHERE type='table' AND name='projects_fts';
"

# 测试搜索功能
wrangler d1 execute github-trending-ai --command="
SELECT * FROM projects_fts WHERE projects_fts MATCH 'machine learning' LIMIT 5;
"
```

#### 4. 验证数据库

```bash
# 列出所有表
wrangler d1 execute github-trending-ai --command="
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
"

# 查看表结构
wrangler d1 execute github-trending-ai --command="
PRAGMA table_info(projects);
"

# 检查记录数
wrangler d1 execute github-trending-ai --command="
SELECT 
    (SELECT COUNT(*) FROM projects) as projects_count,
    (SELECT COUNT(*) FROM trending_snapshots) as snapshots_count,
    (SELECT COUNT(*) FROM spotlights) as spotlights_count;
"
```

---

### C.5 数据抓取配置

#### 1. Cron Worker 配置

在 `wrangler.toml` 中配置 Cron 触发器：

```toml
[triggers]
crons = [
    "0 */6 * * *",    # 每 6 小时：抓取 Trending 数据
    "0 0 * * *",      # 每天 0 点：生成每日快照
    "0 1 * * 0",      # 每周日 1 点：生成周报
    "0 2 1 * *"       # 每月 1 日 2 点：生成月报
]
```

#### 2. GitHub Token 配置

在 Cloudflare Dashboard 中配置环境变量：

1. 访问 Workers & Pages > Settings > Variables
2. 添加环境变量：
   - 名称：`GITHUB_TOKEN`
   - 值：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 类型：Secret

或使用 CLI：

```bash
# 添加密钥
wrangler secret put GITHUB_TOKEN
# 输入 Token 值

# 查看密钥列表
wrangler secret list
```

#### 3. 抓取参数配置

在 `src/config.ts` 中配置抓取参数：

```typescript
export const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
    apiBase: 'https://api.github.com',
    rateLimit: {
      requests: 5000,        // 每小时请求数
      interval: 3600000,     // 时间间隔（毫秒）
    },
  },
  scraping: {
    trending: {
      languages: ['python', 'javascript', 'typescript', 'java', 'go', 'rust'],
      categories: ['all', 'machine-learning', 'deep-learning', 'nlp'],
      periods: ['daily', 'weekly', 'monthly'],
    },
    batchSize: 10,           // 每批处理项目数
    delayBetweenBatches: 1000, // 批次间延迟（毫秒）
  },
  cache: {
    ttl: {
      trending: 300,         // Trending 数据缓存 5 分钟
      project: 600,          // 项目详情缓存 10 分钟
      search: 120,           // 搜索结果缓存 2 分钟
      stats: 3600,           // 统计数据缓存 1 小时
    },
  },
};
```

#### 4. LLM API 配置

本项目使用 LLM 进行以下功能：
- **中文描述翻译** — 将英文 description 翻译为中文
- **README 摘要生成** — 从 README 中提取核心价值
- **AI 创新性评分** — 每月评估项目创新性（15% 权重）

**推荐方案：OpenAI API (gpt-4o-mini)**

| 功能 | 模型 | 调用频率 | 预估成本/月 |
|------|------|---------|------------|
| 中文翻译 | gpt-4o-mini | 每日（新项目） | ~$0.5 |
| README 摘要 | gpt-4o-mini | 每日（新项目） | ~$0.3 |
| 创新性评分 | gpt-4o | 每月（全量） | ~$2 |
| **总计** | - | - | **~$3/月** |

**配置步骤：**

1. 获取 OpenAI API Key：https://platform.openai.com/api-keys
2. 在 Cloudflare 中配置环境变量：

```bash
wrangler secret put OPENAI_API_KEY
# 输入 sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

3. 在 Worker 中使用：

```typescript
// worker/src/ai-generator.ts
async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**备选方案：Cloudflare Workers AI**

如果不想使用外部 API，可以使用 Cloudflare 内置的 Workers AI：

```typescript
// 使用 Workers AI（免费额度：每天 10,000 次神经元）
const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
  messages: [
    { role: 'system', content: 'You are a helpful translator.' },
    { role: 'user', content: `Translate to Chinese: ${description}` },
  ],
});
```

| 方案 | 优势 | 劣势 |
|------|------|------|
| OpenAI API | 质量高、稳定 | 需付费 |
| Workers AI | 免费额度、边缘延迟低 | 质量略低、模型选择有限 |

---

### C.6 监控和维护

#### 1. Cloudflare Analytics 查看

1. **Pages Analytics**
   - 访问 Cloudflare Dashboard > Pages > github-trending-ai
   - 查看请求量、带宽、错误率

2. **Workers Analytics**
   - 访问 Cloudflare Dashboard > Workers > github-trending-ai
   - 查看请求数、执行时间、错误日志

3. **D1 Analytics**
   - 访问 Cloudflare Dashboard > D1 > github-trending-ai
   - 查看查询次数、存储使用量

#### 2. 日志查看

```bash
# 实时查看 Worker 日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --format=pretty

# 过滤错误日志
wrangler tail --format=json | jq 'select(.outcome == "exception")'

# 查看 Cron 执行日志
wrangler tail --format=pretty | grep "cron"
```

#### 3. 错误告警配置

在 Cloudflare Dashboard 中配置告警：

1. 访问 Notifications
2. 创建告警规则：
   - **错误率告警**：错误率 > 5% 时通知
   - **请求量告警**：请求量异常波动时通知
   - **执行时间告警**：P95 执行时间 > 50ms 时通知

示例告警配置：

```json
{
  "name": "High Error Rate",
  "description": "Error rate exceeds 5%",
  "enabled": true,
  "filters": {
    "workers": ["github-trending-ai"],
    "error_rate_threshold": 5
  },
  "actions": {
    "email": ["admin@example.com"],
    "webhook": "https://hooks.slack.com/services/xxx"
  }
}
```

#### 4. 数据库备份

```bash
# 导出数据库
wrangler d1 export github-trending-ai --output=./backup.sql

# 导出特定表
wrangler d1 execute github-trending-ai --command="
SELECT * FROM projects;
" --output=./projects_backup.csv

# 定期备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="./backups/$DATE"
mkdir -p $BACKUP_DIR

wrangler d1 export github-trending-ai --output="$BACKUP_DIR/full_backup.sql"
echo "Backup completed: $BACKUP_DIR"
```

#### 5. 性能优化建议

1. **缓存策略**
   - 使用 KV 缓存热点数据
   - 设置合理的 TTL
   - 实现缓存预热

2. **数据库优化**
   - 定期执行 `VACUUM`
   - 监控慢查询
   - 优化索引使用

```bash
# 数据库优化
wrangler d1 execute github-trending-ai --command="VACUUM;"

# 查看查询计划
wrangler d1 execute github-trending-ai --command="
EXPLAIN QUERY PLAN SELECT * FROM projects WHERE language = 'Python';
"
```

3. **Worker 优化**
   - 减少冷启动时间
   - 使用流式响应
   - 实现请求批处理

---

## 附录 D：常见问题

### D.1 部署问题

**Q: 部署失败，提示 "Database not found"**

A: 确保 D1 数据库已创建，并在 `wrangler.toml` 中正确配置 `database_id`。

**Q: KV 绑定无效**

A: 检查 KV 命名空间 ID 是否正确，确保使用的是生产环境 ID 而非预览 ID。

### D.2 数据抓取问题

**Q: GitHub API 返回 403 错误**

A: 检查 Token 是否有效，是否达到速率限制。可以通过以下命令检查：

```bash
curl -H "Authorization: token ghp_xxxx" https://api.github.com/rate_limit
```

**Q: Cron 任务未执行**

A: 检查 Cron 触发器配置，查看 Worker 日志排查错误。

### D.3 性能问题

**Q: API 响应缓慢**

A: 检查缓存是否生效，查看 D1 查询性能，考虑添加更多索引。

**Q: 搜索结果不准确**

A: 重建 FTS5 索引：

```bash
wrangler d1 execute github-trending-ai --command="
INSERT INTO projects_fts(projects_fts) VALUES('rebuild');
"
```

---

## 附录 E：版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-06-28 | 初始版本 |

---

*文档最后更新：2026-06-28*
