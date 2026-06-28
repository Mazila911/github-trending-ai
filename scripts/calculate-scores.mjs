// scripts/calculate-scores.mjs
import { readFileSync, writeFileSync } from 'fs';

const DATA_FILE = 'src/data/projects.json';

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
 * 新鲜度衰减函数
 * 根据距离最后推送的天数计算衰减因子
 *
 * @param {number} days - 距离最后推送的天数
 * @returns {number} 衰减因子 (0.1-1.0)
 */
function freshnessDecay(days) {
  if (days <= 1) return 1.0;
  if (days <= 7) return 0.95;
  if (days <= 30) return 0.85;
  if (days <= 90) return 0.6;
  if (days <= 365) return 0.3;
  return 0.1;
}

/**
 * 计算 Star 分数
 * 使用对数归一化，避免超级大项目碾压小项目
 *
 * @param {object} project - 项目对象
 * @returns {number} Star 分数 (0-100)
 */
function calculateStarScore(project) {
  return logNormalize(project.stargazers_count);
}

/**
 * 计算项目的 trending 原始指标
 *
 * @param {object} project - 项目对象
 * @returns {object} { starsGained7d, starsGained30d, acceleration }
 */
function getTrendingMetrics(project) {
  const history = project.trending_history || [];
  const starsGained7d = history.slice(0, 7).reduce((sum, h) => sum + (h.stars_gained || 0), 0);
  const starsGained30d = history.slice(0, 30).reduce((sum, h) => sum + (h.stars_gained || 0), 0);
  const avgDaily30d = starsGained30d / 30;
  const todayStars = history[0]?.stars_gained || 0;
  const acceleration = todayStars / (avgDaily30d + 1);
  return { starsGained7d, starsGained30d, acceleration };
}

/**
 * 计算 Trending 分数
 * 基于 trending_history 的 7d/30d stars 和加速度
 * 需要传入全局最大值以正确归一化
 *
 * @param {object} project - 项目对象
 * @param {object} maxValues - 全局最大值 { max7d, max30d, maxAcceleration }
 * @returns {number} Trending 分数 (0-100)
 */
function calculateTrendingScore(project, maxValues = {}) {
  const { max7d = 100, max30d = 100, maxAcceleration = 100 } = maxValues;
  const { starsGained7d, starsGained30d, acceleration } = getTrendingMetrics(project);

  const score = (
    0.5 * normalize(starsGained7d, 0, max7d) +
    0.3 * normalize(starsGained30d, 0, max30d) +
    0.2 * normalize(acceleration, 0, maxAcceleration)
  );

  // 新鲜度衰减
  const daysSincePush = (Date.now() - new Date(project.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  return score * freshnessDecay(daysSincePush);
}

/**
 * 计算活跃度分数
 * 基于 pushed_at 的新鲜度
 *
 * @param {object} project - 项目对象
 * @returns {number} 活跃度分数 (0-100)
 */
function calculateActivityScore(project) {
  const daysSincePush = (Date.now() - new Date(project.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  const freshness = freshnessDecay(daysSincePush);
  return normalize(freshness * 100);
}

/**
 * 计算影响力分数
 * 基于 forks, watchers, fork ratio
 *
 * @param {object} project - 项目对象
 * @returns {number} 影响力分数 (0-100)
 */
function calculateImpactScore(project) {
  const forkRatio = project.stargazers_count > 0 ? project.forks_count / project.stargazers_count : 0;
  return (
    0.4 * logNormalize(project.forks_count) +
    0.3 * logNormalize(project.watchers_count) +
    0.3 * normalize(forkRatio * 100)
  );
}

/**
 * 计算全局 trending 指标最大值
 * 用于 normalize 时提供合理的 max 参数
 *
 * @param {Array} projects - 项目数组
 * @returns {object} { max7d, max30d, maxAcceleration }
 */
function computeTrendingMaxValues(projects) {
  let max7d = 1;
  let max30d = 1;
  let maxAcceleration = 1;

  for (const project of projects) {
    const metrics = getTrendingMetrics(project);
    if (metrics.starsGained7d > max7d) max7d = metrics.starsGained7d;
    if (metrics.starsGained30d > max30d) max30d = metrics.starsGained30d;
    if (metrics.acceleration > maxAcceleration) maxAcceleration = metrics.acceleration;
  }

  return { max7d, max30d, maxAcceleration };
}

/**
 * 计算综合分数
 * 加权求和：15% star, 25% trending, 30% AI, 15% activity, 15% impact
 *
 * @param {object} project - 项目对象
 * @param {object} maxValues - trending 全局最大值
 * @returns {number} 综合分数
 */
function calculateComprehensiveScore(project, maxValues) {
  const starScore = calculateStarScore(project);
  const trendingScore = calculateTrendingScore(project, maxValues);
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

/**
 * 计算 AI 质量评分
 * 基于可用的项目元数据进行多维度评估
 *
 * @param {object} project - 项目对象
 * @returns {number} AI 质量评分 (0-100)
 */
function calculateAIQualityScore(project) {
  // 1. 代码质量代理 (20%) — license, not archived, has_discussions, size
  const licenseScore = (() => {
    const permissive = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'];
    if (permissive.includes(project.license_spdx)) return 1.0;
    if (project.license_spdx?.startsWith('GPL') || project.license_spdx?.startsWith('AGPL')) return 0.7;
    if (project.license_spdx) return 0.5;
    return 0.2;
  })();
  const codeQuality = (
    0.35 * licenseScore +
    0.25 * (project.archived ? 0 : 1) +
    0.20 * (project.has_discussions ? 1 : 0) +
    0.20 * Math.min(1, (project.size_kb || 0) / 50000)
  ) * 100;

  // 2. 文档完整度代理 (15%) — readme_summary, has_wiki, topics count
  const hasReadme = project.readme_summary ? 1 : 0;
  const topicRichness = Math.min(1, (project.topics?.length || 0) / 5);
  const docScore = (
    0.40 * hasReadme +
    0.30 * (project.has_wiki ? 1 : 0) +
    0.30 * topicRichness
  ) * 100;

  // 3. 社区健康度代理 (15%) — contributors, forks ratio, discussions
  const contributorDiversity = (() => {
    const c = project.contributors_count || 0;
    if (c <= 1) return 0.3;
    if (c <= 5) return 0.6;
    if (c <= 20) return 0.8;
    return 1.0;
  })();
  const forkRatio = project.stargazers_count > 0
    ? Math.min(1, (project.forks_count / project.stargazers_count) * 5)
    : 0;
  const communityScore = (
    0.40 * contributorDiversity +
    0.30 * forkRatio +
    0.30 * (project.has_discussions ? 1 : 0)
  ) * 100;

  // 4. 项目活跃度 (15%) — pushed_at freshness
  const daysSincePush = (Date.now() - new Date(project.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
  const activityScore = freshnessDecay(daysSincePush) * 100;

  // 5. 创新性代理 (15%) — AI-related topics, unique language, trending velocity
  const aiTopics = ['llm', 'ai', 'machine-learning', 'deep-learning', 'nlp', 'gpt',
    'transformer', 'neural-network', 'rag', 'agent', 'ai-agent', 'generative-ai',
    'langchain', 'openai', 'diffusion', 'fine-tuning', 'vector-database', 'embedding'];
  const topicMatches = (project.topics || []).filter(t =>
    aiTopics.some(at => t.toLowerCase().includes(at))
  ).length;
  const aiRelevance = Math.min(1, topicMatches / 3);
  const todayStars = project.trending_history?.[0]?.stars_gained || 0;
  const velocitySignal = Math.min(1, todayStars / 500);
  const innovationScore = (
    0.50 * aiRelevance +
    0.30 * velocitySignal +
    0.20 * (project.homepage ? 1 : 0)
  ) * 100;

  // 6. 实用性代理 (10%) — stars as popularity signal, not too many open issues
  const starSignal = logNormalize(project.stargazers_count) / 100;
  const issueRatio = project.stargazers_count > 0
    ? Math.max(0, 1 - (project.open_issues_count || 0) / project.stargazers_count)
    : 0.5;
  const practicalityScore = (
    0.60 * starSignal +
    0.40 * issueRatio
  ) * 100;

  // 7. 生态适配性代理 (10%) — forks, watchers relative to stars
  const watcherSignal = Math.min(1, (project.watchers_count || 0) / 500);
  const forkSignal = logNormalize(project.forks_count) / 100;
  const ecosystemScore = (
    0.50 * forkSignal +
    0.50 * watcherSignal
  ) * 100;

  // 加权求和
  const totalScore = (
    0.20 * codeQuality +
    0.15 * docScore +
    0.15 * communityScore +
    0.15 * activityScore +
    0.15 * innovationScore +
    0.10 * practicalityScore +
    0.10 * ecosystemScore
  );

  return Math.round(Math.max(0, Math.min(100, totalScore)));
}

function main() {
  console.log('[Score] Calculating scores...');

  const projects = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));

  // 计算所有项目的 AI 质量评分
  for (const project of projects) {
    project.ai_quality_score = calculateAIQualityScore(project);
  }

  // 先遍历所有项目计算各 trending 指标的实际最大值
  const maxValues = computeTrendingMaxValues(projects);

  // 计算每个项目的 trending_score
  for (const project of projects) {
    project.trending_score = calculateTrendingScore(project, maxValues);
    project.comprehensive_rank = 0;
  }

  // 按综合分数降序排序
  projects.sort((a, b) => calculateComprehensiveScore(b, maxValues) - calculateComprehensiveScore(a, maxValues));

  // 更新排名（1-based）
  projects.forEach((project, index) => {
    project.comprehensive_rank = index + 1;
  });

  writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2));
  console.log(`[Score] Updated ${projects.length} projects`);
}

main();
