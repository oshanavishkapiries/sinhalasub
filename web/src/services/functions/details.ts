import { fetchAPI } from './client';
import { ENDPOINTS } from '../endpoints';
import type { Content, ContentDetailsParams, SimilarContentParams, PaginatedResponse } from '../types';

export async function fetchContentDetails({ id, type }: ContentDetailsParams): Promise<Content> {
  const endpoint = type === 'movie'
    ? ENDPOINTS.MOVIE_DETAILS(id)
    : ENDPOINTS.TV_DETAILS(id);

  const data = await fetchAPI<Content>(endpoint);
  return { ...data, media_type: type };
}

export async function fetchSimilarContent({ id, type }: SimilarContentParams): Promise<Content[]> {
  const endpoint = type === 'movie'
    ? ENDPOINTS.SIMILAR_MOVIES(id)
    : ENDPOINTS.SIMILAR_TV(id);

  const data = await fetchAPI<PaginatedResponse<Content>>(endpoint);
  return data.results.map((item) => ({ ...item, media_type: type }));
}
