import axios, { AxiosError } from 'axios';
import {
  AdminUser,
  GetUsersRequest,
  GetUsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
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
 * Get all users with filters
 */
export const getUsers = async (
  params: GetUsersRequest
): Promise<GetUsersResponse> => {
  try {
    const response = await adminClient.get<GetUsersResponse>('/admin/users', {
      params,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<GetUsersResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to fetch users',
      }
    );
  }
};

/**
 * Get single user
 */
export const getUser = async (userId: string): Promise<ApiResponse<{ user: AdminUser }>> => {
  try {
    const response = await adminClient.get<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ user: AdminUser }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to fetch user',
      }
    );
  }
};

/**
 * Create new user
 */
export const createUser = async (
  data: CreateUserRequest
): Promise<ApiResponse<{ user: AdminUser }>> => {
  try {
    const response = await adminClient.post<ApiResponse<{ user: AdminUser }>>(
      '/admin/users',
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ user: AdminUser }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to create user',
      }
    );
  }
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<ApiResponse<{ user: AdminUser }>> => {
  try {
    const response = await adminClient.put<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${userId}`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ user: AdminUser }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to update user',
      }
    );
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  try {
    const response = await adminClient.delete<ApiResponse<null>>(
      `/admin/users/${userId}`
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to delete user',
      }
    );
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  userId: string,
  data: UpdateUserStatusRequest
): Promise<ApiResponse<{ user: AdminUser }>> => {
  try {
    const response = await adminClient.patch<ApiResponse<{ user: AdminUser }>>(
      `/admin/users/${userId}/status`,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<{ user: AdminUser }>>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to update user status',
      }
    );
  }
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (
  data: BulkDeleteRequest
): Promise<ApiResponse<{ deletedCount: number; skippedCount: number }>> => {
  try {
    const response = await adminClient.post<
      ApiResponse<{ deletedCount: number; skippedCount: number }>
    >('/admin/users/bulk-delete', data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<
      ApiResponse<{ deletedCount: number; skippedCount: number }>
    >;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'Failed to bulk delete users',
      }
    );
  }
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkDeleteUsers,
};
