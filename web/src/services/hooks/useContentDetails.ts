"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../api/endpoints";
import type {
  Content,
  ContentDetailsParams,
  SimilarContentParams,
} from "../types";
import * as api from "../functions/details";

export function useContentDetails(
  params: ContentDetailsParams,
): UseQueryResult<Content, Error> {
  const queryKey =
    params.type === "movie"
      ? QUERY_KEYS.MOVIE_DETAILS(params.id)
      : QUERY_KEYS.TV_DETAILS(params.id);

  return useQuery({
    queryKey,
    queryFn: () => api.fetchContentDetails(params),
    enabled: !!params.id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSimilarContent(
  params: SimilarContentParams,
): UseQueryResult<Content[], Error> {
  const queryKey =
    params.type === "movie"
      ? QUERY_KEYS.SIMILAR_MOVIES(params.id)
      : QUERY_KEYS.SIMILAR_TV(params.id);

  return useQuery({
    queryKey,
    queryFn: () => api.fetchSimilarContent(params),
    enabled: !!params.id,
    staleTime: 1000 * 60 * 10,
  });
}
