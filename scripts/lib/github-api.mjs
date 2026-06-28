/**
 * GitHub API 速率限制处理工具
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带速率限制处理的 GitHub API 请求
 * @param {string} url - API URL
 * @param {string} token - GitHub Token
 * @returns {Promise<Response>}
 */
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
      await sleep(waitTime);
    }

    if (response.status === 403 || response.status === 429) {
      const waitTime = Math.max(0, (resetTime * 1000) - Date.now()) + 1000;
      console.log(`[API] Rate limited, waiting ${waitTime}ms`);
      await sleep(waitTime);
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
