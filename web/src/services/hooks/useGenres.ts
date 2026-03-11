"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../api/endpoints";
import type { Language, Genre } from "../types";
import * as api from "../functions/genres";

export function useLanguages(): UseQueryResult<Language[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.LANGUAGES,
    queryFn: api.fetchLanguages,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useTVGenres(): UseQueryResult<Genre[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TV_GENRES,
    queryFn: api.fetchTVGenres,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useMovieGenres(): UseQueryResult<Genre[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.MOVIE_GENRES,
    queryFn: api.fetchMovieGenres,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
