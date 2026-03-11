'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../endpoints';
import type { Content, DiscoverParams } from '../types';
import * as api from '../api/discover';

export function useDiscoverTV(
  params: DiscoverParams
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.DISCOVER_TV(params.category, params.genres, params.language),
    queryFn: () => api.fetchDiscoverTV(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDiscoverMovies(
  params: DiscoverParams
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.DISCOVER_MOVIES(params.category, params.genres, params.language),
    queryFn: () => api.fetchDiscoverMovies(params),
    staleTime: 1000 * 60 * 5,
  });
}
