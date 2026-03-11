'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { searchTVSeries, getTVSeriesDetails, TMDBSearchResult } from '@/services/tmdb-mock';
import { TVSeries } from '@/types/admin';

interface Step1Props {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

export function Step1TMDBSearch({ data, onUpdate }: Step1Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchTVSeries(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSeries = async (tmdbId: number) => {
    setIsLoading(true);
    try {
      const details = await getTVSeriesDetails(tmdbId);
      if (details) {
        // Transform TMDB data to our internal format
        const transformedData: Partial<TVSeries> = {
          ...details,
          seasons: details.seasons.map(season => ({
            ...season,
            episodes: season.episodes.map(episode => ({
              ...episode,
              stream_links: [],
              downloads: []
            }))
          }))
        };
        onUpdate(transformedData);
        setSearchResults([]);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error loading series details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Search TMDB for TV Series
        </h3>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search for a TV series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-2">Search</span>
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto scrollbar-hide border border-border rounded-lg bg-card p-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectSeries(result.id)}
                className="flex gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-border"
              >
                {result.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                    alt={result.name}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{result.name}</h4>
                  {result.original_name !== result.name && (
                    <p className="text-sm text-muted-foreground">
                      {result.original_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.first_air_date} • ⭐ {result.vote_average.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {result.overview}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading series details...</span>
        </div>
      )}

      {data.tmdb_id && !isLoading && (
        <div className="border border-border rounded-lg bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Series Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Title</Label>
              <Input
                value={data.name || ''}
                onChange={(e) => onUpdate({ ...data, name: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">Original Title</Label>
              <Input
                value={data.original_name || ''}
                onChange={(e) => onUpdate({ ...data, original_name: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">First Air Date</Label>
              <Input
                type="date"
                value={data.first_air_date || ''}
                onChange={(e) => onUpdate({ ...data, first_air_date: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">Status</Label>
              <Input
                value={data.status || ''}
                onChange={(e) => onUpdate({ ...data, status: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">TMDB ID</Label>
              <Input
                value={data.tmdb_id || ''}
                disabled
                className="bg-card border-border text-muted-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">IMDB ID</Label>
              <Input
                value={data.imdb_id || ''}
                onChange={(e) => onUpdate({ ...data, imdb_id: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">Rating</Label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={data.vote_average || ''}
                onChange={(e) => onUpdate({ ...data, vote_average: parseFloat(e.target.value) })}
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>

            <div>
              <Label className="text-muted-foreground">Trailer Link</Label>
              <Input
                type="url"
                value={data.trailer_link || ''}
                onChange={(e) => onUpdate({ ...data, trailer_link: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-card border-border text-foreground mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Overview</Label>
            <Textarea
              value={data.overview || ''}
              onChange={(e) => onUpdate({ ...data, overview: e.target.value })}
              rows={4}
              className="bg-card border-border text-foreground mt-1.5"
            />
          </div>

          <div>
            <Label className="text-muted-foreground">Tagline</Label>
            <Input
              value={data.tagline || ''}
              onChange={(e) => onUpdate({ ...data, tagline: e.target.value })}
              className="bg-card border-border text-foreground mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Poster Path</Label>
              <Input
                value={data.poster_path || ''}
                onChange={(e) => onUpdate({ ...data, poster_path: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
              {data.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w185${data.poster_path}`}
                  alt="Poster"
                  className="mt-2 w-32 rounded"
                />
              )}
            </div>

            <div>
              <Label className="text-muted-foreground">Backdrop Path</Label>
              <Input
                value={data.backdrop_path || ''}
                onChange={(e) => onUpdate({ ...data, backdrop_path: e.target.value })}
                className="bg-card border-border text-foreground mt-1.5"
              />
              {data.backdrop_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${data.backdrop_path}`}
                  alt="Backdrop"
                  className="mt-2 w-full rounded"
                />
              )}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Genres</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
