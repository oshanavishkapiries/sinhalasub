/**
 * TanStack Query Hooks
 * Custom hooks for data fetching with caching, loading states, and error handling
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { QUERY_KEYS } from '../endpoints';
import type {
  Language,
  Genre,
  Content,
  TVSeason,
  DiscoverParams,
  SearchParams,
  ContentDetailsParams,
  SimilarContentParams,
  TVSeasonParams,
} from '../types';

import * as api from '../functions';

/**
 * Hook to fetch languages
 */
export function useLanguages(): UseQueryResult<Language[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.LANGUAGES,
    queryFn: api.fetchLanguages,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (languages rarely change)
  });
}

/**
 * Hook to fetch TV genres
 */
export function useTVGenres(): UseQueryResult<Genre[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TV_GENRES,
    queryFn: api.fetchTVGenres,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook to fetch movie genres
 */
export function useMovieGenres(): UseQueryResult<Genre[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.MOVIE_GENRES,
    queryFn: api.fetchMovieGenres,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook to fetch trending content
 */
export function useTrending(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TRENDING,
    queryFn: api.fetchTrending,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch popular content
 */
export function usePopular(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.POPULAR_MOVIES,
    queryFn: api.fetchPopular,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch top rated content
 */
export function useTopRated(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TOP_RATED_MOVIES,
    queryFn: api.fetchTopRated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch now playing movies
 */
export function useNowPlaying(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.NOW_PLAYING,
    queryFn: api.fetchNowPlaying,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch content details
 */
export function useContentDetails(
  params: ContentDetailsParams
): UseQueryResult<Content, Error> {
  const queryKey = params.type === 'movie'
    ? QUERY_KEYS.MOVIE_DETAILS(params.id)
    : QUERY_KEYS.TV_DETAILS(params.id);

  return useQuery({
    queryKey,
    queryFn: () => api.fetchContentDetails(params),
    enabled: !!params.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to search content
 */
export function useSearchContent(
  params: SearchParams
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH(params.query),
    queryFn: () => api.searchContent(params),
    enabled: params.query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch similar content
 */
export function useSimilarContent(
  params: SimilarContentParams
): UseQueryResult<Content[], Error> {
  const queryKey = params.type === 'movie'
    ? QUERY_KEYS.SIMILAR_MOVIES(params.id)
    : QUERY_KEYS.SIMILAR_TV(params.id);

  return useQuery({
    queryKey,
    queryFn: () => api.fetchSimilarContent(params),
    enabled: !!params.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch TV season
 */
export function useTVSeason(
  params: TVSeasonParams
): UseQueryResult<TVSeason, Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TV_SEASON(params.tvId, params.seasonNumber),
    queryFn: () => api.fetchTVSeason(params),
    enabled: !!params.tvId && !!params.seasonNumber,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to discover TV shows
 */
export function useDiscoverTV(
  params: DiscoverParams
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.DISCOVER_TV(params.category, params.genres, params.language),
    queryFn: () => api.fetchDiscoverTV(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to discover movies
 */
export function useDiscoverMovies(
  params: DiscoverParams
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.DISCOVER_MOVIES(params.category, params.genres, params.language),
    queryFn: () => api.fetchDiscoverMovies(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
