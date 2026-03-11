import { SessionData, User } from '@/types/auth';

const SESSION_KEY = 'sinhalasub_session';
const TOKEN_KEY = 'sinhalasub_token';
const REFRESH_TOKEN_KEY = 'sinhalasub_refresh_token';
const USER_KEY = 'sinhalasub_user';

/**
 * Check if code is running in browser
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Save session data
 */
export const saveSession = (sessionData: SessionData): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, sessionData.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, sessionData.refreshToken || '');
    localStorage.setItem(USER_KEY, JSON.stringify(sessionData.user));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

/**
 * Get session data
 */
export const getSession = (): SessionData | null => {
  if (!isBrowser()) return null;

  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    return JSON.parse(sessionData) as SessionData;
  } catch (error) {
    console.error('Error retrieving session:', error);
    return null;
  }
};

/**
 * Get auth token
 */
export const getToken = (): string | null => {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Get user data
 */
export const getUser = (): User | null => {
  if (!isBrowser()) return null;

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

/**
 * Update token
 */
export const updateToken = (token: string): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error updating token:', error);
  }
};

/**
 * Update refresh token
 */
export const updateRefreshToken = (refreshToken: string): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error updating refresh token:', error);
  }
};

/**
 * Clear session
 */
export const clearSession = (): void => {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

/**
 * Check if session is valid (token exists and not expired)
 */
export const isSessionValid = (): boolean => {
  const session = getSession();
  if (!session) return false;

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  return session.expiresAt > now;
};

/**
 * Decode JWT token (mock JWT - base64 encoded)
 */
export const decodeToken = (token: string): Record<string, any> | null => {
  try {
    const payload = Buffer.from(token, 'base64').toString();
    return JSON.parse(payload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export default {
  saveSession,
  getSession,
  getToken,
  getRefreshToken,
  getUser,
  updateToken,
  updateRefreshToken,
  clearSession,
  isSessionValid,
  decodeToken,
};
