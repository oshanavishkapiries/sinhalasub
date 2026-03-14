import axios, { AxiosError } from 'axios';
import { API_CONFIG } from './endpoints';

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const originClient = axios.create({
  baseURL: API_CONFIG.ORIGIN_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchAPI<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  try {
    const response = await apiClient.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const message =
        axiosError.response?.data?.message || axiosError.message || 'API request failed';
      console.error(`API Error [${endpoint}]:`, message);
      throw new Error(`Failed to fetch from ${endpoint}: ${message}`);
    }
    throw error;
  }
}
