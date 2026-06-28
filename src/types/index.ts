export interface Project {
  id: number;
  full_name: string;
  name: string;
  owner_login: string;
  owner_avatar_url: string;
  owner_type: 'User' | 'Organization';
  description: string;
  description_zh?: string;
  html_url: string;
  homepage?: string;

  language?: string;
  languages_breakdown?: Record<string, number>;
  topics?: string[];
  license_spdx?: string;
  default_branch: string;

  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  contributors_count?: number;
  size_kb: number;

  archived: boolean;
  is_fork: boolean;
  has_wiki: boolean;
  has_discussions: boolean;

  readme_summary?: string;
  ai_quality_score: number;
  ai_tags?: string[];

  trending_score: number;
  comprehensive_rank: number;
  star_velocity_7d: number;
  star_velocity_30d: number;

  first_seen_at: string;
  last_trending_date: string;
  trending_history: TrendingRecord[];

  created_at: string;
  updated_at: string;
  pushed_at: string;
  crawled_at: string;
}

export interface TrendingRecord {
  date: string;
  rank: number;
  category: string;
  period: string;
  stars_gained: number;
}

export interface TrendingData {
  last_updated: string;
  period: string;
  projects: TrendingEntry[];
}

export interface TrendingEntry {
  project_id: number;
  rank: number;
  stars_gained: number;
  category: string;
}

export interface Spotlight {
  slug: string;
  title: string;
  title_zh: string;
  description: string;
  description_zh: string;
  icon: string;
  category: string;
  project_ids: number[];
  project_count: number;
  updated_at: string;
}
