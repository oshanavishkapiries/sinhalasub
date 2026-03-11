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

export * from './params';
