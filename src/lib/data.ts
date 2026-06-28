import type { Project, TrendingData, Spotlight } from '../types/index';
import projectsData from '../data/projects.json';
import trendingData from '../data/trending.json';
import spotlightsData from '../data/spotlights.json';

export function getProjects(): Project[] {
  return projectsData as Project[];
}

export function getTrendingProjects(): TrendingData {
  return trendingData as TrendingData;
}

export function getSpotlights(): Spotlight[] {
  return spotlightsData as Spotlight[];
}

export function getProjectById(id: number): Project | undefined {
  return (projectsData as Project[]).find(p => p.id === id);
}

export function getProjectByFullName(owner: string, name: string): Project | undefined {
  return (projectsData as Project[]).find(
    p => p.owner_login === owner && p.name === name
  );
}

export function getTopTrendingProjects(limit: number = 5): Project[] {
  const projects = projectsData as Project[];
  return [...projects]
    .sort((a, b) => a.comprehensive_rank - b.comprehensive_rank)
    .slice(0, limit);
}

export function getProjectsBySpotlight(slug: string): Project[] {
  const spotlights = spotlightsData as Spotlight[];
  const spotlight = spotlights.find(s => s.slug === slug);
  if (!spotlight) return [];
  const projects = projectsData as Project[];
  return spotlight.project_ids
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean) as Project[];
}
