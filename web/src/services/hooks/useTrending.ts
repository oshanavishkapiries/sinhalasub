"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../api/endpoints";
import type { Content } from "../../types";
import * as api from "../functions/trending";

export function useTrending(): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.TRENDING,
    queryFn: api.fetchTrending,
    staleTime: 1000 * 60 * 5,
  });
}
