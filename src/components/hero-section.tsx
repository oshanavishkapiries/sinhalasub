
import type { Content } from '@/types';
import Image from 'next/image';
import { Button } from './ui/button';
import { Play, Info } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl, BACKDROP_SIZE } from '@/lib/tmdb';

interface HeroSectionProps {
  item: Content;
}

export function HeroSection({ item }: HeroSectionProps) {
  const title = item.title || item.name;
  return (
    <div className="relative h-[60vh] w-full md:h-[85vh]">
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(item.backdrop_path, BACKDROP_SIZE)}
          alt={title || 'Hero image'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>
      <div className="relative z-10 flex h-full items-end">
        <div className="container pb-12 md:pb-24">
          <div className="max-w-xl">
            <h1 className="font-headline text-4xl font-black md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-lg text-sm text-foreground/80 md:text-base">
              {item.overview}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Button size="lg">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play
              </Button>
              <Link href={`/content/${item.media_type}/${item.id}`}>
                <Button size="lg" variant="secondary">
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
