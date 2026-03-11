'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../endpoints';
import type { TVSeason, TVSeasonParams } from '../types';
import * as api from '../api/tvSeason';

export function useTVSeason(
  params: TVSeasonParams
): UseQueryResult<TVSeason, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TV_SEASON(params.tvId, params.seasonNumber),
    queryFn: () => api.fetchTVSeason(params),
    enabled: !!params.tvId && !!params.seasonNumber,
    staleTime: 1000 * 60 * 10,
  });
}
