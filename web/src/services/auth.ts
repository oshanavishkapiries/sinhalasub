import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  ResendVerificationRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
  SignupRequest,
  User,
  VerifyRequest,
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const toErrorResponse = <T extends { success: boolean; message?: string; error?: string }>(
  axiosError: AxiosError<T>,
  fallbackMessage: string
): T => {
  return (
    axiosError.response?.data || ({
      success: false,
      message: fallbackMessage,
      error: 'UNKNOWN_ERROR',
    } as T)
  );
};

const normalizeUser = (rawUser: any): User => {
  const username = rawUser?.username || rawUser?.name || '';
  return {
    id: String(rawUser?.id || ''),
    username,
    name: rawUser?.name || username,
    email: rawUser?.email || '',
    role: rawUser?.role || 'platform-user',
    avatar: rawUser?.avatar || '',
    isActive: Boolean(rawUser?.is_active ?? rawUser?.isActive ?? true),
    isVerified: Boolean(rawUser?.is_verified ?? rawUser?.isVerified ?? false),
    createdAt: rawUser?.created_at || rawUser?.createdAt || '',
    updatedAt: rawUser?.updated_at || rawUser?.updatedAt || '',
    lastLoginAt: rawUser?.last_login_at || rawUser?.lastLoginAt || undefined,
  };
};

const normalizeAuthResponse = (responseData: AuthResponse): AuthResponse => {
  if (!responseData?.data?.user) {
    return responseData;
  }

  return {
    ...responseData,
    data: {
      ...responseData.data,
      user: normalizeUser(responseData.data.user),
    },
  };
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const payload: LoginRequest = { email, password };
  try {
    const response = await authClient.post<AuthResponse>('/auth/login', payload);
    return normalizeAuthResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Login failed');
  }
};

export const signupUser = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const payload: SignupRequest = { username, email, password };
  try {
    const response = await authClient.post<AuthResponse>('/auth/signup', payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Signup failed');
  }
};

export const verifyAccount = async (
  email: string,
  verificationCode: string
): Promise<AuthResponse> => {
  const payload: VerifyRequest = { email, verificationCode };
  try {
    const response = await authClient.post<AuthResponse>('/auth/verify', {
      email: payload.email,
      verification_code: payload.verificationCode,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Verification failed');
  }
};

export const resendVerificationCode = async (email: string): Promise<AuthResponse> => {
  const payload: ResendVerificationRequest = { email };
  try {
    const response = await authClient.post<AuthResponse>('/auth/resend-verification', payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to resend verification code');
  }
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  try {
    const response = await authClient.get<AuthResponse>('/auth/me');
    return normalizeAuthResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to fetch user');
  }
};

export const refreshToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const response = await authClient.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<RefreshTokenResponse>;
    return toErrorResponse(axiosError, 'Token refresh failed');
  }
};

export const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
  const payload: ForgotPasswordRequest = { email };
  try {
    const response = await authClient.post<AuthResponse>('/auth/forgot-password/request', payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to request password reset');
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string,
  verificationCode: string
): Promise<AuthResponse> => {
  const payload: ResetPasswordRequest = { email, newPassword, verificationCode };
  try {
    const response = await authClient.post<AuthResponse>('/auth/forgot-password', {
      email: payload.email,
      new_password: payload.newPassword,
      verification_code: payload.verificationCode,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to reset password');
  }
};

export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    const response = await authClient.post<{ success: boolean }>('/auth/logout');
    return response.data;
  } catch (error) {
    return { success: true };
  }
};

export default {
  loginUser,
  signupUser,
  verifyAccount,
  resendVerificationCode,
  getCurrentUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  logoutUser,
};
