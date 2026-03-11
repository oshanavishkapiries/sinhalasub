
'use client'
import { useState } from 'react';
import type { TVSeason } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTVSeason } from '@/services/hooks';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { EpisodeCard } from './episode-card';


interface TVSeasonsProps {
    seasons: TVSeason[];
    tvShowId: number;
}


export function TVSeasons({ seasons, tvShowId }: TVSeasonsProps) {
    const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(seasons[0]?.season_number || 1);

    // Fetch episodes for selected season
    const { data: seasonData, isLoading } = useTVSeason({ 
        tvId: tvShowId, 
        seasonNumber: selectedSeasonNumber 
    });

    const episodes = seasonData?.episodes || [];
    const selectedSeason = seasons.find(s => s.season_number === selectedSeasonNumber);

    const handleSeasonChange = (seasonNumber: string) => {
        setSelectedSeasonNumber(parseInt(seasonNumber));
    };

    if (!selectedSeason) {
        return <p>No seasons available for this show.</p>
    }

    return (
        <div>
            <Select onValueChange={handleSeasonChange} defaultValue={selectedSeasonNumber.toString()}>
                <SelectTrigger className="w-[280px] text-lg mb-6">
                    <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent>
                    {seasons.map(season => (
                        <SelectItem key={season.id} value={season.season_number.toString()}>
                            {season.name} ({season.episode_count} episodes)
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isLoading ? (
                <p>Loading episodes...</p>
            ) : (
                <Carousel
                    opts={{
                    align: "start",
                    dragFree: true,
                    }}
                    className="group relative"
                >
                    <CarouselContent className="-ml-2">
                        {episodes.map(episode => (
                            <CarouselItem key={episode.id} className="pl-2 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <EpisodeCard episode={episode} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
                    <CarouselNext className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100" />
                </Carousel>
            )}
        </div>
    )
}
