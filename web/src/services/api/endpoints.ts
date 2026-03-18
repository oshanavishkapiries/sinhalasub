/**
 * API Endpoints Registry
 * Centralized location for all API endpoint definitions
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_CONFIG = {
  BASE_URL,
};

export const ENDPOINTS = {

  // Health check
  HEALTH_CHECK: '/health',

  // Auth (cookie-based)
  AUTH_LOGIN: '/v1/auth/login',
  AUTH_SIGNUP: '/v1/auth/signup',
  AUTH_VERIFY: '/v1/auth/verify',
  AUTH_RESEND_VERIFICATION: '/v1/auth/resend-verification',
  AUTH_ME: '/v1/auth/me',
  AUTH_REFRESH: '/v1/auth/refresh',
  AUTH_LOGOUT: '/v1/auth/logout',
  AUTH_FORGOT_PASSWORD_REQUEST: '/v1/auth/forgot-password/request',
  AUTH_FORGOT_PASSWORD_RESET: '/v1/auth/forgot-password',

  // Users (under `/api`)
  USERS: '/v1/users/',
  USER_BY_ID: (id: string) => `/v1/users/${id}`,
  USER_ROLE: (id: string) => `/v1/users/${id}/role`,

  // Admin Content
  ADMIN_CONTENT: '/admin/content',
  ADMIN_CONTENT_BY_ID: (id: string) => `/admin/content/${id}`,
  ADMIN_CONTENT_PUBLISH: (id: string) => `/admin/content/${id}/publish`,
  ADMIN_CONTENT_BULK_DELETE: '/admin/content/bulk-delete',

  // Movies
  MOVIES: '/v1/movies',
  MOVIES_CREATE: '/v1/movies',
  MOVIES_BULK_CREATE: '/v1/movies/bulk',
  
  // Movie Details
  MOVIE_DETAILS: (movieId: number) => `/v1/movies/${movieId}/details`,
  
  // Movie Cast
  MOVIE_CAST: (movieId: number) => `/v1/movies/${movieId}/cast`,
  MOVIE_CAST_BULK: (movieId: number) => `/v1/movies/${movieId}/cast/bulk`,
  
  // Movie Categories
  MOVIE_CATEGORIES: (movieId: number) => `/v1/movies/${movieId}/categories`,
  MOVIE_CATEGORIES_BULK: (movieId: number) => `/v1/movies/${movieId}/categories/bulk`,
  
  // Movie Players/Streaming
  MOVIE_PLAYERS: (movieId: number) => `/v1/movies/${movieId}/players`,
  MOVIE_PLAYERS_BULK: (movieId: number) => `/v1/movies/${movieId}/players/bulk`,
  
  // Movie Subtitles
  MOVIE_SUBTITLES: (movieId: number) => `/v1/movies/${movieId}/subtitles`,
  MOVIE_SUBTITLES_BULK: (movieId: number) => `/v1/movies/${movieId}/subtitles/bulk`,
  
  // Movie Downloads
  MOVIE_DOWNLOADS: (movieId: number) => `/v1/movies/${movieId}/downloads`,
  MOVIE_DOWNLOADS_BULK: (movieId: number) => `/v1/movies/${movieId}/downloads/bulk`,
};

/**
 * Query Keys for TanStack Query
 * Used for caching and invalidation
 */
export const QUERY_KEYS = {
  // Auth/admin
  AUTH_ME: ['auth', 'me'] as const,
  ADMIN_USERS: (params: Record<string, unknown>) => ['admin', 'users', params] as const,
  ADMIN_CONTENT: (params: Record<string, unknown>) => ['admin', 'content', params] as const,
};
