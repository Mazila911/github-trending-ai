import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_FILE = resolve(ROOT, 'src/data/projects.json');
const EXPIRY_DAYS = 90;

function main() {
  console.log('[Cleanup] Starting...');

  const projects = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const now = new Date();

  const filtered = projects.filter((project) => {
    // 明星项目永久保留
    if (project.ai_quality_score >= 75 && project.stargazers_count >= 500) {
      return true;
    }

    // 当前在 trending 中的项目保留（1 天内）
    const lastTrending = new Date(project.last_trending_date);
    const daysSinceTrending = (now - lastTrending) / (1000 * 60 * 60 * 24);

    if (daysSinceTrending <= 1) {
      return true;
    }

    // 超过 90 天未 trending 的项目删除
    return daysSinceTrending <= EXPIRY_DAYS;
  });

  const removed = projects.length - filtered.length;
  writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  console.log(`[Cleanup] Removed ${removed} expired projects, ${filtered.length} remaining`);
}

main();
