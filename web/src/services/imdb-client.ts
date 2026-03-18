/**
 * IMDb Trailer Scraper
 * Fetches trailer URLs from IMDb using IMDb ID
 * Uses web scraping/parsing techniques
 */

import axios, { AxiosError } from 'axios';

interface IMDbTrailerResponse {
  trailerUrl?: string;
  error?: string;
}

/**
 * Fetch IMDb movie page and extract trailer URL
 * Uses IMDb's embedded trailer API endpoint
 */
export async function fetchIMDbTrailer(imdbId: string): Promise<string> {
  try {
    // IMDb provides a JSON API endpoint for movie data
    const response = await axios.get(
      `https://www.imdb.com/title/${imdbId}/`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    const html = response.data;

    // Try to extract trailer URL from JSON-LD data
    const jsonLdMatch = html.match(/"url":"(https:\/\/www\.imdb\.com\/video\/[^"]+)"/);
    if (jsonLdMatch && jsonLdMatch[1]) {
      return jsonLdMatch[1];
    }

    // Alternative: Try to find trailer in initial data
    const trailerMatch = html.match(/"trailerUrl":"([^"]+)"/);
    if (trailerMatch && trailerMatch[1]) {
      return trailerMatch[1];
    }

    // Third option: Look for YouTube video embed
    const youtubeMatch = html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Return IMDb video page as fallback
    return `https://www.imdb.com/title/${imdbId}/videogallery`;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.warn('Error fetching IMDb trailer:', axiosError.message);
    // Return IMDb video gallery as fallback
    return `https://www.imdb.com/title/${imdbId}/videogallery`;
  }
}

/**
 * Fetch IMDb ratings (separate from TMDB ratings)
 */
export async function fetchIMDbRatings(
  imdbId: string
): Promise<{ rating: number; votes: number } | null> {
  try {
    // This would need IMDb API or web scraping
    // For now, return null as IMDb API requires subscription
    // You could integrate with a free IMDb API service if needed
    return null;
  } catch (error) {
    console.warn('Error fetching IMDb ratings:', error);
    return null;
  }
}

export default {
  fetchIMDbTrailer,
  fetchIMDbRatings,
};
