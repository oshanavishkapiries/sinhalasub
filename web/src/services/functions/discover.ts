import { fetchAPI } from './client';
import { ENDPOINTS } from '../endpoints';
import type { Content, DiscoverParams, PaginatedResponse } from '../types';

export async function fetchDiscoverTV({ category, genres, language }: DiscoverParams): Promise<Content[]> {
  const params: Record<string, string> = {
    with_genres: genres.join(','),
    with_original_language: language,
  };

  const endpoint = category === 'popular' || category === 'top_rated'
    ? ENDPOINTS.DISCOVER_TV_CATEGORY(category)
    : ENDPOINTS.DISCOVER_TV;

  if (category === 'on_the_air') {
    params.on_the_air = 'true';
  }

  const data = await fetchAPI<PaginatedResponse<Content>>(endpoint, params);
  return data.results.map((item) => ({ ...item, media_type: 'tv' as const }));
}

export async function fetchDiscoverMovies({ category, genres, language }: DiscoverParams): Promise<Content[]> {
  const params: Record<string, string> = {
    with_genres: genres.join(','),
    with_original_language: language,
  };

  const data = await fetchAPI<PaginatedResponse<Content>>(
    ENDPOINTS.DISCOVER_MOVIES(category),
    params
  );

  return data.results.map((item) => ({ ...item, media_type: 'movie' as const }));
}
