'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../endpoints';
import type { Content } from '../../types';
import * as api from '../api/popular';

export function usePopular(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.POPULAR_MOVIES,
    queryFn: api.fetchPopular,
    staleTime: 1000 * 60 * 5,
  });
}
