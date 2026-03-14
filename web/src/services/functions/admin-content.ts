import { AxiosError } from 'axios';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  AdminContent,
  ApiResponse,
  BulkDeleteRequest,
  CreateContentRequest,
  GetContentRequest,
  GetContentResponse,
  PublishContentRequest,
  UpdateContentRequest,
} from '../types';

/**
 * Get all content with filters
 */
export async function getContent(params: GetContentRequest): Promise<GetContentResponse> {
  try {
    const response = await apiClient.get<GetContentResponse>(ENDPOINTS.ADMIN_CONTENT, { params });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<GetContentResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to fetch content',
      }
    );
  }
}

/**
 * Get single content
 */
export async function getContentById(contentId: string): Promise<ApiResponse<{ content: AdminContent }>> {
  try {
    const response = await apiClient.get<ApiResponse<{ content: AdminContent }>>(ENDPOINTS.ADMIN_CONTENT_BY_ID(contentId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ content: AdminContent }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to fetch content',
      }
    );
  }
}

/**
 * Create new content
 */
export async function createContent(data: CreateContentRequest): Promise<ApiResponse<{ content: AdminContent }>> {
  try {
    const response = await apiClient.post<ApiResponse<{ content: AdminContent }>>(ENDPOINTS.ADMIN_CONTENT, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ content: AdminContent }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to create content',
      }
    );
  }
}

/**
 * Update content
 */
export async function updateContent(
  contentId: string,
  data: UpdateContentRequest,
): Promise<ApiResponse<{ content: AdminContent }>> {
  try {
    const response = await apiClient.put<ApiResponse<{ content: AdminContent }>>(
      ENDPOINTS.ADMIN_CONTENT_BY_ID(contentId),
      data,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ content: AdminContent }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to update content',
      }
    );
  }
}

/**
 * Delete content
 */
export async function deleteContent(contentId: string): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.ADMIN_CONTENT_BY_ID(contentId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to delete content',
      }
    );
  }
}

/**
 * Publish/Unpublish content
 */
export async function publishContent(
  contentId: string,
  data: PublishContentRequest,
): Promise<ApiResponse<{ content: AdminContent }>> {
  try {
    const response = await apiClient.patch<ApiResponse<{ content: AdminContent }>>(
      ENDPOINTS.ADMIN_CONTENT_PUBLISH(contentId),
      data,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ content: AdminContent }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to publish content',
      }
    );
  }
}

/**
 * Bulk delete content
 */
export async function bulkDeleteContent(data: BulkDeleteRequest): Promise<ApiResponse<{ deletedCount: number }>> {
  try {
    const response = await apiClient.post<ApiResponse<{ deletedCount: number }>>(ENDPOINTS.ADMIN_CONTENT_BULK_DELETE, data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ deletedCount: number }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to bulk delete content',
      }
    );
  }
}

export default {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  bulkDeleteContent,
};

