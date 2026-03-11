"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../api/endpoints";
import type { Content } from "../../types";
import * as api from "../functions/nowPlaying";

export function useNowPlaying(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.NOW_PLAYING,
    queryFn: api.fetchNowPlaying,
    staleTime: 1000 * 60 * 5,
  });
}
