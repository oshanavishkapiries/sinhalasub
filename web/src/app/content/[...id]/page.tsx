'use client';

import React from 'react';
import { useContentDetails, useSimilarContent } from '@/services/hooks';
import { getImageUrl, BACKDROP_SIZE } from '@/lib/images';
import { Header } from '@/components/header';
import Image from 'next/image';
import { ContentDetails } from '@/components/content-details';
import { notFound } from 'next/navigation';

export default function ContentDetailsPage({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = React.use(params);
  const [type, id] = resolvedParams.id;

  if (type !== 'movie' && type !== 'tv') {
    notFound();
  }

  // Fetch content details using API hook
  const { data: item, isLoading: isLoadingDetails, error: detailsError } = useContentDetails({
    id,
    type: type as 'movie' | 'tv',
  });

  // Fetch similar content using API hook
  const { data: similarContent = [], isLoading: isLoadingSimilar } = useSimilarContent({
    id,
    type: type as 'movie' | 'tv',
  });

  // Show loading state
  if (isLoadingDetails) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="text-xl">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (detailsError) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="text-xl text-red-500">Error: {detailsError.message}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show not found if no item
  if (!item) {
    notFound();
  }
  
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
          <ContentDetails 
            item={item} 
            similarContent={similarContent}
          />
        </div>
      </main>
    </div>
  );
}
