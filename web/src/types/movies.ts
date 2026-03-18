/**
 * Movie API Types & Interfaces
 * Used for movie creation, updates, and management endpoints
 */

import { ApiResponse } from './admin';

/**
 * Movie Creation Request - Basic movie info
 */
export interface CreateMovieRequest {
  title: string;
  slug: string;
  poster_url: string;
  rating: number;
  release_date: string;
  overview: string;
}

/**
 * Bulk Create Movies Request
 */
export interface BulkCreateMoviesRequest {
  movies: CreateMovieRequest[];
}

/**
 * Movie Details - Extended information
 */
export interface CreateUpdateMovieDetailRequest {
  overview: string;
  director: string;
  language: string;
  country: string;
  duration: number;
  imdb_id: string;
  tmdb_id: number;
  backdrop_url: string;
  trailer_url: string;
  adult: boolean;
}

/**
 * Cast Member Request
 */
export interface AddCastRequest {
  actor_name: string;
  character_name: string;
  actor_image_url: string;
  tmdb_id?: number;
}

/**
 * Bulk Add Cast Request
 */
export interface BulkAddCastRequest {
  cast: AddCastRequest[];
}

/**
 * Category/Genre Request
 */
export interface AddCategoryRequest {
  category_id: number;
  category_name: string;
}

/**
 * Bulk Add Categories Request
 */
export interface BulkAddCategoriesRequest {
  categories: AddCategoryRequest[];
}

/**
 * Player Provider (Streaming) Request
 */
export interface AddPlayerProviderRequest {
  player_provider: string;
  player_provider_url: string;
  player_provider_type: string;
  video_quality: string;
  is_default: boolean;
  is_ads_available: boolean;
}

/**
 * Bulk Add Player Providers Request
 */
export interface BulkAddPlayerProvidersRequest {
  providers: AddPlayerProviderRequest[];
}

/**
 * Download Option Request
 */
export interface AddDownloadOptionRequest {
  download_option: string;
  download_option_type: string;
  download_option_url: string;
  video_quality: string;
  file_size: string;
}

/**
 * Bulk Add Download Options Request
 */
export interface BulkAddDownloadOptionsRequest {
  downloads: AddDownloadOptionRequest[];
}

/**
 * Subtitle Request
 */
export interface AddSubtitleRequest {
  language: string;
  subtitle_url: string;
  subtitle_author: string;
}

/**
 * Bulk Add Subtitles Request
 */
export interface BulkAddSubtitlesRequest {
  subtitles: AddSubtitleRequest[];
}

/**
 * Movie Response - Created movie with ID
 */
export interface MovieResponse {
  id: number;
  title: string;
  slug: string;
  poster_url: string;
  rating: number;
  release_date: string;
  overview: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Generic Movie Operation Response
 */
export type MovieOperationResponse = ApiResponse<{
  id?: number;
  movie_id?: number;
  [key: string]: any;
}>;

/**
 * Creation workflow state
 */
export interface MovieCreationStep {
  step: number;
  total: number;
  name: string;
  status: 'idle' | 'pending' | 'success' | 'error';
  message?: string;
  error?: string;
}

/**
 * Movie creation workflow context
 */
export interface MovieCreationWorkflow {
  currentStep: number;
  steps: MovieCreationStep[];
  movieId: number | null;
  isComplete: boolean;
  hasError: boolean;
}
