/**
 * User Role Enumeration
 */
export enum UserRole {
  PLATFORM_USER = 'platform-user',
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

/**
 * User Interface
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Authentication Request/Response Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface VerifyRequest {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  verificationCode: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    verified?: boolean;
    refreshed?: boolean;
    sent?: boolean;
    updated?: boolean;
    logged_out?: boolean;
  };
  error?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    refreshed?: boolean;
  };
  error?: string;
}

/**
 * Auth Context Type
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  verifyAccount: (email: string, verificationCode: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string, verificationCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  revalidateAuth: () => Promise<void>;
}
