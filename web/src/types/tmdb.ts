/**
 * TMDB API Types & Interfaces
 * Types for The Movie Database API responses
 */

/**
 * TMDB Movie Details Response
 */
export interface TMDBMovieResponse {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  imdb_id: string;
  original_language: string;
  popularity: number;
  status: string;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
}

/**
 * TMDB Cast Member
 */
export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

/**
 * TMDB Credits Response
 */
export interface TMDBCreditsResponse {
  id: number;
  cast: TMDBCastMember[];
  crew: Array<{
    id: number;
    name: string;
    department: string;
    job: string;
    profile_path: string | null;
  }>;
}

/**
 * Combined movie data from TMDB
 */
export interface TMDBMovieData {
  movie: {
    tmdb_id: number;
    title: string;
    slug?: string; // Generated from title
    poster_url: string;
    rating: number;
    release_date: string;
    overview: string;
  };
  movieDetails: {
    overview: string;
    director: string;
    language: string;
    country: string;
    duration: number;
    imdb_id: string;
    tmdb_id: number;
    backdrop_url: string;
    trailer_url: string;
    adult: boolean;
  };
  categories: Array<{
    category_id: number;
    category_name: string;
  }>;
  cast: Array<{
    actor_name: string;
    character_name: string;
    actor_image_url: string;
    tmdb_id: number;
  }>;
}

/**
 * TMDB API Configuration
 */
export interface TMDBConfig {
  apiKey: string;
  baseURL: string;
  version: string;
}

/**
 * TMDB Search Result
 */
export interface TMDBSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
}
