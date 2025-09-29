
import { fetchContentDetails, getImageUrl, BACKDROP_SIZE, fetchSimilarContent } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import type { Content } from '@/types';
import { Header } from '@/components/header';
import Image from 'next/image';
import { ContentDetails } from '@/components/content-details';

export default async function ContentDetailsPage({ params }: { params: { id: string[] } }) {
  const [type, id] = params.id;

  if (type !== 'movie' && type !== 'tv') {
    notFound();
  }

  const item = await fetchContentDetails(id, type as 'movie' | 'tv');

  if (!item) {
    notFound();
  }
  
  const similarContent = await fetchSimilarContent(id, type as 'movie' | 'tv');
  const title = item.title || item.name;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="relative h-[50vh] w-full">
          <Image
            src={getImageUrl(item.backdrop_path, BACKDROP_SIZE)}
            alt={`Backdrop for ${title}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container relative -mt-32 pb-24">
          <ContentDetails item={item} similarContent={similarContent} />
        </div>
      </main>
    </div>
  );
}
