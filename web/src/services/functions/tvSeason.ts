import { fetchAPI } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { TVSeason, TVSeasonParams } from '../types';

export async function fetchTVSeason({ tvId, seasonNumber }: TVSeasonParams): Promise<TVSeason> {
  return fetchAPI<TVSeason>(ENDPOINTS.TV_SEASON(tvId, seasonNumber));
}
