'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthContextType, User } from '@/types/auth';
import {
  useCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRequestPasswordResetMutation,
  useResendVerificationCodeMutation,
  useResetPasswordMutation,
  useSignupMutation,
  useVerifyAccountMutation,
} from '@/services/hooks/useAuth';
import { clearUser, getUser, saveUser } from '@/lib/session-storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUser());

  const currentUserQuery = useCurrentUserQuery();
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const verifyAccountMutation = useVerifyAccountMutation();
  const resendVerificationCodeMutation = useResendVerificationCodeMutation();
  const requestPasswordResetMutation = useRequestPasswordResetMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const logoutMutation = useLogoutMutation();
  const refreshTokenMutation = useRefreshTokenMutation();

  const setAuthenticatedState = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    setIsAuthenticated(!!nextUser);

    if (nextUser) {
      saveUser(nextUser);
      return;
    }

    clearUser();
  }, []);

  useEffect(() => {
    if (!currentUserQuery.isFetched) return;
    setAuthenticatedState(currentUserQuery.data ?? null);
  }, [currentUserQuery.data, currentUserQuery.isFetched, setAuthenticatedState]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
      const me = await currentUserQuery.refetch();
      if (!me.data) {
        throw new Error('Unable to load user profile');
      }
      setAuthenticatedState(me.data);
    },
    [currentUserQuery, loginMutation, setAuthenticatedState]
  );

  const handleSignup = useCallback(async (username: string, email: string, password: string) => {
    await signupMutation.mutateAsync({ username, email, password });
  }, [signupMutation]);

  const handleVerifyAccount = useCallback(async (email: string, verificationCode: string) => {
    await verifyAccountMutation.mutateAsync({ email, verificationCode });
  }, [verifyAccountMutation]);

  const handleResendVerificationCode = useCallback(async (email: string) => {
    await resendVerificationCodeMutation.mutateAsync({ email });
  }, [resendVerificationCodeMutation]);

  const handleRequestPasswordReset = useCallback(async (email: string) => {
    await requestPasswordResetMutation.mutateAsync({ email });
  }, [requestPasswordResetMutation]);

  const handleResetPassword = useCallback(
    async (email: string, newPassword: string, verificationCode: string) => {
      await resetPasswordMutation.mutateAsync({ email, newPassword, verificationCode });
      setAuthenticatedState(null);
    },
    [resetPasswordMutation, setAuthenticatedState]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setAuthenticatedState(null);
    }
  }, [logoutMutation, setAuthenticatedState]);

  const handleRefreshToken = useCallback(async () => {
    await refreshTokenMutation.mutateAsync();
    const me = await currentUserQuery.refetch();
    setAuthenticatedState(me.data ?? null);
  }, [currentUserQuery, refreshTokenMutation, setAuthenticatedState]);

  const revalidateAuth = useCallback(async () => {
    const me = await currentUserQuery.refetch();
    setAuthenticatedState(me.data ?? null);
  }, [currentUserQuery, setAuthenticatedState]);

  const isLoading =
    currentUserQuery.isLoading ||
    currentUserQuery.isFetching ||
    loginMutation.isPending ||
    signupMutation.isPending ||
    verifyAccountMutation.isPending ||
    resendVerificationCodeMutation.isPending ||
    requestPasswordResetMutation.isPending ||
    resetPasswordMutation.isPending ||
    logoutMutation.isPending ||
    refreshTokenMutation.isPending;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    verifyAccount: handleVerifyAccount,
    resendVerificationCode: handleResendVerificationCode,
    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    revalidateAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
