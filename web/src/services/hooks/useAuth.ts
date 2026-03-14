'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../api/endpoints';
import * as api from '../functions/auth';
import type { AuthResponse, RefreshTokenResponse, User } from '../types';

export function useCurrentUserQuery(options?: { enabled?: boolean }) {
  return useQuery<User | null>({
    queryKey: QUERY_KEYS.AUTH_ME,
    queryFn: async () => {
      const resp = await api.getCurrentUser();
      return resp.success && resp.data?.user ? resp.data.user : null;
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const resp = await api.loginUser(email, password);
      if (!resp.success) throw new Error(resp.message || 'Login failed');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });
}

export function useSignupMutation() {
  return useMutation<AuthResponse, Error, { username: string; email: string; password: string }>({
    mutationFn: async ({ username, email, password }) => {
      const resp = await api.signupUser(username, email, password);
      if (!resp.success) throw new Error(resp.message || 'Signup failed');
      return resp;
    },
  });
}

export function useVerifyAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, { email: string; verificationCode: string }>({
    mutationFn: async ({ email, verificationCode }) => {
      const resp = await api.verifyAccount(email, verificationCode);
      if (!resp.success) throw new Error(resp.message || 'Verification failed');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });
}

export function useResendVerificationCodeMutation() {
  return useMutation<AuthResponse, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      const resp = await api.resendVerificationCode(email);
      if (!resp.success) throw new Error(resp.message || 'Failed to resend verification code');
      return resp;
    },
  });
}

export function useRefreshTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation<RefreshTokenResponse, Error, void>({
    mutationFn: async () => {
      const resp = await api.refreshToken();
      if (!resp.success) throw new Error(resp.message || 'Token refresh failed');
      return resp;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });
}

export function useRequestPasswordResetMutation() {
  return useMutation<AuthResponse, Error, { email: string }>({
    mutationFn: async ({ email }) => {
      const resp = await api.requestPasswordReset(email);
      if (!resp.success) throw new Error(resp.message || 'Failed to request password reset');
      return resp;
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation<AuthResponse, Error, { email: string; newPassword: string; verificationCode: string }>({
    mutationFn: async ({ email, newPassword, verificationCode }) => {
      const resp = await api.resetPassword(email, newPassword, verificationCode);
      if (!resp.success) throw new Error(resp.message || 'Failed to reset password');
      return resp;
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: async () => {
      return api.logoutUser();
    },
    onSuccess: async () => {
      await queryClient.setQueryData(QUERY_KEYS.AUTH_ME, null);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_ME });
    },
  });
}

