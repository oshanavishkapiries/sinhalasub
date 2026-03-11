/**
 * API Types - Response structures from the API
 * Re-exports existing types from @/types for consistency
 */

export type { Content, Genre, TVSeason, Episode } from '@/types';

export interface Language {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * API Request Parameters
 */

export interface DiscoverParams {
  category: string;
  genres: number[];
  language: string;
}

export interface SearchParams {
  query: string;
}

export interface ContentDetailsParams {
  id: string;
  type: 'movie' | 'tv';
}

export interface SimilarContentParams {
  id: string;
  type: 'movie' | 'tv';
}

export interface TVSeasonParams {
  tvId: number;
  seasonNumber: number;
}
