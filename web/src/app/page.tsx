
import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { ContentCarousel } from '@/components/content-carousel';
import { getContent } from '@/lib/data';
import type { Content } from '@/types';

export default async function Home() {
  const allContent: Content[] = await getContent();
  const featuredContent = allContent.find(c => c.backdrop_path);

  const trending = allContent.filter(c => c.category === 'trending');
  const popular = allContent.filter(c => c.category === 'popular');
  const topRated = allContent.filter(c => c.category === 'top-rated');
  const continueWatching = allContent.filter(c => c.category === 'continue-watching');

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
