/**
 * Admin Dashboard Types & Interfaces
 */

import { UserRole } from './auth';

/**
 * Admin User Type (for admin dashboard)
 */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Admin Users Request/Response
 */
export interface GetUsersRequest {
  page?: number;
  perPage?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: 'created_at' | 'updated_at' | 'username' | 'email' | 'last_login_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  data?: {
    items: AdminUser[];
    meta: UsersMeta;
  };
  error?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'platform-user' | 'moderator';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;
  role?: 'platform-user' | 'moderator';
}

export interface BulkDeleteRequest {
  ids: string[];
}

/**
 * Admin Content Type
 */
export interface AdminContent {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  overview: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate: string;
  genres: string[];
  rating: number;
  views: number;
  status: 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin Content Request/Response
 */
export interface GetContentRequest {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'movie' | 'tv';
  status?: 'published' | 'unpublished';
  startDate?: string;
  endDate?: string;
  sortBy?: 'title' | 'createdAt' | 'rating' | 'views';
  sortOrder?: 'asc' | 'desc';
}

export interface GetContentResponse {
  success: boolean;
  data?: {
    content: AdminContent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface CreateContentRequest {
  title: string;
  type: 'movie' | 'tv';
  overview: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate: string;
  genres: string[];
  rating?: number;
}

export interface UpdateContentRequest {
  title?: string;
  overview?: string;
  genres?: string[];
  releaseDate?: string;
}

export interface PublishContentRequest {
  status: 'published' | 'unpublished';
}

/**
 * Admin Dashboard Statistics
 */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  totalViews: number;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API Response Type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * TV Series Types
 */
export interface StreamProvider {
  id: number;
  name: string;
  has_ads: boolean;
}

export interface DownloadProvider {
  id: number;
  name: string;
}

export interface EpisodeStreamLink {
  id?: number;
  episode_id?: number;
  provider_id: number;
  provider?: StreamProvider;
  stream_url: string;
  player_type: 'iframe' | 'video' | 'custom';
}

export interface EpisodeDownload {
  id?: number;
  episode_id?: number;
  provider_id: number;
  provider?: DownloadProvider;
  quality: '360p' | '480p' | '720p' | '1080p' | '4K';
  file_size: string;
  download_url: string;
}

export interface TVEpisode {
  id?: number;
  season_id?: number;
  episode_number: number;
  title: string;
  overview: string;
  thumbnail: string;
  air_date?: string;
  runtime?: number;
  is_visible: boolean; // Frontend visibility flag
  stream_links: EpisodeStreamLink[];
  downloads: EpisodeDownload[];
}

export interface TVSeason {
  id?: number;
  tv_show_id?: number;
  season_number: number;
  title: string;
  episode_count: number;
  poster: string;
  air_date?: string;
  is_visible: boolean; // Frontend visibility flag
  episodes: TVEpisode[];
}

export interface TVSeries {
  id?: number;
  tmdb_id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline?: string;
  homepage?: string;
  poster_urls: string[]; // Array of 3 poster URLs
  backdrop_urls: string[]; // Array of 3 backdrop URLs
  first_air_date: string;
  last_air_date?: string;
  status: string;
  type: string;
  original_language: string;
  adult: boolean;
  in_production: boolean;
  popularity: number;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  media_type: string;
  trailer_link?: string;
  imdb_id?: string;
  genres: { id: number; name: string }[];
  seasons: TVSeason[];
}
