/**
 * Placeholder Images
 * Common placeholder image URLs and definitions
 */

export interface PlaceholderImage {
  id: string;
  url: string;
  alt: string;
}

export const PlaceHolderImages: PlaceholderImage[] = [
  {
    id: 'user-avatar',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    alt: 'Default user avatar',
  },
  {
    id: 'movie-poster',
    url: 'https://via.placeholder.com/500x750?text=Movie+Poster',
    alt: 'Movie poster placeholder',
  },
  {
    id: 'movie-backdrop',
    url: 'https://via.placeholder.com/1280x720?text=Movie+Backdrop',
    alt: 'Movie backdrop placeholder',
  },
  {
    id: 'actor-image',
    url: 'https://via.placeholder.com/342x513?text=Actor+Image',
    alt: 'Actor image placeholder',
  },
];
