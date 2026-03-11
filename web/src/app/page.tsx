
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { ContentCarousel } from '@/components/content-carousel';
import { fetchTrending, fetchPopular, fetchTopRated, fetchNowPlaying } from '@/services/functions';
import type { Content } from '@/types';

export default async function Home() {
  // Fetch all content in parallel
  const [trending, popular, topRated, continueWatching] = await Promise.all([
    fetchTrending(),
    fetchPopular(),
    fetchTopRated(),
    fetchNowPlaying(),
  ]);

  // Pick featured content from trending
  const featuredContent = trending.find(c => c.backdrop_path);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        {featuredContent && <HeroSection item={featuredContent} />}
        <div className="container -mt-12 space-y-12 pb-24 md:-mt-24">
          <ContentCarousel title="Trending Now" items={trending} />
          <ContentCarousel title="Popular on sinhalasub" items={popular} />
          <ContentCarousel title="Top Rated" items={topRated} />
          <ContentCarousel title="Continue Watching" items={continueWatching} />
        </div>
      </main>
    </div>
  );
}
