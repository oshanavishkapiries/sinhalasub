'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../api/endpoints';
import * as api from '../functions/admin-content';
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

export function useAdminContentQuery(params: GetContentRequest) {
  return useQuery<GetContentResponse, Error>({
    queryKey: QUERY_KEYS.ADMIN_CONTENT(params as Record<string, unknown>),
    queryFn: async () => {
      const resp = await api.getContent(params);
      if (!resp.success) throw new Error(resp.error || 'Failed to fetch content');
      return resp;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 15,
  });
}

export function useCreateAdminContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ content: AdminContent }>, Error, CreateContentRequest>({
    mutationFn: async (data) => {
      const resp = await api.createContent(data);
      if (!resp.success) throw new Error(resp.error || 'Failed to create content');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}

export function useUpdateAdminContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ content: AdminContent }>, Error, { contentId: string; data: UpdateContentRequest }>({
    mutationFn: async ({ contentId, data }) => {
      const resp = await api.updateContent(contentId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to update content');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}

export function useDeleteAdminContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<null>, Error, { contentId: string }>({
    mutationFn: async ({ contentId }) => {
      const resp = await api.deleteContent(contentId);
      if (!resp.success) throw new Error(resp.error || 'Failed to delete content');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}

export function usePublishAdminContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ content: AdminContent }>, Error, { contentId: string; data: PublishContentRequest }>({
    mutationFn: async ({ contentId, data }) => {
      const resp = await api.publishContent(contentId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to update content status');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}

export function useBulkDeleteAdminContentMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<{ deletedCount: number }>, Error, BulkDeleteRequest>({
    mutationFn: async (data) => {
      const resp = await api.bulkDeleteContent(data);
      if (!resp.success) throw new Error(resp.error || 'Failed to bulk delete content');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'content'] });
    },
  });
}
