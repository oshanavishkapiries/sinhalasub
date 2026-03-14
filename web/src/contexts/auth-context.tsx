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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUser());

  const currentUserQuery = useCurrentUserQuery({ enabled: false });
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

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const meResult = await currentUserQuery.refetch();
    return meResult.data ?? null;
  }, [currentUserQuery]);

  const revalidateAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      let currentUser = await fetchCurrentUser();

      if (!currentUser) {
        await refreshTokenMutation.mutateAsync();
        currentUser = await fetchCurrentUser();
      }

      setAuthenticatedState(currentUser);
    } catch (error) {
      console.error('Error revalidating auth:', error);
      setAuthenticatedState(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, refreshTokenMutation, setAuthenticatedState]);

  useEffect(() => {
    revalidateAuth();
  }, [revalidateAuth]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        await loginMutation.mutateAsync({ email, password });
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          throw new Error('Unable to load user profile');
        }

        setAuthenticatedState(currentUser);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentUser, loginMutation, setAuthenticatedState]
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
    const currentUser = await fetchCurrentUser();
    setAuthenticatedState(currentUser);
  }, [fetchCurrentUser, refreshTokenMutation, setAuthenticatedState]);

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
