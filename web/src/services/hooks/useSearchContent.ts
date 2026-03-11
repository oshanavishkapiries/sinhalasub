"use client";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "../api/endpoints";
import type { Content, SearchParams } from "../types";
import * as api from "../functions/search";

export function useSearchContent(
  params: SearchParams,
): UseQueryResult<Content[], Error> {
  return useQuery({
    queryKey: QUERY_KEYS.SEARCH(params.query),
    queryFn: () => api.searchContent(params),
    enabled: params.query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });
}
