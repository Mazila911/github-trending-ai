export function formatStars(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

export function normalizeSummaryMarkdown(raw: string): string {
  let text = raw.trim();

  // Normalize section headers: "## 【xxx】" or "###【xxx】" -> "#### 【xxx】"
  text = text.replace(/^#{1,4}\s*(【[^】]+】)/gm, '#### $1');

  // Plain "【xxx】" without any # prefix -> "#### 【xxx】"
  text = text.replace(/^(【[^】]+】)/gm, '#### $1');

  // Ensure blank line before each section header for consistent spacing
  text = text.replace(/([^\n])\n(#### 【)/g, '$1\n\n$2');

  // Remove duplicate blank lines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, '\n\n');

  return text;
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    Python: '#3572A5',
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'Jupyter Notebook': '#DA5B0B',
    Kotlin: '#A97BFF',
    Swift: '#F05138',
    Ruby: '#701516',
  };
  return colors[language] || '#8b949e';
}
