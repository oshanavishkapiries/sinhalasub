/**
 * TMDB Image Utility Functions
 * 
 * Helper functions for generating TMDB image URLs
 */

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'w1280';

/**
 * Generate TMDB image URL
 * @param path - Image path from TMDB API
 * @param size - Image size (default: w500 for posters)
 * @returns Full image URL or placeholder
 */
export function getImageUrl(path: string | null, size: string = POSTER_SIZE): string {
  return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750';
}
