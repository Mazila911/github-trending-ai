import { readFileSync, writeFileSync } from 'fs';
import { callLLM, isLLMAvailable } from './lib/llm.mjs';

const DATA_FILE = 'src/data/projects.json';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPrompt(project) {
  return `你是一位技术文档专家。请根据以下 GitHub 项目信息，生成两个字段：

1. description_zh：一句话中文描述（不超过50字），用于卡片展示
2. readme_summary：结构化深度总结，使用 Markdown 格式，包含以下章节：

- 【主题】一句话说明项目核心定位
- 【核心分点总结】3-5 个关键特性，每条格式为：编号 + **粗体关键词** + 描述，条目之间空一行
- 【行动指南】2-3 条开发者可操作的建议，带编号
- 【金句总述】一句话总结项目价值，令人印象深刻
- 【故事性收尾】一小段生动描写，描绘开发者使用该项目后工作方式的变化

项目信息：
- 名称：${project.full_name}
- 描述：${project.description || '无'}
- 语言：${project.language || '未知'}
- 主题：${(project.topics || []).join(', ') || '无'}
- Star 数：${project.stargazers_count || 0}
- Fork 数：${project.forks_count || 0}

请以 JSON 格式返回，包含 description_zh 和 readme_summary 两个字段。`;
}

async function main() {
  if (!isLLMAvailable()) {
    console.error('错误：LLM 服务不可用，请检查配置');
    process.exit(1);
  }

  const raw = readFileSync(DATA_FILE, 'utf-8');
  const projects = JSON.parse(raw);

  console.log(`共 ${projects.length} 个项目待处理`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    console.log(`[${i + 1}/${projects.length}] 处理: ${project.full_name}`);

    try {
      const prompt = buildPrompt(project);
      const result = await callLLM(prompt, {
        temperature: 0.5,
        maxTokens: 1024,
        jsonMode: true,
      });

      const parsed = JSON.parse(result);
      if (parsed.description_zh) project.description_zh = parsed.description_zh;
      if (parsed.readme_summary) project.readme_summary = parsed.readme_summary;
      updated++;
    } catch (err) {
      failed++;
      console.error(`  失败: ${err.message}`);
    }

    // 每 20 个项目保存一次进度
    if ((i + 1) % 20 === 0) {
      writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
      console.log(`  [进度保存] 已处理 ${i + 1} 个项目`);
    }

    // 请求间隔
    if (i < projects.length - 1) {
      await sleep(500);
    }
  }

  // 最终保存
  writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  console.log(`\n完成！已更新: ${updated}, 失败: ${failed}, 总计: ${projects.length}`);
}

main().catch(console.error);
