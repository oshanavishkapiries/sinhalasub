/**
 * TMDB API Fetcher for Mock Server
 * 
 * This module fetches real data from TMDB API to populate mock responses dynamically.
 * Use this for development with real data instead of static mock data.
 */

// Load environment variables from .env file
require('dotenv').config();

// Load TMDB API key from environment
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Log API key status for debugging
if (!API_KEY) {
  console.warn('[TMDB Fetcher] Warning: NEXT_PUBLIC_TMDB_API_KEY not found in environment');
} else {
  console.log('[TMDB Fetcher] API key loaded successfully');
}

/**
 * Fetch data from TMDB API
 * @param {string} endpoint - TMDB API endpoint (e.g., '/trending/all/week')
 * @param {Object} params - Query parameters
 * @returns {Promise<any>} - API response data
 */
async function fetchFromTMDB(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY || '');
  
  for (const key in params) {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  }
  
  console.log(`[TMDB Fetcher] Fetching: ${url.toString().replace(API_KEY, '***')}`);
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`[TMDB Fetcher] API Error: ${response.statusText} for endpoint ${endpoint}`);
      return null;
    }
    const data = await response.json();
    console.log(`[TMDB Fetcher] Success: ${endpoint} returned ${JSON.stringify(data).substring(0, 100)}...`);
    return data;
  } catch (error) {
    console.error(`[TMDB Fetcher] Failed to fetch endpoint: ${endpoint}`, error.message);
    return null;
  }
}

/**
 * Fetch languages configuration
 */
async function fetchLanguages() {
  return await fetchFromTMDB('/configuration/languages');
}

/**
 * Fetch trending content
 */
async function fetchTrending() {
  const data = await fetchFromTMDB('/trending/all/week');
  return {
    page: 1,
    results: data?.results || [],
  };
}

/**
 * Fetch popular content (movies + TV shows)
 */
async function fetchPopular() {
  const [movies, tv] = await Promise.all([
    fetchFromTMDB('/movie/popular'),
    fetchFromTMDB('/tv/popular'),
  ]);
  
  const movieResults = (movies?.results || []).map(m => ({ ...m, media_type: 'movie' }));
  const tvResults = (tv?.results || []).map(t => ({ ...t, media_type: 'tv' }));
  
  return {
    page: 1,
    results: [...movieResults, ...tvResults],
  };
}

/**
 * Fetch top rated content (movies + TV shows)
 */
async function fetchTopRated() {
  const [movies, tv] = await Promise.all([
    fetchFromTMDB('/movie/top_rated'),
    fetchFromTMDB('/tv/top_rated'),
  ]);
  
  const movieResults = (movies?.results || []).map(m => ({ ...m, media_type: 'movie' }));
  const tvResults = (tv?.results || []).map(t => ({ ...t, media_type: 'tv' }));
  
  return {
    page: 1,
    results: [...movieResults, ...tvResults],
  };
}

/**
 * Fetch now playing movies
 */
async function fetchNowPlaying() {
  const data = await fetchFromTMDB('/movie/now_playing');
  return {
    page: 1,
    results: (data?.results || []).map(m => ({ ...m, media_type: 'movie' })),
  };
}

/**
 * Fetch content details (movie or TV show)
 */
async function fetchContentDetails(id, type) {
  const data = await fetchFromTMDB(`/${type}/${id}`);
  if (!data) return null;
  return { ...data, media_type: type };
}

/**
 * Search for content
 */
async function searchContent(query) {
  const data = await fetchFromTMDB('/search/multi', { query });
  const results = (data?.results || []).filter(
    item => item.media_type === 'movie' || item.media_type === 'tv'
  );
  return {
    page: 1,
    results,
  };
}

/**
 * Fetch similar content
 */
async function fetchSimilarContent(id, type) {
  const data = await fetchFromTMDB(`/${type}/${id}/similar`);
  return {
    page: 1,
    results: (data?.results || []).map(item => ({ ...item, media_type: type })),
  };
}

/**
 * Fetch TV season details
 */
async function fetchTVSeason(tvId, seasonNumber) {
  return await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

/**
 * Fetch TV genres
 */
async function fetchTVGenres() {
  const data = await fetchFromTMDB('/genre/tv/list');
  return { genres: data?.genres || [] };
}

/**
 * Fetch movie genres
 */
async function fetchMovieGenres() {
  const data = await fetchFromTMDB('/genre/movie/list');
  return { genres: data?.genres || [] };
}

/**
 * Discover TV shows with filters
 */
async function fetchDiscoverTV(category, genres, language) {
  const params = {
    with_genres: genres,
    with_original_language: language,
  };
  
  let endpoint = '/discover/tv';
  
  // Handle specific categories
  if (category === 'popular' || category === 'top_rated') {
    endpoint = `/tv/${category}`;
  } else if (category === 'on_the_air') {
    params['air_date.lte'] = new Date().toISOString().split('T')[0];
  }
  
  const data = await fetchFromTMDB(endpoint, params);
  return {
    page: 1,
    results: (data?.results || []).map(item => ({ ...item, media_type: 'tv' })),
  };
}

/**
 * Discover movies with filters
 */
async function fetchDiscoverMovies(category, genres, language) {
  const params = {
    with_genres: genres,
    with_original_language: language,
  };
  
  const endpoint = `/movie/${category}`;
  const data = await fetchFromTMDB(endpoint, params);
  
  return {
    page: 1,
    results: (data?.results || []).map(item => ({ ...item, media_type: 'movie' })),
  };
}

module.exports = {
  fetchLanguages,
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  fetchNowPlaying,
  fetchContentDetails,
  searchContent,
  fetchSimilarContent,
  fetchTVSeason,
  fetchTVGenres,
  fetchMovieGenres,
  fetchDiscoverTV,
  fetchDiscoverMovies,
};
