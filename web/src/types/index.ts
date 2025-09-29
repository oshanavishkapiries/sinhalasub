

export interface Content {
  id: number;
  title: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  category?: 'trending' | 'popular' | 'top-rated' | 'continue-watching' | 'my-list';
  seasons?: TVSeason[];
}

export interface TVSeason {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    episodes?: Episode[];
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    air_date: string;
    still_path: string | null;
}

export interface Genre {
    id: number;
    name: string;
}
