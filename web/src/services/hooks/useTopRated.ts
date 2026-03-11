'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../endpoints';
import type { Content } from '../../types';
import * as api from '../api/topRated';

export function useTopRated(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TOP_RATED_MOVIES,
    queryFn: api.fetchTopRated,
    staleTime: 1000 * 60 * 5,
  });
}
