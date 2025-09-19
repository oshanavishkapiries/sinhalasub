
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ContentCard } from '@/components/content-card';
import type { Content, Genre } from '@/types';
import { fetchTVGenres, fetchDiscoverTV, fetchLanguages } from '@/lib/tmdb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categories = [
    { value: 'popular', label: 'Popular' },
    { value: 'top_rated', label: 'Top Rated' },
    { value: 'on_the_air', label: 'On The Air' },
];

type Language = {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export default function TvShowsPage() {
  const [tvShows, setTvShows] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all_languages');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getInitialData() {
      const [tvGenres, languages] = await Promise.all([
          fetchTVGenres(),
          fetchLanguages()
      ]);
      setGenres(tvGenres || []);
      setLanguages(languages || []);
    }
    getInitialData();
  }, []);
  
  useEffect(() => {
    async function getShows() {
        setIsLoading(true);
        const languageToFetch = selectedLanguage === 'all_languages' ? '' : selectedLanguage;
        const shows = await fetchDiscoverTV(selectedCategory, selectedGenres, languageToFetch);
        setTvShows(shows || []);
        setIsLoading(false);
    }
    getShows();
  }, [selectedCategory, selectedGenres, selectedLanguage]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
           <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="font-headline text-4xl font-bold">TV Shows</h1>
            <div className="flex items-center gap-4">
                <Select onValueChange={setSelectedCategory} defaultValue={selectedCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_languages">All Languages</SelectItem>
                        {languages.map(lang => (
                            <SelectItem key={lang.iso_639_1} value={lang.iso_639_1}>{lang.english_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="mb-8 flex flex-wrap gap-2">
            {genres.map(genre => (
                <Badge
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? 'default' : 'outline'}
                    onClick={() => toggleGenre(genre.id)}
                    className="cursor-pointer transition-colors px-4 py-2 text-sm"
                >
                    {genre.name}
                </Badge>
            ))}
          </div>

          {isLoading ? (
            <p className="text-center">Loading TV shows...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {tvShows.map(item => (
                <ContentCard key={item.id} item={item as Content} />
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
