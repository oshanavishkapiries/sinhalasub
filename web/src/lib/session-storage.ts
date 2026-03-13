import { User } from '@/types/auth';

const USER_KEY = 'sinhalasub_user';

const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

export const saveUser = (user: User): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

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

export const clearUser = (): void => {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};

export default {
  saveUser,
  getUser,
  clearUser,
};
