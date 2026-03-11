/**
 * API Client Functions
 * Centralized functions for making API requests
 */

import { API_CONFIG, ENDPOINTS } from '../endpoints';
import type {
  Language,
  Genre,
  Content,
  TVSeason,
  PaginatedResponse,
  DiscoverParams,
  SearchParams,
  ContentDetailsParams,
  SimilarContentParams,
  TVSeasonParams,
} from '../types';

/**
 * Base fetch function with error handling
 */
async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  // Add API key for non-mock mode (real TMDB API)
  if (!API_CONFIG.MOCK_MODE && API_CONFIG.TMDB_API_KEY) {
    url.searchParams.append('api_key', API_CONFIG.TMDB_API_KEY);
  }
  
  // Add other params
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText} for endpoint ${endpoint}`);
  }

  return response.json();
}

/**
 * Fetch available languages
 */
export async function fetchLanguages(): Promise<Language[]> {
  return fetchAPI<Language[]>(ENDPOINTS.LANGUAGES);
}

/**
 * Fetch TV genres
 */
export async function fetchTVGenres(): Promise<Genre[]> {
  const data = await fetchAPI<{ genres: Genre[] }>(ENDPOINTS.TV_GENRES);
  return data.genres;
}

/**
 * Fetch movie genres
 */
export async function fetchMovieGenres(): Promise<Genre[]> {
  const data = await fetchAPI<{ genres: Genre[] }>(ENDPOINTS.MOVIE_GENRES);
  return data.genres;
}

/**
 * Fetch trending content
 */
export async function fetchTrending(): Promise<Content[]> {
  const data = await fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TRENDING);
  return data.results.map((item) => ({ ...item, category: 'trending' }));
}

/**
 * Fetch popular content (movies + TV)
 */
export async function fetchPopular(): Promise<Content[]> {
  const [movies, tv] = await Promise.all([
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.POPULAR_MOVIES),
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.POPULAR_TV),
  ]);

  return [
    ...movies.results.map((m) => ({ ...m, media_type: 'movie' as const, category: 'popular' as const })),
    ...tv.results.map((t) => ({ ...t, media_type: 'tv' as const, category: 'popular' as const })),
  ];
}

/**
 * Fetch top rated content (movies + TV)
 */
export async function fetchTopRated(): Promise<Content[]> {
  const [movies, tv] = await Promise.all([
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_MOVIES),
    fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.TOP_RATED_TV),
  ]);

  return [
    ...movies.results.map((m) => ({ ...m, media_type: 'movie' as const, category: 'top-rated' as const })),
    ...tv.results.map((t) => ({ ...t, media_type: 'tv' as const, category: 'top-rated' as const })),
  ];
}

/**
 * Fetch now playing movies
 */
export async function fetchNowPlaying(): Promise<Content[]> {
  const data = await fetchAPI<PaginatedResponse<Content>>(ENDPOINTS.NOW_PLAYING);
  return data.results.map((item) => ({ 
    ...item, 
    media_type: 'movie' as const, 
    category: 'continue-watching' as const 
  }));
}

/**
 * Fetch content details
 */
export async function fetchContentDetails({ id, type }: ContentDetailsParams): Promise<Content> {
  const endpoint = type === 'movie' 
    ? ENDPOINTS.MOVIE_DETAILS(id)
    : ENDPOINTS.TV_DETAILS(id);
  
  const data = await fetchAPI<Content>(endpoint);
  return { ...data, media_type: type };
}

/**
 * Search content
 */
export async function searchContent({ query }: SearchParams): Promise<Content[]> {
  if (!query.trim()) {
    return [];
  }
  
  const data = await fetchAPI<PaginatedResponse<Content>>(
    ENDPOINTS.SEARCH_MULTI,
    { query }
  );
  
  return data.results.filter(
    (item) => item.media_type === 'movie' || item.media_type === 'tv'
  );
}

/**
 * Fetch similar content
 */
export async function fetchSimilarContent({ id, type }: SimilarContentParams): Promise<Content[]> {
  const endpoint = type === 'movie'
    ? ENDPOINTS.SIMILAR_MOVIES(id)
    : ENDPOINTS.SIMILAR_TV(id);
  
  const data = await fetchAPI<PaginatedResponse<Content>>(endpoint);
  return data.results.map((item) => ({ ...item, media_type: type }));
}

/**
 * Fetch TV season details
 */
export async function fetchTVSeason({ tvId, seasonNumber }: TVSeasonParams): Promise<TVSeason> {
  return fetchAPI<TVSeason>(ENDPOINTS.TV_SEASON(tvId, seasonNumber));
}

/**
 * Discover TV shows
 */
export async function fetchDiscoverTV({ category, genres, language }: DiscoverParams): Promise<Content[]> {
  const params: Record<string, string> = {
    with_genres: genres.join(','),
    with_original_language: language,
  };

  const endpoint = category === 'popular' || category === 'top_rated'
    ? ENDPOINTS.DISCOVER_TV_CATEGORY(category)
    : ENDPOINTS.DISCOVER_TV;

  if (category === 'on_the_air') {
    params.on_the_air = 'true';
  }

  const data = await fetchAPI<PaginatedResponse<Content>>(endpoint, params);
  return data.results.map((item) => ({ ...item, media_type: 'tv' as const }));
}

/**
 * Discover movies
 */
export async function fetchDiscoverMovies({ category, genres, language }: DiscoverParams): Promise<Content[]> {
  const params: Record<string, string> = {
    with_genres: genres.join(','),
    with_original_language: language,
  };

  const data = await fetchAPI<PaginatedResponse<Content>>(
    ENDPOINTS.DISCOVER_MOVIES(category),
    params
  );
  
  return data.results.map((item) => ({ ...item, media_type: 'movie' as const }));
}
