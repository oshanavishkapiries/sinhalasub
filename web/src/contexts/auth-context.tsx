'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthContextType, User, UserRole } from '@/types/auth';
import { loginUser, signupUser, logoutUser, getCurrentUser, refreshToken } from '@/services/auth';
import {
  saveSession,
  getSession,
  getToken,
  getRefreshToken,
  clearSession,
  updateToken,
  updateRefreshToken,
  decodeToken,
} from '@/lib/session-storage';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getToken();
        const storedSession = getSession();

        if (storedToken && storedSession) {
          // Verify token is still valid
          const tokenData = decodeToken(storedToken);
          if (tokenData && tokenData.exp && tokenData.exp * 1000 > Date.now()) {
            setToken(storedToken);
            setUser(storedSession.user);
            setIsAuthenticated(true);
          } else {
            // Token expired, try to refresh
            const refreshTokenValue = getRefreshToken();
            if (refreshTokenValue) {
              try {
                const response = await refreshToken(refreshTokenValue);
                if (response.success && response.data) {
                  const { token: newToken, refreshToken: newRefreshToken } = response.data;
                  updateToken(newToken);
                  if (newRefreshToken) {
                    updateRefreshToken(newRefreshToken);
                  }
                  setToken(newToken);
                  setUser(storedSession.user);
                  setIsAuthenticated(true);
                } else {
                  clearSession();
                }
              } catch (error) {
                clearSession();
              }
            } else {
              clearSession();
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle login
  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser(email, password);

      if (response.success && response.data) {
        const { user: responseUser, token: responseToken, refreshToken: responseRefreshToken } = response.data;

        // Save session
        saveSession({
          user: responseUser,
          token: responseToken,
          refreshToken: responseRefreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        });

        setUser(responseUser);
        setToken(responseToken);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      clearSession();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle signup
  const handleSignup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await signupUser(email, password, name);

      if (response.success && response.data) {
        const { user: responseUser, token: responseToken, refreshToken: responseRefreshToken } = response.data;

        // Save session
        saveSession({
          user: responseUser,
          token: responseToken,
          refreshToken: responseRefreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + 86400,
        });

        setUser(responseUser);
        setToken(responseToken);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      clearSession();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    logoutUser().catch(console.error);
    clearSession();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  // Handle token refresh
  const handleRefreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await refreshToken(refreshTokenValue);

      if (response.success && response.data) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        updateToken(newToken);
        if (newRefreshToken) {
          updateRefreshToken(newRefreshToken);
        }

        setToken(newToken);

        // Update session
        const currentSession = getSession();
        if (currentSession) {
          saveSession({
            ...currentSession,
            token: newToken,
            refreshToken: newRefreshToken || currentSession.refreshToken,
            expiresAt: Math.floor(Date.now() / 1000) + 86400,
          });
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearSession();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
