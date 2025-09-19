
'use client';

import type { Content } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { getImageUrl } from '@/lib/tmdb';

interface ContentCardProps {
  item: Content;
  className?: string;
}

export function ContentCard({ item, className }: ContentCardProps) {
    const title = item.title || item.name;
    const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A');

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Action for ${title}`);
  };

  return (
    <div className={cn('group relative h-full w-full', className)}>
      <Card className="overflow-hidden rounded-md transition-shadow duration-300 ease-in-out group-hover:z-20 group-hover:shadow-2xl">
        <div className="aspect-[2/3] w-full">
          <Image
            src={getImageUrl(item.poster_path)}
            alt={title || ''}
            width={500}
            height={750}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="invisible absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-background/90 via-background/50 to-transparent p-2 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
          <div></div>
          <div>
            <h3 className="text-md font-bold text-foreground">{title}</h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{releaseYear}</span>
              <span>•</span>
              <span>{item.vote_average.toFixed(1)} ★</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={handleActionClick}
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={handleActionClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <Link href={`/content/${item.media_type}/${item.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View details for {title}</span>
      </Link>
    </div>
  );
}
