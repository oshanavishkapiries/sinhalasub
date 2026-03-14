'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthContextType, User } from '@/types/auth';
import {
  getCurrentUser,
  loginUser,
  resendVerificationCode as resendVerificationCodeApi,
  logoutUser,
  refreshToken,
  requestPasswordReset as requestPasswordResetApi,
  resetPassword as resetPasswordApi,
  signupUser,
  verifyAccount as verifyAccountApi,
} from '@/services/functions/auth';
import { clearUser, getUser, saveUser } from '@/lib/session-storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUser());

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
    const meResponse = await getCurrentUser();
    if (meResponse.success && meResponse.data?.user) {
      return meResponse.data.user;
    }
    return null;
  }, []);

  const revalidateAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      let currentUser = await fetchCurrentUser();

      if (!currentUser) {
        const refreshResponse = await refreshToken();
        if (refreshResponse.success) {
          currentUser = await fetchCurrentUser();
        }
      }

      setAuthenticatedState(currentUser);
    } catch (error) {
      console.error('Error revalidating auth:', error);
      setAuthenticatedState(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCurrentUser, setAuthenticatedState]);

  useEffect(() => {
    revalidateAuth();
  }, [revalidateAuth]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await loginUser(email, password);
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }

        const currentUser = response.data?.user || (await fetchCurrentUser());
        if (!currentUser) {
          throw new Error('Unable to load user profile');
        }

        setAuthenticatedState(currentUser);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentUser, setAuthenticatedState]
  );

  const handleSignup = useCallback(async (username: string, email: string, password: string) => {
    const response = await signupUser(username, email, password);
    if (!response.success) {
      throw new Error(response.message || 'Signup failed');
    }
  }, []);

  const handleVerifyAccount = useCallback(async (email: string, verificationCode: string) => {
    const response = await verifyAccountApi(email, verificationCode);
    if (!response.success) {
      throw new Error(response.message || 'Verification failed');
    }
  }, []);

  const handleResendVerificationCode = useCallback(async (email: string) => {
    const response = await resendVerificationCodeApi(email);
    if (!response.success) {
      throw new Error(response.message || 'Failed to resend verification code');
    }
  }, []);

  const handleRequestPasswordReset = useCallback(async (email: string) => {
    const response = await requestPasswordResetApi(email);
    if (!response.success) {
      throw new Error(response.message || 'Failed to request password reset');
    }
  }, []);

  const handleResetPassword = useCallback(
    async (email: string, newPassword: string, verificationCode: string) => {
      const response = await resetPasswordApi(email, newPassword, verificationCode);
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
      setAuthenticatedState(null);
    },
    [setAuthenticatedState]
  );

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setAuthenticatedState(null);
    }
  }, [setAuthenticatedState]);

  const handleRefreshToken = useCallback(async () => {
    const response = await refreshToken();
    if (!response.success) {
      setAuthenticatedState(null);
      throw new Error(response.message || 'Token refresh failed');
    }

    const currentUser = await fetchCurrentUser();
    setAuthenticatedState(currentUser);
  }, [fetchCurrentUser, setAuthenticatedState]);

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
