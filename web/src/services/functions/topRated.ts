import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Content, PaginatedResponse } from '../types';

export async function fetchTopRated(): Promise<Content[]> {
  try {
    const [movies, tv] = await Promise.all([
      fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_MOVIES),
      fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_TV),
    ]);

    return [
      ...movies.results.map((m) => ({ ...m, media_type: 'movie' as const, category: 'top-rated' as const })),
      ...tv.results.map((t) => ({ ...t, media_type: 'tv' as const, category: 'top-rated' as const })),
    ];
  } catch (error) {
    console.error('Failed to fetch top-rated content:', error);
    return [];
  }
}
