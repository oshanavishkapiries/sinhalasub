import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Content, PaginatedResponse } from '../types';

export async function fetchPopular(): Promise<Content[]> {
  try {
    const [movies, tv] = await Promise.all([
      fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.POPULAR_MOVIES),
      fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.POPULAR_TV),
    ]);

    return [
      ...movies.results.map((m) => ({ ...m, media_type: 'movie' as const, category: 'popular' as const })),
      ...tv.results.map((t) => ({ ...t, media_type: 'tv' as const, category: 'popular' as const })),
    ];
  } catch (error) {
    console.error('Failed to fetch popular content:', error);
    return [];
  }
}
