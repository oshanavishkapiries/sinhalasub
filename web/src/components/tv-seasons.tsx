
'use client'
import { useState, useEffect } from 'react';
import type { TVSeason, Episode } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchTVSeason } from '@/lib/tmdb';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { EpisodeCard } from './episode-card';


interface TVSeasonsProps {
    seasons: TVSeason[];
    tvShowId: number;
}


export function TVSeasons({ seasons, tvShowId }: TVSeasonsProps) {
    const [selectedSeason, setSelectedSeason] = useState<TVSeason | null>(seasons[0] || null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedSeason) {
            const getSeasonData = async () => {
                setIsLoading(true);
                const seasonDetails = await fetchTVSeason(tvShowId, selectedSeason.season_number);
                setEpisodes(seasonDetails?.episodes || []);
                setIsLoading(false);
            };
            getSeasonData();
        }
    }, [selectedSeason, tvShowId]);

    const handleSeasonChange = (seasonNumber: string) => {
        const season = seasons.find(s => s.season_number.toString() === seasonNumber);
        setSelectedSeason(season || null);
    };

    if (!selectedSeason) {
        return <p>No seasons available for this show.</p>
    }

    return (
        <div>
            <Select onValueChange={handleSeasonChange} defaultValue={selectedSeason.season_number.toString()}>
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
