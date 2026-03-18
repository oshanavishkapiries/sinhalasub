/**
 * Movie API Functions
 * All movie-related API calls (Create, Update, Add metadata)
 */

import { AxiosError } from 'axios';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  AddCastRequest,
  AddCategoryRequest,
  AddDownloadOptionRequest,
  AddPlayerProviderRequest,
  AddSubtitleRequest,
  BulkAddCastRequest,
  BulkAddCategoriesRequest,
  BulkAddDownloadOptionsRequest,
  BulkAddPlayerProvidersRequest,
  BulkAddSubtitlesRequest,
  BulkCreateMoviesRequest,
  CreateMovieRequest,
  CreateUpdateMovieDetailRequest,
  MovieOperationResponse,
  MovieResponse,
} from '@/types/movies';

/**
 * Create a single movie
 */
export async function createMovie(data: CreateMovieRequest): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIES_CREATE,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to create movie',
    };
  }
}

/**
 * Create multiple movies in bulk
 */
export async function bulkCreateMovies(data: BulkCreateMoviesRequest): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIES_BULK_CREATE,
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to bulk create movies',
    };
  }
}

/**
 * Create or update movie details
 */
export async function createUpdateMovieDetails(
  movieId: number,
  data: CreateUpdateMovieDetailRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.put<MovieOperationResponse>(
      ENDPOINTS.MOVIE_DETAILS(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to create/update movie details',
    };
  }
}

/**
 * Add single cast member to movie
 */
export async function addCastMember(
  movieId: number,
  data: AddCastRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_CAST(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add cast member',
    };
  }
}

/**
 * Add multiple cast members to movie
 */
export async function bulkAddCast(
  movieId: number,
  data: BulkAddCastRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_CAST_BULK(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add cast members',
    };
  }
}

/**
 * Add single category to movie
 */
export async function addCategory(
  movieId: number,
  data: AddCategoryRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_CATEGORIES(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add category',
    };
  }
}

/**
 * Add multiple categories to movie
 */
export async function bulkAddCategories(
  movieId: number,
  data: BulkAddCategoriesRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_CATEGORIES_BULK(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add categories',
    };
  }
}

/**
 * Add single player provider to movie
 */
export async function addPlayerProvider(
  movieId: number,
  data: AddPlayerProviderRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_PLAYERS(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add player provider',
    };
  }
}

/**
 * Add multiple player providers to movie
 */
export async function bulkAddPlayerProviders(
  movieId: number,
  data: BulkAddPlayerProvidersRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_PLAYERS_BULK(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add player providers',
    };
  }
}

/**
 * Add single subtitle to movie
 */
export async function addSubtitle(
  movieId: number,
  data: AddSubtitleRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_SUBTITLES(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add subtitle',
    };
  }
}

/**
 * Add multiple subtitles to movie
 */
export async function bulkAddSubtitles(
  movieId: number,
  data: BulkAddSubtitlesRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_SUBTITLES_BULK(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add subtitles',
    };
  }
}

/**
 * Add single download option to movie
 */
export async function addDownloadOption(
  movieId: number,
  data: AddDownloadOptionRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_DOWNLOADS(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add download option',
    };
  }
}

/**
 * Add multiple download options to movie
 */
export async function bulkAddDownloadOptions(
  movieId: number,
  data: BulkAddDownloadOptionsRequest
): Promise<MovieOperationResponse> {
  try {
    const response = await apiClient.post<MovieOperationResponse>(
      ENDPOINTS.MOVIE_DOWNLOADS_BULK(movieId),
      data
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<MovieOperationResponse>;
    return {
      success: false,
      error: axiosError.response?.data?.error || 'Failed to add download options',
    };
  }
}

export default {
  createMovie,
  bulkCreateMovies,
  createUpdateMovieDetails,
  addCastMember,
  bulkAddCast,
  addCategory,
  bulkAddCategories,
  addPlayerProvider,
  bulkAddPlayerProviders,
  addSubtitle,
  bulkAddSubtitles,
  addDownloadOption,
  bulkAddDownloadOptions,
};
