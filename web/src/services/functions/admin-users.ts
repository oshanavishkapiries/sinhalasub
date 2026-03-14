import axios, { AxiosError } from 'axios';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  AdminUser,
  BulkDeleteRequest,
  CreateUserRequest,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UsersMeta,
} from '../types';

type BackendResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

type BackendUsersMeta = {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

type BackendUsersListData = {
  items: any[];
  meta: BackendUsersMeta;
};

const normalizeUser = (raw: any): AdminUser => {
  return {
    id: String(raw?.id || ''),
    username: raw?.username || '',
    email: raw?.email || '',
    role: raw?.role || '',
    avatar: raw?.avatar || '',
    isVerified: Boolean(raw?.is_verified),
    isActive: Boolean(raw?.is_active),
    createdAt: raw?.created_at || '',
    updatedAt: raw?.updated_at || '',
    lastLoginAt: raw?.last_login_at || undefined,
  };
};

const normalizeMeta = (raw: BackendUsersMeta): UsersMeta => {
  return {
    page: raw.page,
    perPage: raw.per_page,
    totalItems: raw.total_items,
    totalPages: raw.total_pages,
    hasNext: raw.has_next,
    hasPrev: raw.has_prev,
  };
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }
  const data = error.response?.data as any;
  return data?.message || fallback;
};

export async function getUsers(params: GetUsersRequest): Promise<GetUsersResponse> {
  try {
    const response = await apiClient.get<BackendResponse<BackendUsersListData>>(ENDPOINTS.USERS, {
      params: {
        page: params.page,
        per_page: params.perPage,
        sort_by: params.sortBy,
        sort_order: params.sortOrder,
        search: params.search,
        role: params.role,
        is_active: params.isActive,
        is_verified: params.isVerified,
      },
    });

    if (!response.data.success || !response.data.data) {
      return {
        success: false,
        message: response.data.message || 'Failed to fetch users',
        error: typeof response.data.error === 'string' ? response.data.error : undefined,
      };
    }

    return {
      success: true,
      message: response.data.message,
      data: {
        items: response.data.data.items.map(normalizeUser),
        meta: normalizeMeta(response.data.data.meta),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to fetch users',
      error: toErrorMessage(error, 'Failed to fetch users'),
    };
  }
}

export async function getUser(userId: string): Promise<BackendResponse<AdminUser>> {
  try {
    const response = await apiClient.get<BackendResponse<any>>(ENDPOINTS.USER_BY_ID(userId));
    if (!response.data.success || !response.data.data) {
      return response.data as any;
    }
    return {
      ...response.data,
      data: normalizeUser(response.data.data),
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to fetch user',
        error: toErrorMessage(error, 'Failed to fetch user'),
      }
    );
  }
}

export async function changeUserRole(
  userId: string,
  role: 'platform-user' | 'moderator',
): Promise<BackendResponse<AdminUser>> {
  try {
    const response = await apiClient.patch<BackendResponse<any>>(ENDPOINTS.USER_ROLE(userId), { role });
    if (!response.data.success || !response.data.data) return response.data as any;
    return { ...response.data, data: normalizeUser(response.data.data) };
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to update role',
        error: toErrorMessage(error, 'Failed to update role'),
      }
    );
  }
}

export async function createUser(data: CreateUserRequest): Promise<BackendResponse<AdminUser>> {
  try {
    const response = await apiClient.post<BackendResponse<any>>(ENDPOINTS.USERS, {
      username: data.username,
      email: data.email,
      password: data.password,
    });

    if (!response.data.success || !response.data.data) return response.data as any;

    let user = normalizeUser(response.data.data);

    if (data.role && data.role !== 'platform-user') {
      const roleResp = await changeUserRole(user.id, data.role);
      if (roleResp.success && roleResp.data) {
        user = roleResp.data;
      }
    }

    return { ...response.data, data: user };
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to create user',
        error: toErrorMessage(error, 'Failed to create user'),
      }
    );
  }
}

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<BackendResponse<AdminUser>> {
  try {
    const response = await apiClient.put<BackendResponse<any>>(ENDPOINTS.USER_BY_ID(userId), {
      username: data.username,
      email: data.email,
      avatar: data.avatar,
    });

    if (!response.data.success || !response.data.data) return response.data as any;

    let user = normalizeUser(response.data.data);

    if (data.role) {
      const roleResp = await changeUserRole(userId, data.role);
      if (roleResp.success && roleResp.data) {
        user = roleResp.data;
      }
    }

    return { ...response.data, data: user };
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to update user',
        error: toErrorMessage(error, 'Failed to update user'),
      }
    );
  }
}

export async function deleteUser(userId: string): Promise<BackendResponse<{ deleted: boolean }>> {
  try {
    const response = await apiClient.delete<BackendResponse<{ deleted: boolean }>>(ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to delete user',
        error: toErrorMessage(error, 'Failed to delete user'),
      }
    );
  }
}

export async function bulkDeleteUsers(data: BulkDeleteRequest) {
  const results = await Promise.allSettled(data.ids.map((id) => deleteUser(id)));
  const deletedCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failedCount = results.length - deletedCount;
  return { deletedCount, failedCount };
}

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  bulkDeleteUsers,
};
