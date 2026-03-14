export type { Content, Genre, TVSeason, Episode } from '@/types';
export type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SignupRequest,
  User,
  VerifyRequest,
} from '@/types/auth';
export type {
  AdminContent,
  AdminUser,
  ApiResponse,
  BulkDeleteRequest,
  CreateContentRequest,
  CreateUserRequest,
  GetContentRequest,
  GetContentResponse,
  GetUsersRequest,
  GetUsersResponse,
  PublishContentRequest,
  UpdateContentRequest,
  UpdateUserRequest,
  UsersMeta,
} from '@/types/admin';

export interface Language {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export * from './params';
