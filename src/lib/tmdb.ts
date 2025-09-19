

import type { Content, TVSeason, Genre } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
export const POSTER_SIZE = 'w500';
export const BACKDROP_SIZE = 'w1280';

export function getImageUrl(path: string | null, size: string = POSTER_SIZE) {
  return path ? `${IMAGE_BASE_URL}${size}${path}` : 'https://placehold.co/500x750';
}

async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY || '');
  for (const key in params) {
    if (params[key]) {
      url.searchParams.append(key, params[key]);
    }
  }
  
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`TMDB API Error: ${response.statusText} for endpoint ${endpoint}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB endpoint: ${endpoint}`, error);
    return null;
  }
}

export async function fetchLanguages(): Promise<{ english_name: string, iso_639_1: string, name: string }[] | null> {
    const data = await fetchFromTMDB('/configuration/languages');
    return data;
}


export async function fetchTrending(): Promise<Content[]> {
  const data = await fetchFromTMDB('/trending/all/week');
  return data?.results.map((item: any) => ({ ...item, category: 'trending' })) || [];
}

export async function fetchPopular(): Promise<Content[]> {
    const [movies, tv] = await Promise.all([
        fetchFromTMDB('/movie/popular'),
        fetchFromTMDB('/tv/popular'),
    ]);
    const movieResults = movies?.results || [];
    const tvResults = tv?.results || [];
    return [...movieResults.map((m: any) => ({...m, media_type: 'movie', category: 'popular'})), ...tvResults.map((t: any) => ({...t, media_type: 'tv', category: 'popular'}))];
}

export async function fetchTopRated(): Promise<Content[]> {
    const [movies, tv] = await Promise.all([
        fetchFromTMDB('/movie/top_rated'),
        fetchFromTMDB('/tv/top_rated'),
    ]);
    const movieResults = movies?.results || [];
    const tvResults = tv?.results || [];
    return [...movieResults.map((m: any) => ({...m, media_type: 'movie', category: 'top-rated'})), ...tvResults.map((t: any) => ({...t, media_type: 'tv', category: 'top-rated'}))];
}

export async function fetchNowPlaying(): Promise<Content[]> {
    const data = await fetchFromTMDB('/movie/now_playing');
    return (data?.results || []).map((item: any) => ({ ...item, media_type: 'movie', category: 'continue-watching' }));
}

export async function fetchContentDetails(id: string, type: 'movie' | 'tv'): Promise<Content | null> {
    const data = await fetchFromTMDB(`/${type}/${id}`);
    if (!data) return null;
    return { ...data, media_type: type };
}

export async function searchContent(query: string): Promise<Content[]> {
    const data = await fetchFromTMDB('/search/multi', { query });
    return data?.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv') || [];
}

export async function fetchSimilarContent(id: string, type: 'movie' | 'tv'): Promise<Content[]> {
    const data = await fetchFromTMDB(`/${type}/${id}/similar`);
    return (data?.results || []).map((item: any) => ({ ...item, media_type: type }));
}

export async function fetchTVSeason(tvId: number, seasonNumber: number): Promise<TVSeason | null> {
    const data = await fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    return data as TVSeason | null;
}

export async function fetchTVGenres(): Promise<Genre[] | null> {
    const data = await fetchFromTMDB('/genre/tv/list');
    return data?.genres;
}

export async function fetchMovieGenres(): Promise<Genre[] | null> {
    const data = await fetchFromTMDB('/genre/movie/list');
    return data?.genres;
}

export async function fetchDiscoverTV(category: string, genres: number[], language: string): Promise<Content[] | null> {
    const params: Record<string, string> = {
        with_genres: genres.join(','),
        with_original_language: language,
    };
    const endpoint = category === 'popular' || category === 'top_rated' ? `/tv/${category}` : '/discover/tv';
    if(category === 'on_the_air') {
        params['on_the_air'] = 'true';
    }

    const data = await fetchFromTMDB(endpoint, params);
    return data?.results.map((item: any) => ({ ...item, media_type: 'tv' })) || [];
}

export async function fetchDiscoverMovies(category: string, genres: number[], language: string): Promise<Content[] | null> {
    const params: Record<string, string> = {
        with_genres: genres.join(','),
        with_original_language: language,
    };
    const endpoint = `/movie/${category}`;
    
    const data = await fetchFromTMDB(endpoint, params);
    return data?.results.map((item: any) => ({ ...item, media_type: 'movie' })) || [];
}
