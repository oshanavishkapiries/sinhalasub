import type { Content } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ContentCard } from './content-card';

interface ContentCarouselProps {
  title: string;
  items: Content[];
}

export function ContentCarousel({ title, items }: ContentCarouselProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 font-headline text-2xl font-bold">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="group relative"
      >
        <CarouselContent className="-ml-2">
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className="basis-1/2 pl-2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <ContentCard item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
        <CarouselNext className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
      </Carousel>
    </section>
  );
}
