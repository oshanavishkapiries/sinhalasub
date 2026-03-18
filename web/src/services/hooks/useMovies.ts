'use client';

/**
 * Movie API React Query Hooks
 * Handles all movie-related mutations with proper state management
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../functions/movies';
import type {
  AddCastRequest,
  AddCategoryRequest,
  AddDownloadOptionRequest,
  AddPlayerProviderRequest,
  AddSubtitleRequest,
  BulkAddCastRequest,
  BulkAddCategoriesRequest,
  BulkAddDownloadOptionsRequest,
  BulkAddPlayerProvidersRequest,
  BulkAddSubtitlesRequest,
  BulkCreateMoviesRequest,
  CreateMovieRequest,
  CreateUpdateMovieDetailRequest,
  MovieOperationResponse,
} from '@/types/movies';

/**
 * Hook to create a single movie
 */
export function useCreateMovieMutation() {
  const queryClient = useQueryClient();
  return useMutation<MovieOperationResponse, Error, CreateMovieRequest>({
    mutationFn: async (data) => {
      const resp = await api.createMovie(data);
      if (!resp.success) throw new Error(resp.error || 'Failed to create movie');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
}

/**
 * Hook to bulk create movies
 */
export function useBulkCreateMoviesMutation() {
  const queryClient = useQueryClient();
  return useMutation<MovieOperationResponse, Error, BulkCreateMoviesRequest>({
    mutationFn: async (data) => {
      const resp = await api.bulkCreateMovies(data);
      if (!resp.success) throw new Error(resp.error || 'Failed to bulk create movies');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
}

/**
 * Hook to create/update movie details
 */
export function useCreateUpdateMovieDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: CreateUpdateMovieDetailRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.createUpdateMovieDetails(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to create/update movie details');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
  });
}

/**
 * Hook to add cast member
 */
export function useAddCastMemberMutation() {
  return useMutation<MovieOperationResponse, Error, { movieId: number; data: AddCastRequest }>({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.addCastMember(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add cast member');
      return resp;
    },
  });
}

/**
 * Hook to bulk add cast members
 */
export function useBulkAddCastMutation() {
  return useMutation<MovieOperationResponse, Error, { movieId: number; data: BulkAddCastRequest }>({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.bulkAddCast(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add cast members');
      return resp;
    },
  });
}

/**
 * Hook to add category
 */
export function useAddCategoryMutation() {
  return useMutation<MovieOperationResponse, Error, { movieId: number; data: AddCategoryRequest }>({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.addCategory(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add category');
      return resp;
    },
  });
}

/**
 * Hook to bulk add categories
 */
export function useBulkAddCategoriesMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: BulkAddCategoriesRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.bulkAddCategories(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add categories');
      return resp;
    },
  });
}

/**
 * Hook to add player provider
 */
export function useAddPlayerProviderMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: AddPlayerProviderRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.addPlayerProvider(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add player provider');
      return resp;
    },
  });
}

/**
 * Hook to bulk add player providers
 */
export function useBulkAddPlayerProvidersMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: BulkAddPlayerProvidersRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.bulkAddPlayerProviders(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add player providers');
      return resp;
    },
  });
}

/**
 * Hook to add subtitle
 */
export function useAddSubtitleMutation() {
  return useMutation<MovieOperationResponse, Error, { movieId: number; data: AddSubtitleRequest }>({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.addSubtitle(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add subtitle');
      return resp;
    },
  });
}

/**
 * Hook to bulk add subtitles
 */
export function useBulkAddSubtitlesMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: BulkAddSubtitlesRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.bulkAddSubtitles(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add subtitles');
      return resp;
    },
  });
}

/**
 * Hook to add download option
 */
export function useAddDownloadOptionMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: AddDownloadOptionRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.addDownloadOption(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add download option');
      return resp;
    },
  });
}

/**
 * Hook to bulk add download options
 */
export function useBulkAddDownloadOptionsMutation() {
  return useMutation<
    MovieOperationResponse,
    Error,
    { movieId: number; data: BulkAddDownloadOptionsRequest }
  >({
    mutationFn: async ({ movieId, data }) => {
      const resp = await api.bulkAddDownloadOptions(movieId, data);
      if (!resp.success) throw new Error(resp.error || 'Failed to add download options');
      return resp;
    },
  });
}
