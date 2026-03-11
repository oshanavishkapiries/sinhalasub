import { fetchAPI } from './client';
import { ENDPOINTS } from '../endpoints';
import type { Language, Genre } from '../types';

export async function fetchLanguages(): Promise<Language[]> {
  return fetchAPI<Language[]>(ENDPOINTS.LANGUAGES);
}

export async function fetchTVGenres(): Promise<Genre[]> {
  const data = await fetchAPI<{ genres: Genre[] }>(ENDPOINTS.TV_GENRES);
  return data.genres;
}

export async function fetchMovieGenres(): Promise<Genre[]> {
  const data = await fetchAPI<{ genres: Genre[] }>(ENDPOINTS.MOVIE_GENRES);
  return data.genres;
}
