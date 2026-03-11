export interface DiscoverParams {
  category: string;
  genres: number[];
  language: string;
}

export interface SearchParams {
  query: string;
}

export interface ContentDetailsParams {
  id: string;
  type: 'movie' | 'tv';
}

export interface SimilarContentParams {
  id: string;
  type: 'movie' | 'tv';
}

export interface TVSeasonParams {
  tvId: number;
  seasonNumber: number;
}
