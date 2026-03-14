import axios, { AxiosError } from 'axios';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SignupRequest,
  User,
  VerifyRequest,
} from '../types';

const toErrorResponse = <T extends { success: boolean; message?: string; error?: string }>(
  axiosError: AxiosError<T>,
  fallbackMessage: string,
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

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const payload: LoginRequest = { email, password };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_LOGIN, payload);
    return normalizeAuthResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Login failed');
  }
}

export async function signupUser(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const payload: SignupRequest = { username, email, password };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_SIGNUP, payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Signup failed');
  }
}

export async function verifyAccount(email: string, verificationCode: string): Promise<AuthResponse> {
  const payload: VerifyRequest = { email, verificationCode };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_VERIFY, {
      email: payload.email,
      verification_code: payload.verificationCode,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Verification failed');
  }
}

export async function resendVerificationCode(email: string): Promise<AuthResponse> {
  const payload: ResendVerificationRequest = { email };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_RESEND_VERIFICATION, payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to resend verification code');
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const response = await apiClient.get<AuthResponse>(ENDPOINTS.AUTH_ME);
    return normalizeAuthResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to fetch user');
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await apiClient.post<RefreshTokenResponse>(ENDPOINTS.AUTH_REFRESH);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<RefreshTokenResponse>;
    return toErrorResponse(axiosError, 'Token refresh failed');
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  const payload: ForgotPasswordRequest = { email };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_FORGOT_PASSWORD_REQUEST, payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to request password reset');
  }
}

export async function resetPassword(
  email: string,
  newPassword: string,
  verificationCode: string,
): Promise<AuthResponse> {
  const payload: ResetPasswordRequest = { email, newPassword, verificationCode };
  try {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH_FORGOT_PASSWORD_RESET, {
      email: payload.email,
      new_password: payload.newPassword,
      verification_code: payload.verificationCode,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<AuthResponse>;
    return toErrorResponse(axiosError, 'Failed to reset password');
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post<{ success: boolean }>(ENDPOINTS.AUTH_LOGOUT);
    return response.data;
  } catch (error) {
    return { success: true };
  }
}

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

