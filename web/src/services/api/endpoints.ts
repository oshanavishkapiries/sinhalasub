/**
 * API Endpoints Registry
 * Centralized location for all API endpoint definitions
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ORIGIN_URL = BASE_URL?.replace(/\/api\/?$/, '');

export const API_CONFIG = {
  BASE_URL,
  ORIGIN_URL,
};

export const ENDPOINTS = {
  // Configuration
  LANGUAGES: '/configuration/languages',
  
  // Genres
  TV_GENRES: '/genre/tv/list',
  MOVIE_GENRES: '/genre/movie/list',
  
  // Trending
  TRENDING: '/trending/all/week',
  
  // Popular
  POPULAR_MOVIES: '/movie/popular',
  POPULAR_TV: '/tv/popular',
  
  // Top Rated
  TOP_RATED_MOVIES: '/movie/top_rated',
  TOP_RATED_TV: '/tv/top_rated',
  
  // Now Playing
  NOW_PLAYING: '/movie/now_playing',
  
  // Details
  MOVIE_DETAILS: (id: string | number) => `/movie/${id}`,
  TV_DETAILS: (id: string | number) => `/tv/${id}`,
  
  // Similar
  SIMILAR_MOVIES: (id: string | number) => `/movie/${id}/similar`,
  SIMILAR_TV: (id: string | number) => `/tv/${id}/similar`,
  
  // Search
  SEARCH_MULTI: '/search/multi',
  
  // Discover
  DISCOVER_MOVIES: (category: string) => `/movie/${category}`,
  DISCOVER_TV: '/discover/tv',
  DISCOVER_TV_CATEGORY: (category: string) => `/tv/${category}`,
  
  // TV Seasons
  TV_SEASON: (tvId: number, seasonNumber: number) => `/tv/${tvId}/season/${seasonNumber}`,

  // Auth (cookie-based)
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_VERIFY: '/auth/verify',
  AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_FORGOT_PASSWORD_REQUEST: '/auth/forgot-password/request',
  AUTH_FORGOT_PASSWORD_RESET: '/auth/forgot-password',

  // Admin content (under `/api`)
  ADMIN_CONTENT: '/admin/content',
  ADMIN_CONTENT_BY_ID: (id: string) => `/admin/content/${id}`,
  ADMIN_CONTENT_PUBLISH: (id: string) => `/admin/content/${id}/publish`,
  ADMIN_CONTENT_BULK_DELETE: '/admin/content/bulk-delete',
};

/**
 * Endpoints that live outside `/api` on the backend.
 * (`NEXT_PUBLIC_API_URL` is usually `http://host:port/api`, so we also expose the origin.)
 */
export const ORIGIN_ENDPOINTS = {
  USERS: '/users/',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_ROLE: (id: string) => `/users/${id}/role`,
};

/**
 * Query Keys for TanStack Query
 * Used for caching and invalidation
 */
export const QUERY_KEYS = {
  LANGUAGES: ['languages'] as const,
  TV_GENRES: ['genres', 'tv'] as const,
  MOVIE_GENRES: ['genres', 'movie'] as const,
  TRENDING: ['content', 'trending'] as const,
  POPULAR_MOVIES: ['content', 'movies', 'popular'] as const,
  POPULAR_TV: ['content', 'tv', 'popular'] as const,
  TOP_RATED_MOVIES: ['content', 'movies', 'top-rated'] as const,
  TOP_RATED_TV: ['content', 'tv', 'top-rated'] as const,
  NOW_PLAYING: ['content', 'movies', 'now-playing'] as const,
  MOVIE_DETAILS: (id: string) => ['content', 'movie', id] as const,
  TV_DETAILS: (id: string) => ['content', 'tv', id] as const,
  SIMILAR_MOVIES: (id: string) => ['content', 'movie', id, 'similar'] as const,
  SIMILAR_TV: (id: string) => ['content', 'tv', id, 'similar'] as const,
  SEARCH: (query: string) => ['search', query] as const,
  DISCOVER_MOVIES: (category: string, genres: number[], language: string) => 
    ['discover', 'movies', category, genres.join(','), language] as const,
  DISCOVER_TV: (category: string, genres: number[], language: string) => 
    ['discover', 'tv', category, genres.join(','), language] as const,
  TV_SEASON: (tvId: number, seasonNumber: number) => 
    ['content', 'tv', tvId, 'season', seasonNumber] as const,
};
