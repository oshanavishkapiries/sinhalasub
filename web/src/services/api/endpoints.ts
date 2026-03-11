/**
 * API Endpoints Registry
 * Centralized location for all API endpoint definitions
 */

// Use mock server in development, real API in production
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3100/api'
  : 'https://api.themoviedb.org/3';

const MOCK_MODE = process.env.NODE_ENV === 'development';

export const API_CONFIG = {
  BASE_URL,
  MOCK_MODE,
  // For real TMDB API (when not using mock)
  TMDB_API_KEY: process.env.NEXT_PUBLIC_TMDB_API_KEY,
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
