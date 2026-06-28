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
    keywords: ['llm', 'langchain', 'llamaindex', 'vllm', 'llms', 'gpt', 'chatgpt', 'openai', 'nlp', 'transformers'],
    descriptionPatterns: ['llm', 'large language model', 'language model', 'gpt', 'chatbot'],
  },
  {
    slug: 'rag-tools',
    title: 'RAG & Knowledge Base',
    title_zh: 'RAG 与知识库',
    description: 'Tools for retrieval-augmented generation and knowledge management',
    description_zh: '检索增强生成与知识管理工具',
    icon: '📚',
    category: 'data',
    keywords: ['rag', 'vector-database', 'embeddings', 'vector-search', 'vector-store', 'embedding-database', 'embedding-store', 'similarity-search', 'neural-search', 'search-engine', 'vector-search-engine', 'hnsw', 'faiss', 'knowledge-base', 'knowledge-graph'],
    descriptionPatterns: ['vector', 'embedding', 'retrieval', 'semantic search', 'knowledge base'],
  },
  {
    slug: 'ai-agents',
    title: 'AI Agents',
    title_zh: 'AI Agent',
    description: 'Frameworks and tools for building autonomous AI agents',
    description_zh: '构建自主 AI 智能体的框架与工具',
    icon: '🕹️',
    category: 'agents',
    keywords: ['ai-agent', 'agent', 'autonomous', 'ai-agents', 'agents', 'multi-agent', 'orchestration', 'mcp'],
    descriptionPatterns: ['agent', 'autonomous', 'orchestrat'],
  },
  {
    slug: 'code-gen',
    title: 'Code Generation',
    title_zh: '代码生成与辅助',
    description: 'AI-powered code generation and development tools',
    description_zh: 'AI 驱动的代码生成与开发工具',
    icon: '💻',
    category: 'tools',
    keywords: ['code-generation', 'copilot', 'ide', 'vscode', 'dev-tools', 'developer-tools', 'devtools', 'linter', 'typechecker', 'lsp-server'],
    descriptionPatterns: ['code generation', 'code assist', 'developer tool', 'coding', 'IDE', 'development environment'],
  },
  {
    slug: 'multimodal',
    title: 'Multimodal AI',
    title_zh: '多模态 AI',
    description: 'Models and tools for processing multiple data modalities',
    description_zh: '处理多种数据模态的模型与工具',
    icon: '🎨',
    category: 'models',
    keywords: ['multimodal', 'image-generation', 'stable-diffusion', 'diffusion', 'computer-vision', 'image2image', 'text2image', 'txt2img', 'img2img', 'whisper', 'gradio', 'ai-art', 'generative-art', 'inpainting', 'upscaling'],
    descriptionPatterns: ['image generat', 'diffusion', 'multimodal', 'computer vision', 'text-to-image', 'image-to-image', 'speech', 'visual'],
  },
  {
    slug: 'training',
    title: 'Model Training',
    title_zh: '模型训练与微调',
    description: 'Tools for fine-tuning and training ML models',
    description_zh: '模型微调与训练工具',
    icon: '🏋️',
    category: 'training',
    keywords: ['fine-tuning', 'training', 'lora', 'pytorch', 'tensorflow', 'cuda', 'mixed-precision-training', 'quantization', 'pruning', 'autodiff', 'tensor', 'deep-learning', 'neural-network', 'machine-learning'],
    descriptionPatterns: ['fine-tun', 'train', 'model', 'neural', 'deep learning', 'machine learning', 'pytorch', 'tensorflow'],
  },
  {
    slug: 'infra',
    title: 'AI Infrastructure',
    title_zh: 'AI 基础设施',
    description: 'Infrastructure for deploying and serving AI models',
    description_zh: 'AI 模型部署与服务基础设施',
    icon: '⚡',
    category: 'infra',
    keywords: ['inference', 'serving', 'mlops', 'kubernetes', 'docker', 'cloud-native', 'distributed', 'monitoring', 'observability', 'opentelemetry', 'prometheus', 'grafana'],
    descriptionPatterns: ['inference', 'serving', 'deploy', 'mlops', 'model serving', 'orchestrat'],
  },
  {
    slug: 'data-tools',
    title: 'Data Processing',
    title_zh: '数据处理与分析',
    description: 'Tools for data processing, ETL, and analytics',
    description_zh: '数据处理、ETL 和分析工具',
    icon: '📊',
    category: 'data',
    keywords: ['etl', 'data-pipeline', 'data-pipelines', 'data-processing', 'data-engineering', 'data-analytics', 'data-analysis', 'data-science', 'dataframe', 'polars', 'apache-arrow', 'duckdb', 'bigdata', 'stream-processing', 'batch-processing', 'data-warehouse', 'data-lake', 'analytics', 'business-intelligence'],
    descriptionPatterns: ['data process', 'data pipelin', 'ETL', 'analytics', 'data warehouse', 'data lake', 'dataframe'],
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
        const topicMatch = def.keywords.some((keyword) => topics.includes(keyword.toLowerCase()));
        if (topicMatch) return true;

        // ai_tags 匹配
        const aiTags = (project.ai_tags || []).map((t) => t.toLowerCase());
        const aiTagMatch = def.keywords.some((keyword) => aiTags.includes(keyword.toLowerCase()));
        if (aiTagMatch) return true;

        // 描述模式匹配（不区分大小写）
        if (def.descriptionPatterns) {
          const desc = `${project.description || ''} ${project.description_zh || ''} ${project.name || ''}`.toLowerCase();
          const descMatch = def.descriptionPatterns.some((pattern) => desc.includes(pattern.toLowerCase()));
          if (descMatch) return true;
        }

        return false;
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
