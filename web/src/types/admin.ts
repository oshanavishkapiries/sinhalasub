/**
 * Admin Dashboard Types & Interfaces
 */

import { UserRole } from './auth';

/**
 * Admin User Type (for admin dashboard)
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'banned';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

/**
 * Admin Users Request/Response
 */
export interface GetUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'banned';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
}

export interface GetUsersResponse {
  success: boolean;
  data?: {
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive' | 'banned';
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
