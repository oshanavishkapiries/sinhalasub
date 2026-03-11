import axios from 'axios';
import { API_CONFIG } from '../endpoints';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  params: {
    ...(API_CONFIG.TMDB_API_KEY && !API_CONFIG.MOCK_MODE
      ? { api_key: API_CONFIG.TMDB_API_KEY }
      : {}),
  },
});

export async function fetchAPI<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const response = await apiClient.get<T>(endpoint, { params });
  return response.data;
}
