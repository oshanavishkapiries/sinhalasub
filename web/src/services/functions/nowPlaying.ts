import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../endpoints';
import type { Content, PaginatedResponse } from '../types';

export async function fetchNowPlaying(): Promise<Content[]> {
  const data = await fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.NOW_PLAYING);
  return data.results.map((item) => ({
    ...item,
    media_type: 'movie' as const,
    category: 'continue-watching' as const
  }));
}
