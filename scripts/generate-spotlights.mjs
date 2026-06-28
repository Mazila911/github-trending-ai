import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PROJECTS_FILE = resolve(ROOT, 'src/data/projects.json');
const OUTPUT_FILE = resolve(ROOT, 'src/data/spotlights.json');

const MAX_PROJECTS_PER_SPOTLIGHT = 50;
const MIN_QUALITY_SCORE = 60;
const MIN_STARS = 100;
const MAX_INACTIVE_DAYS = 180;

/** 预设专题定义 */
const SPOTLIGHT_DEFINITIONS = [
  {
    slug: 'llm-frameworks',
    title: 'LLM Frameworks',
    title_zh: 'LLM 框架与工具',
    description: 'Popular frameworks for building LLM-powered applications',
    description_zh: '构建 LLM 驱动应用的热门框架',
    icon: '🤖',
    category: 'frameworks',
    keywords: ['llm', 'langchain', 'llamaindex', 'vllm'],
  },
  {
    slug: 'rag-tools',
    title: 'RAG & Knowledge Base',
    title_zh: 'RAG 与知识库',
    description: 'Tools for retrieval-augmented generation and knowledge management',
    description_zh: '检索增强生成与知识管理工具',
    icon: '📚',
    category: 'data',
    keywords: ['rag', 'vector-database', 'embeddings'],
  },
  {
    slug: 'ai-agents',
    title: 'AI Agents',
    title_zh: 'AI Agent',
    description: 'Frameworks and tools for building autonomous AI agents',
    description_zh: '构建自主 AI 智能体的框架与工具',
    icon: '🕹️',
    category: 'agents',
    keywords: ['ai-agent', 'agent', 'autonomous'],
  },
  {
    slug: 'code-gen',
    title: 'Code Generation',
    title_zh: '代码生成与辅助',
    description: 'AI-powered code generation and development tools',
    description_zh: 'AI 驱动的代码生成与开发工具',
    icon: '💻',
    category: 'tools',
    keywords: ['code-generation', 'copilot'],
  },
  {
    slug: 'multimodal',
    title: 'Multimodal AI',
    title_zh: '多模态 AI',
    description: 'Models and tools for processing multiple data modalities',
    description_zh: '处理多种数据模态的模型与工具',
    icon: '🎨',
    category: 'models',
    keywords: ['multimodal', 'image-generation'],
  },
  {
    slug: 'training',
    title: 'Model Training',
    title_zh: '模型训练与微调',
    description: 'Tools for fine-tuning and training ML models',
    description_zh: '模型微调与训练工具',
    icon: '🏋️',
    category: 'training',
    keywords: ['fine-tuning', 'training', 'lora'],
  },
  {
    slug: 'infra',
    title: 'AI Infrastructure',
    title_zh: 'AI 基础设施',
    description: 'Infrastructure for deploying and serving AI models',
    description_zh: 'AI 模型部署与服务基础设施',
    icon: '⚡',
    category: 'infra',
    keywords: ['inference', 'serving', 'mlops'],
  },
  {
    slug: 'data-tools',
    title: 'Data Processing',
    title_zh: '数据处理与分析',
    description: 'Tools for data processing, ETL, and analytics',
    description_zh: '数据处理、ETL 和分析工具',
    icon: '📊',
    category: 'data',
    keywords: ['etl', 'data-pipeline'],
  },
];

function main() {
  console.log('[Spotlights] Starting generation...');

  const projects = JSON.parse(readFileSync(PROJECTS_FILE, 'utf-8'));
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_INACTIVE_DAYS * 24 * 60 * 60 * 1000);

  const spotlights = SPOTLIGHT_DEFINITIONS.map((def) => {
    const matched = projects
      .filter((project) => {
        // 基本过滤条件
        if (project.archived) return false;
        if (project.ai_quality_score < MIN_QUALITY_SCORE) return false;
        if (project.stargazers_count < MIN_STARS) return false;

        // pushed_at 必须在 180 天内
        const pushedAt = new Date(project.pushed_at);
        if (pushedAt < cutoffDate) return false;

        // topics 关键词匹配（不区分大小写）
        const topics = (project.topics || []).map((t) => t.toLowerCase());
        return def.keywords.some((keyword) => topics.includes(keyword.toLowerCase()));
      })
      .sort((a, b) => b.ai_quality_score - a.ai_quality_score)
      .slice(0, MAX_PROJECTS_PER_SPOTLIGHT);

    return {
      slug: def.slug,
      title: def.title,
      title_zh: def.title_zh,
      description: def.description,
      description_zh: def.description_zh,
      icon: def.icon,
      category: def.category,
      project_ids: matched.map((p) => p.id),
      project_count: matched.length,
      updated_at: now.toISOString(),
    };
  });

  writeFileSync(OUTPUT_FILE, JSON.stringify(spotlights, null, 2));
  console.log(`[Spotlights] Generated ${spotlights.length} spotlights`);
  spotlights.forEach((s) => {
    console.log(`  - ${s.slug}: ${s.project_count} projects`);
  });
}

main();
