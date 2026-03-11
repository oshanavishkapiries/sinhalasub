
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

  // Check if we have any data to display
  const hasData = trending.length > 0 || popular.length > 0 || topRated.length > 0 || continueWatching.length > 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        {featuredContent && <HeroSection item={featuredContent} />}
        {!hasData ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center max-w-md">
              <h2 className="text-2xl font-semibold text-zinc-100">Unable to Load Content</h2>
              <p className="mt-3 text-zinc-400">We're having trouble loading content right now. Please try refreshing the page.</p>
            </div>
          </div>
        ) : (
          <div className="container -mt-12 space-y-12 pb-24 md:-mt-24">
            {trending.length > 0 && <ContentCarousel title="Trending Now" items={trending} />}
            {popular.length > 0 && <ContentCarousel title="Popular on sinhalasub" items={popular} />}
            {topRated.length > 0 && <ContentCarousel title="Top Rated" items={topRated} />}
            {continueWatching.length > 0 && <ContentCarousel title="Continue Watching" items={continueWatching} />}
          </div>
        )}
      </main>
    </div>
  );
}
