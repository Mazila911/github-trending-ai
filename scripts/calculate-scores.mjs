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

function main() {
  console.log('[Score] Calculating scores...');

  const projects = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));

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
