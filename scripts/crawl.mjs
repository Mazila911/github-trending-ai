/**
 * GitHub Trending 抓取脚本
 *
 * 功能：
 * 1. 抓取 GitHub Trending 页面（多语言）
 * 2. 通过 GitHub API 补充项目详情
 * 3. 可选：通过 OpenAI API 生成中文描述
 * 4. 合并新旧数据并输出
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { parse } from 'node-html-parser';
import { fetchWithRateLimit } from './lib/github-api.mjs';

// ========== 配置 ==========

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
const LLM_API_URL = (process.env.LLM_API_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-flash';
const DATA_FILE = 'src/data/projects.json';
const TRENDING_FILE = 'src/data/trending.json';
const LANGUAGES = ['', 'python', 'typescript', 'javascript', 'rust', 'go'];

// ========== 工具函数 ==========

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseNumber(text) {
  if (!text) return 0;
  return parseInt(text.replace(/,/g, '').trim()) || 0;
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

function ensureDataDir() {
  const dir = dirname(DATA_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ========== GitHub Trending 抓取 ==========

function parseTrendingHTML(html) {
  const root = parse(html);
  const articles = root.querySelectorAll('article.Box-row');
  const projects = [];

  for (const article of articles) {
    try {
      const nameLink = article.querySelector('h2 a');
      if (!nameLink) continue;

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
      console.error('[Crawler] Parse error:', err.message);
    }
  }

  return projects;
}

async function crawlTrending() {
  const projects = [];

  for (const lang of LANGUAGES) {
    const url = lang
      ? `https://github.com/trending/${lang}?spoken_language_code=en`
      : 'https://github.com/trending?spoken_language_code=en';

    console.log(`[Crawler] Fetching ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[Crawler] HTTP ${response.status} for ${url}`);
        continue;
      }
      const html = await response.text();
      const parsed = parseTrendingHTML(html);
      console.log(`[Crawler]   Found ${parsed.length} projects for "${lang || 'overall'}"`);
      projects.push(...parsed);
    } catch (err) {
      console.error(`[Crawler] Failed to fetch ${url}:`, err.message);
    }

    await sleep(2000);
  }

  return deduplicateByFullName(projects);
}

// ========== GitHub API 补充详情 ==========

async function enrichProject(owner, name) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is required for API enrichment');
  }

  const url = `https://api.github.com/repos/${owner}/${name}`;
  const response = await fetchWithRateLimit(url, GITHUB_TOKEN);
  const data = await response.json();

  return {
    id: data.id,
    full_name: data.full_name,
    name: data.name,
    owner_login: data.owner.login,
    owner_avatar_url: data.owner.avatar_url,
    owner_type: data.owner.type,
    description: data.description || '',
    html_url: data.html_url,
    homepage: data.homepage || undefined,
    language: data.language || undefined,
    topics: data.topics || [],
    license_spdx: data.license?.spdx_id || undefined,
    default_branch: data.default_branch,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    open_issues_count: data.open_issues_count,
    watchers_count: data.subscribers_count || data.watchers_count,
    size_kb: data.size,
    archived: data.archived,
    is_fork: data.fork,
    has_wiki: data.has_wiki,
    has_discussions: data.has_discussions || false,
    created_at: data.created_at,
    updated_at: data.updated_at,
    pushed_at: data.pushed_at,
  };
}

// ========== AI 描述生成 ==========

async function generateAIDescription(project) {
  if (!LLM_API_KEY) return null;

  const prompt = `请为以下 GitHub 开源项目生成两部分内容：

## 第一部分：中文简介
用一句话简洁准确地描述这个项目做什么，不超过 50 字。用于卡片和列表展示。

## 第二部分：README 深度摘要
请按照以下结构来总结这个项目，整体风格简约直白，有故事感：

1. 【主题】用一句话点明项目的核心定位和要解决的问题

2. 【核心分点总结】提炼 3-5 个关键特性，每个分点格式如下：
   - 序号开头
   - 先写关键词（加粗效果），再写核心总结
   - 各分点之间空一行

3. 【行动指南】给出 2-3 条面向开发者的现实行动建议（什么场景下该用这个项目、怎么上手），带序号

4. 【金句总述】一句话总结这个项目的价值，要有记忆点

5. 【故事性收尾】用一小段富有画面感的文字，描述使用这个项目后开发者的工作状态变化

项目信息：
- 名称：${project.full_name}
- 英文描述：${project.description || '无'}
- 编程语言：${project.language || '未知'}
- Topics：${(project.topics || []).join(', ') || '无'}
- Stars：${project.stargazers_count || 0}
- Forks：${project.forks_count || 0}

请以 JSON 格式返回：
{
  "description_zh": "一句话中文简介",
  "readme_summary": "完整的深度摘要（Markdown 格式）"
}`;

  try {
    const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error(`[AI] LLM API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.error(`[AI] Failed to generate description:`, err.message);
    return null;
  }
}

// ========== 数据合并 ==========

function mergeProjects(existing, enriched) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const merged = new Map(existing.map(p => [p.id, p]));

  for (const item of enriched) {
    if (!item.details) continue;

    const existingProject = merged.get(item.details.id);

    if (existingProject) {
      // 更新现有项目
      existingProject.last_trending_date = today;
      existingProject.trending_history = [
        {
          date: today,
          rank: item.rank,
          stars_gained: item.starsToday,
          category: item.category || 'overall',
          period: 'daily',
        },
        ...(existingProject.trending_history || []).slice(0, 9),
      ];
      // 更新统计数据和基本信息
      Object.assign(existingProject, item.details);
      existingProject.crawled_at = now;

      // 更新 AI 内容（如果有新的）
      if (item.aiContent) {
        existingProject.description_zh = item.aiContent.description_zh;
        existingProject.readme_summary = item.aiContent.readme_summary;
      }
    } else {
      // 新项目
      merged.set(item.details.id, {
        ...item.details,
        first_seen_at: today,
        last_trending_date: today,
        trending_history: [
          {
            date: today,
            rank: item.rank,
            stars_gained: item.starsToday,
            category: item.category || 'overall',
            period: 'daily',
          },
        ],
        // 初始化评分字段（后续由 calculate-scores.mjs 更新）
        ai_quality_score: 0,
        trending_score: 0,
        comprehensive_rank: 0,
        star_velocity_7d: 0,
        star_velocity_30d: 0,
        crawled_at: now,
        // AI 生成内容
        ...(item.aiContent ? {
          description_zh: item.aiContent.description_zh,
          readme_summary: item.aiContent.readme_summary,
        } : {}),
      });
    }
  }

  return Array.from(merged.values());
}

// ========== 主流程 ==========

async function main() {
  console.log('[Crawler] Starting...');

  ensureDataDir();

  // 1. 加载现有数据
  const existing = loadExistingProjects();
  console.log(`[Crawler] Loaded ${existing.length} existing projects`);

  // 2. 抓取 Trending
  const trending = await crawlTrending();
  console.log(`[Crawler] Found ${trending.length} unique trending projects`);

  if (trending.length === 0) {
    console.log('[Crawler] No trending projects found, skipping enrichment');
    return;
  }

  // 3. 补充详情 + AI 描述
  const enriched = [];
  let rank = 0;

  for (const item of trending) {
    rank++;
    try {
      console.log(`[Crawler] Enriching ${item.fullName} (${rank}/${trending.length})`);
      const details = await enrichProject(item.owner, item.name);

      // 生成 AI 描述（仅新项目或缺少摘要的项目）
      let aiContent = null;
      if (LLM_API_KEY) {
        const existingProject = existing.find(p => p.id === details.id);
        const hasAIContent = existingProject && existingProject.readme_summary && existingProject.description_zh;
        const descChanged = existingProject && existingProject.description !== details.description;
        if (!existingProject || !hasAIContent || descChanged) {
          aiContent = await generateAIDescription(details);
          await sleep(500); // LLM API 速率限制
        }
      }

      enriched.push({
        ...item,
        rank,
        details,
        aiContent,
      });

      await sleep(1000); // GitHub API 速率限制
    } catch (err) {
      console.error(`[Crawler] Failed: ${item.fullName} -`, err.message);
    }
  }

  console.log(`[Crawler] Successfully enriched ${enriched.length} projects`);

  // 4. 合并数据
  const merged = mergeProjects(existing, enriched);
  console.log(`[Crawler] Total projects after merge: ${merged.length}`);

  // 5. 保存 projects.json
  writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));
  console.log(`[Crawler] Saved ${DATA_FILE}`);

  // 6. 保存 trending.json
  const trendingData = {
    last_updated: new Date().toISOString(),
    period: 'daily',
    projects: enriched
      .filter(p => p.details)
      .map((p, idx) => ({
        project_id: p.details.id,
        rank: idx + 1,
        stars_gained: p.starsToday,
        category: 'overall',
      })),
  };

  writeFileSync(TRENDING_FILE, JSON.stringify(trendingData, null, 2));
  console.log(`[Crawler] Saved ${TRENDING_FILE}`);

  console.log('[Crawler] Done!');
}

main().catch(err => {
  console.error('[Crawler] Fatal error:', err);
  process.exit(1);
});
