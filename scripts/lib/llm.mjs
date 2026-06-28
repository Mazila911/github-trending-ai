/**
 * 通用 LLM 调用模块
 * 支持任何 OpenAI 兼容接口（OpenAI、DeepSeek、Claude 兼容层等）
 */

const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepseek.com';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-v4-flash';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 调用 LLM API
 * @param {string} prompt - 用户 prompt
 * @param {object} [options] - 可选配置
 * @param {number} [options.temperature=0.3] - 温度
 * @param {boolean} [options.jsonMode=false] - 是否要求 JSON 输出
 * @param {number} [options.maxTokens=512] - 最大输出 token
 * @returns {Promise<string|null>} LLM 返回的文本内容，失败返回 null
 */
export async function callLLM(prompt, options = {}) {
  if (!LLM_API_KEY) return null;

  const { temperature = 0.3, jsonMode = false, maxTokens = 512 } = options;
  const url = `${LLM_API_URL.replace(/\/$/, '')}/v1/chat/completions`;

  const body = {
    model: LLM_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
        console.warn(`[LLM] Rate limited, waiting ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        retries--;
        continue;
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error(`[LLM] API error: ${response.status} ${text.slice(0, 200)}`);
        retries--;
        await sleep(500);
        continue;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('[LLM] Request timeout (30s)');
      } else {
        console.error(`[LLM] Request failed: ${err.message}`);
      }
      retries--;
      if (retries > 0) {
        await sleep(500);
      }
    }
  }

  return null;
}

/**
 * 批量调用 LLM（带并发控制）
 * @param {Array<{id: any, prompt: string}>} tasks - 任务数组
 * @param {number} [concurrency=5] - 最大并发数
 * @param {object} [options] - callLLM 选项
 * @returns {Promise<Map<any, string|null>>} id -> result 的映射
 */
export async function batchCallLLM(tasks, concurrency = 5, options = {}) {
  if (!LLM_API_KEY) return new Map();

  const results = new Map();
  const queue = [...tasks];

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      const result = await callLLM(task.prompt, options);
      results.set(task.id, result);
      await sleep(500);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

/**
 * 检查 LLM 是否可用
 * @returns {boolean}
 */
export function isLLMAvailable() {
  return !!LLM_API_KEY;
}

/**
 * 获取 LLM 配置信息
 * @returns {{url: string, model: string, hasKey: boolean}}
 */
export function getLLMConfig() {
  return { url: LLM_API_URL, model: LLM_MODEL, hasKey: !!LLM_API_KEY };
}
