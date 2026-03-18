/**
 * TMDB API Client
 * Direct TMDB API integration for fetching movie data
 */

import axios, { AxiosError } from 'axios';
import type {
  TMDBMovieResponse,
  TMDBCreditsResponse,
  TMDBMovieData,
  TMDBCastMember,
} from '@/types/tmdb';
import { getImageUrl, POSTER_SIZE, BACKDROP_SIZE } from '@/lib/images';
import { fetchIMDbTrailer } from './imdb-client';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

/**
 * Map TMDB genres to predefined categories
 * Matches TMDB genre names with your app's category list
 */
function mapTMDBGenresToCategories(
  tmdbGenres: Array<{ id: number; name: string }>
): Array<{ category_id: number; category_name: string }> {
  const predefinedCategories = [
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Thriller',
    'Animation',
    'Adventure',
    'Sci-Fi',
    'Documentary',
  ];

  // Map TMDB genres to predefined categories
  const categoryMap: Record<string, string> = {
    Action: 'Action',
    Comedy: 'Comedy',
    Drama: 'Drama',
    Horror: 'Horror',
    Romance: 'Romance',
    Thriller: 'Thriller',
    Animation: 'Animation',
    Adventure: 'Adventure',
    'Science Fiction': 'Sci-Fi',
    'Sci-Fi': 'Sci-Fi',
    Documentary: 'Documentary',
    Crime: 'Thriller', // Map Crime to Thriller
    Mystery: 'Thriller', // Map Mystery to Thriller
    War: 'Action', // Map War to Action
    Fantasy: 'Adventure', // Map Fantasy to Adventure
    'TV Movie': 'Documentary', // Map TV Movie to Documentary
  };

  return tmdbGenres
    .map((genre) => {
      const mappedCategory = categoryMap[genre.name];
      if (!mappedCategory) return null;

      const categoryIndex = predefinedCategories.indexOf(mappedCategory);
      if (categoryIndex === -1) return null;

      return {
        category_id: categoryIndex, // Use index as ID since TMDB IDs differ
        category_name: mappedCategory,
      };
    })
    .filter((cat) => cat !== null) as Array<{
    category_id: number;
    category_name: string;
  }>;
}

/**
 * Generate slug from title
 * Converts "The Dark Knight" to "the-dark-knight"
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Get director name from credits
 */
function getDirector(credits: TMDBCreditsResponse): string {
  const director = credits.crew.find(
    (member) => member.department === 'Directing' && member.job === 'Director'
  );
  return director?.name || '';
}

/**
 * Get country from production countries data
 * Uses actual TMDB production country data if available
 */
function getCountryFromProductionCountries(
  productionCountries?: Array<{ iso_3166_1: string; name: string }>
): string {
  if (productionCountries && productionCountries.length > 0) {
    // Return the first production country name
    return productionCountries[0].name;
  }
  return '';
}

/**
 * Get country from original language (fallback)
 */
function getCountryFromLanguage(language: string): string {
  const languageToCountry: Record<string, string> = {
    en: 'United States',
    es: 'Spain',
    fr: 'France',
    de: 'Germany',
    it: 'Italy',
    ja: 'Japan',
    ko: 'South Korea',
    zh: 'China',
    ru: 'Russia',
    hi: 'India',
    pt: 'Portugal',
    pl: 'Poland',
  };
  return languageToCountry[language] || '';
}

/**
 * Fetch movie details from TMDB by movie ID
 */
export async function fetchTMDBMovie(tmdbId: number): Promise<TMDBMovieResponse | null> {
  try {
    const response = await tmdbClient.get<TMDBMovieResponse>(`/movie/${tmdbId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching TMDB movie:', axiosError.message);
    throw new Error(`Failed to fetch movie with ID ${tmdbId}: ${axiosError.message}`);
  }
}

/**
 * Fetch movie credits (cast + crew) from TMDB
 */
export async function fetchTMDBCredits(tmdbId: number): Promise<TMDBCreditsResponse | null> {
  try {
    const response = await tmdbClient.get<TMDBCreditsResponse>(`/movie/${tmdbId}/credits`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching TMDB credits:', axiosError.message);
    throw new Error(`Failed to fetch credits for movie ${tmdbId}: ${axiosError.message}`);
  }
}

/**
 * Transform TMDB data to application format
 * Combines movie details and credits into the form data structure
 */
export async function transformTMDBData(
  movieData: TMDBMovieResponse,
  creditsData: TMDBCreditsResponse | null
): Promise<TMDBMovieData> {
  const castData = creditsData?.cast || [];
  const director = creditsData ? getDirector(creditsData) : '';

  // Get poster and backdrop URLs
  const posterUrl = getImageUrl(movieData.poster_path, POSTER_SIZE);
  const backdropUrl = getImageUrl(movieData.backdrop_path, BACKDROP_SIZE);

  // Map genres to categories
  const categories = mapTMDBGenresToCategories(movieData.genres);

  // Get country from production countries (with language fallback)
  const country =
    getCountryFromProductionCountries(movieData.production_countries) ||
    getCountryFromLanguage(movieData.original_language);

  // Extract cast (top 20)
  const cast = castData
    .slice(0, 20)
    .filter((member) => member.profile_path) // Only include actors with profile images
    .map((member: TMDBCastMember) => ({
      actor_name: member.name,
      character_name: member.character,
      actor_image_url: getImageUrl(member.profile_path, 'w342'),
      tmdb_id: member.id,
    }));

  // Fetch trailer URL from IMDb
  let trailerUrl = '';
  if (movieData.imdb_id) {
    try {
      trailerUrl = await fetchIMDbTrailer(movieData.imdb_id);
    } catch (error) {
      console.warn('Failed to fetch trailer:', error);
      // Continue without trailer URL
    }
  }

  const transformed: TMDBMovieData = {
    movie: {
      tmdb_id: movieData.id,
      title: movieData.title,
      slug: generateSlug(movieData.title),
      poster_url: posterUrl,
      rating: movieData.vote_average / 2, // TMDB uses 0-10, we use 0-5 (or adjust as needed)
      release_date: movieData.release_date,
      overview: movieData.overview,
    },
    movieDetails: {
      overview: movieData.overview,
      director: director,
      language: movieData.original_language.toUpperCase(),
      country: country,
      duration: movieData.runtime,
      imdb_id: movieData.imdb_id,
      tmdb_id: movieData.id,
      backdrop_url: backdropUrl,
      trailer_url: trailerUrl,
      adult: movieData.adult,
    },
    categories: categories,
    cast: cast,
  };

  return transformed;
}

/**
 * Complete function: Get all movie data from TMDB
 * Fetches both movie details and credits, then transforms
 */
export async function getCompleteMovieData(tmdbId: number): Promise<TMDBMovieData> {
  try {
    // Fetch movie details and credits in parallel
    const [movieData, creditsData] = await Promise.all([
      fetchTMDBMovie(tmdbId),
      fetchTMDBCredits(tmdbId).catch(() => null), // Credits are optional
    ]);

    if (!movieData) {
      throw new Error('Movie not found');
    }

    // Transform to application format (now async)
    return await transformTMDBData(movieData, creditsData);
  } catch (error) {
    console.error('Error getting complete movie data:', error);
    throw error;
  }
}

export default {
  fetchTMDBMovie,
  fetchTMDBCredits,
  transformTMDBData,
  getCompleteMovieData,
};
