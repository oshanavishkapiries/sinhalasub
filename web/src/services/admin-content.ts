import axios, { AxiosError } from 'axios';
import {
  AdminContent,
  GetContentRequest,
  GetContentResponse,
  CreateContentRequest,
  UpdateContentRequest,
  PublishContentRequest,
  BulkDeleteRequest,
  ApiResponse,
} from '@/types/admin';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance for admin requests
const adminClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get all content with filters
 */
export const getContent = async (
  params: GetContentRequest
): Promise<GetContentResponse> => {
  try {
    const response = await adminClient.get<GetContentResponse>('/admin/content', {
      params,
    });
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
};

/**
 * Get single content
 */
export const getContentById = async (
  contentId: string
): Promise<ApiResponse<{ content: AdminContent }>> => {
  try {
    const response = await adminClient.get<ApiResponse<{ content: AdminContent }>>(
      `/admin/content/${contentId}`
    );
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
};

/**
 * Create new content
 */
export const createContent = async (
  data: CreateContentRequest
): Promise<ApiResponse<{ content: AdminContent }>> => {
  try {
    const response = await adminClient.post<ApiResponse<{ content: AdminContent }>>(
      '/admin/content',
      data
    );
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
};

/**
 * Update content
 */
export const updateContent = async (
  contentId: string,
  data: UpdateContentRequest
): Promise<ApiResponse<{ content: AdminContent }>> => {
  try {
    const response = await adminClient.put<ApiResponse<{ content: AdminContent }>>(
      `/admin/content/${contentId}`,
      data
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
};

/**
 * Delete content
 */
export const deleteContent = async (contentId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await adminClient.delete<ApiResponse<null>>(
      `/admin/content/${contentId}`
    );
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
};

/**
 * Publish/Unpublish content
 */
export const publishContent = async (
  contentId: string,
  data: PublishContentRequest
): Promise<ApiResponse<{ content: AdminContent }>> => {
  try {
    const response = await adminClient.patch<ApiResponse<{ content: AdminContent }>>(
      `/admin/content/${contentId}/publish`,
      data
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
};

/**
 * Bulk delete content
 */
export const bulkDeleteContent = async (
  data: BulkDeleteRequest
): Promise<ApiResponse<{ deletedCount: number }>> => {
  try {
    const response = await adminClient.post<ApiResponse<{ deletedCount: number }>>(
      '/admin/content/bulk-delete',
      data
    );
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
};

export default {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  publishContent,
  bulkDeleteContent,
};
