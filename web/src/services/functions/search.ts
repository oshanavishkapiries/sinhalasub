import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../endpoints';
import type { Content, SearchParams, PaginatedResponse } from '../types';

export async function searchContent({ query }: SearchParams): Promise<Content[]> {
  if (!query.trim()) {
    return [];
  }

  const data = await fetchAPI<PaginatedResponse<Content>>(
    ENDPOINTS.SEARCH_MULTI,
    { query }
  );

  return data.results.filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );
}
