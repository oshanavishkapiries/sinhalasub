import axios, { AxiosError } from 'axios';
import {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance for auth requests
const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await authClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        message: 'Login failed',
        error: 'UNKNOWN_ERROR',
      }
    );
  }
};

/**
 * Sign up new user
 */
export const signupUser = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  try {
    const response = await authClient.post<AuthResponse>('/auth/signup', {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        message: 'Signup failed',
        error: 'UNKNOWN_ERROR',
      }
    );
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await authClient.get<AuthResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        message: 'Failed to fetch user',
        error: 'UNKNOWN_ERROR',
      }
    );
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  try {
    const response = await authClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      {
        refreshToken,
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<RefreshTokenResponse>;
    return (
      axiosError.response?.data || {
        success: false,
        error: 'UNKNOWN_ERROR',
      }
    );
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    const response = await authClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    // Even if logout fails on server, we can still clear local data
    return { success: true };
  }
};

export default {
  loginUser,
  signupUser,
  getCurrentUser,
  refreshToken,
  logoutUser,
};
