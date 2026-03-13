import axios from "axios";
import { API_CONFIG } from "./endpoints";

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
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
      const message =
        error.response?.data?.message || error.message || "API request failed";
      console.error(`API Error [${endpoint}]:`, message);
      throw new Error(`Failed to fetch from ${endpoint}: ${message}`);
    }
    throw error;
  }
}
