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
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_VERIFY: '/auth/verify',
  AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_FORGOT_PASSWORD_REQUEST: '/auth/forgot-password/request',
  AUTH_FORGOT_PASSWORD_RESET: '/auth/forgot-password',

  // Users (under `/api`)
  USERS: '/users/',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_ROLE: (id: string) => `/users/${id}/role`,

  // Admin Content
  ADMIN_CONTENT: '/admin/content',
  ADMIN_CONTENT_BY_ID: (id: string) => `/admin/content/${id}`,
  ADMIN_CONTENT_PUBLISH: (id: string) => `/admin/content/${id}/publish`,
  ADMIN_CONTENT_BULK_DELETE: '/admin/content/bulk-delete',

  // Movies
  MOVIES: '/movies',
  MOVIES_CREATE: '/movies',
  MOVIES_BULK_CREATE: '/movies/bulk',
  
  // Movie Details
  MOVIE_DETAILS: (movieId: number) => `/movies/${movieId}/details`,
  
  // Movie Cast
  MOVIE_CAST: (movieId: number) => `/movies/${movieId}/cast`,
  MOVIE_CAST_BULK: (movieId: number) => `/movies/${movieId}/cast/bulk`,
  
  // Movie Categories
  MOVIE_CATEGORIES: (movieId: number) => `/movies/${movieId}/categories`,
  MOVIE_CATEGORIES_BULK: (movieId: number) => `/movies/${movieId}/categories/bulk`,
  
  // Movie Players/Streaming
  MOVIE_PLAYERS: (movieId: number) => `/movies/${movieId}/players`,
  MOVIE_PLAYERS_BULK: (movieId: number) => `/movies/${movieId}/players/bulk`,
  
  // Movie Subtitles
  MOVIE_SUBTITLES: (movieId: number) => `/movies/${movieId}/subtitles`,
  MOVIE_SUBTITLES_BULK: (movieId: number) => `/movies/${movieId}/subtitles/bulk`,
  
  // Movie Downloads
  MOVIE_DOWNLOADS: (movieId: number) => `/movies/${movieId}/downloads`,
  MOVIE_DOWNLOADS_BULK: (movieId: number) => `/movies/${movieId}/downloads/bulk`,
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
