'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../api/endpoints';
import * as api from '../functions/admin-users';
import type {
  AdminUser,
  CreateUserRequest,
  GetUsersRequest,
  UpdateUserRequest,
  UsersMeta,
} from '../types';

type UsersListData = { items: AdminUser[]; meta: UsersMeta };

export function useAdminUsersQuery(params: GetUsersRequest) {
  return useQuery<UsersListData, Error>({
    queryKey: QUERY_KEYS.ADMIN_USERS(params as Record<string, unknown>),
    queryFn: async () => {
      const resp = await api.getUsers(params);
      if (!resp.success || !resp.data) {
        throw new Error(resp.message || 'Failed to fetch users');
      }
      return resp.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 15,
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, Error, CreateUserRequest>({
    mutationFn: async (data) => {
      const resp = await api.createUser(data);
      if (!resp.success || !resp.data) throw new Error(resp.message || 'Failed to create user');
      return resp.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, Error, { userId: string; data: UpdateUserRequest }>({
    mutationFn: async ({ userId, data }) => {
      const resp = await api.updateUser(userId, data);
      if (!resp.success || !resp.data) throw new Error(resp.message || 'Failed to update user');
      return resp.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ deleted: boolean }, Error, { userId: string }>({
    mutationFn: async ({ userId }) => {
      const resp = await api.deleteUser(userId);
      if (!resp.success) throw new Error(resp.message || 'Failed to delete user');
      return resp.data ?? { deleted: true };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useChangeAdminUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation<AdminUser, Error, { userId: string; role: 'platform-user' | 'moderator' }>({
    mutationFn: async ({ userId, role }) => {
      const resp = await api.changeUserRole(userId, role);
      if (!resp.success || !resp.data) throw new Error(resp.message || 'Failed to update role');
      return resp.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useBulkDeleteAdminUsersMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ deletedCount: number; failedCount: number }, Error, { ids: string[] }>({
    mutationFn: async ({ ids }) => {
      return api.bulkDeleteUsers({ ids });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
