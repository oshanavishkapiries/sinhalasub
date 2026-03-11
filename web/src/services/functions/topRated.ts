import { fetchAPI } from './client';
import { ENDPOINTS } from '../endpoints';
import type { Content, PaginatedResponse } from '../types';

export async function fetchTopRated(): Promise<Content[]> {
  const [movies, tv] = await Promise.all([
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_MOVIES),
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_TV),
  ]);

  return [
    ...movies.results.map((m) => ({ ...m, media_type: 'movie' as const, category: 'top-rated' as const })),
    ...tv.results.map((t) => ({ ...t, media_type: 'tv' as const, category: 'top-rated' as const })),
  ];
}
