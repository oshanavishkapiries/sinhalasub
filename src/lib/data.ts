
import type { Content } from '@/types';
import { fetchPopular, fetchTopRated, fetchTrending, fetchNowPlaying } from './tmdb';

let content: Content[] | null = null;

export const getContent = async (): Promise<Content[]> => {
  if (content) {
    return content;
  }

  const [trending, popular, topRated, continueWatching] = await Promise.all([
    fetchTrending(),
    fetchPopular(),
    fetchTopRated(),
    fetchNowPlaying(),
  ]);

  const allContent = [...trending, ...popular, ...topRated, ...continueWatching];
  
  // Create a unique set of content based on ID
  const uniqueContent = Array.from(new Map(allContent.map(item => [item.id, item])).values());
  
  content = uniqueContent as Content[];

  return content;
};
