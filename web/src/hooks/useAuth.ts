'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';
import { AuthContextType } from '@/types/auth';

/**
 * Hook to use auth context
 * Throws error if used outside of AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Hook to check if user has specific role
 */
export const useAuthRole = () => {
  const { user } = useAuth();
  const role = user?.role;

  return {
    isAdmin: role === 'admin' || role === 'super_admin',
    isModerator: role === 'moderator' || role === 'admin' || role === 'super_admin',
    isUser: !!user,
    role,
  };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

export default useAuth;
