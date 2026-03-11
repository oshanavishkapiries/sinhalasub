import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { Content, PaginatedResponse } from '../types';

export async function fetchTrending(): Promise<Content[]> {
  try {
    const data = await fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TRENDING);
    return data.results.map((item) => ({ ...item, category: 'trending' }));
  } catch (error) {
    console.error('Failed to fetch trending content:', error);
    return [];
  }
}
