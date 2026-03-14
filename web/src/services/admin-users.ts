import axios, { AxiosError } from 'axios';
import {
  AdminUser,
  BulkDeleteRequest,
  CreateUserRequest,
  GetUsersRequest,
  GetUsersResponse,
  UpdateUserRequest,
  UsersMeta,
} from '@/types/admin';

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

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(
  /\/api\/?$/,
  ''
);

const client = axios.create({
  baseURL: API_ORIGIN,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const toError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }
  const data = error.response?.data as any;
  return data?.message || fallback;
};

export const getUsers = async (params: GetUsersRequest): Promise<GetUsersResponse> => {
  try {
    const response = await client.get<BackendResponse<BackendUsersListData>>('/users/', {
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
    return { success: false, message: 'Failed to fetch users', error: toError(error, 'Failed to fetch users') };
  }
};

export const getUser = async (userId: string): Promise<BackendResponse<AdminUser>> => {
  try {
    const response = await client.get<BackendResponse<any>>(`/users/${userId}`);
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
        error: toError(error, 'Failed to fetch user'),
      }
    );
  }
};

export const changeUserRole = async (
  userId: string,
  role: 'platform-user' | 'moderator'
): Promise<BackendResponse<AdminUser>> => {
  try {
    const response = await client.patch<BackendResponse<any>>(`/users/${userId}/role`, { role });
    if (!response.data.success || !response.data.data) return response.data as any;
    return { ...response.data, data: normalizeUser(response.data.data) };
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to update role',
        error: toError(error, 'Failed to update role'),
      }
    );
  }
};

export const createUser = async (
  data: CreateUserRequest
): Promise<BackendResponse<AdminUser>> => {
  try {
    const response = await client.post<BackendResponse<any>>('/users/', {
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
        error: toError(error, 'Failed to create user'),
      }
    );
  }
};

export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<BackendResponse<AdminUser>> => {
  try {
    const response = await client.put<BackendResponse<any>>(`/users/${userId}`, {
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
        error: toError(error, 'Failed to update user'),
      }
    );
  }
};

export const deleteUser = async (userId: string): Promise<BackendResponse<{ deleted: boolean }>> => {
  try {
    const response = await client.delete<BackendResponse<{ deleted: boolean }>>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    return (
      (axiosError.response?.data as any) || {
        success: false,
        message: 'Failed to delete user',
        error: toError(error, 'Failed to delete user'),
      }
    );
  }
};

export const bulkDeleteUsers = async (data: BulkDeleteRequest) => {
  const results = await Promise.allSettled(data.ids.map((id) => deleteUser(id)));
  const deletedCount = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
  const failedCount = results.length - deletedCount;
  return { deletedCount, failedCount };
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  bulkDeleteUsers,
};
