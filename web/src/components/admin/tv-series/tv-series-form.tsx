'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchTVSeries, getTVSeriesDetails, TMDBSearchResult } from '@/services/tmdb-mock';
import { TVSeries, TVSeason, TVEpisode, EpisodeStreamLink, EpisodeDownload, StreamProvider, DownloadProvider } from '@/types/admin';

interface TVSeriesFormProps {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

// Mock providers
const STREAM_PROVIDERS: StreamProvider[] = [
  { id: 1, name: 'Vidsrc', has_ads: false },
  { id: 2, name: 'Embedstream', has_ads: false },
  { id: 3, name: 'Doodstream', has_ads: true },
  { id: 4, name: 'Streamtape', has_ads: true },
  { id: 5, name: 'Upstream', has_ads: false },
];

const DOWNLOAD_PROVIDERS: DownloadProvider[] = [
  { id: 1, name: 'Google Drive' },
  { id: 2, name: 'MEGA' },
  { id: 3, name: 'MediaFire' },
  { id: 4, name: 'Dropbox' },
  { id: 5, name: 'OneDrive' },
];

const QUALITY_OPTIONS: Array<'360p' | '480p' | '720p' | '1080p' | '4K'> = [
  '360p',
  '480p',
  '720p',
  '1080p',
  '4K',
];

const PLAYER_TYPES = [
  { value: 'iframe', label: 'IFrame Player' },
  { value: 'video', label: 'Video Player' },
  { value: 'custom', label: 'Custom Player' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function TVSeriesForm({ data, onUpdate }: TVSeriesFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'search' | 'details' | 'seasons'>('search');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-search when debounced query changes
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const results = await searchTVSeries(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectSeries = async (tmdbId: number) => {
    setIsLoading(true);
    try {
      const details = await getTVSeriesDetails(tmdbId);
      if (details) {
        const transformedData: Partial<TVSeries> = {
          ...details,
          seasons: details.seasons.map(season => ({
            ...season,
            is_visible: true,
            episodes: season.episodes.map(episode => ({
              ...episode,
              is_visible: true,
              stream_links: [],
              downloads: []
            }))
          }))
        };
        onUpdate(transformedData);
        setSearchResults([]);
        setSearchQuery('');
        setCurrentStep('details');
      }
    } catch (error) {
      console.error('Error loading series details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePosterUrl = (index: number, value: string) => {
    const newPosters = [...(data.poster_urls || ['', '', ''])];
    newPosters[index] = value;
    onUpdate({ ...data, poster_urls: newPosters });
  };

  const updateBackdropUrl = (index: number, value: string) => {
    const newBackdrops = [...(data.backdrop_urls || ['', '', ''])];
    newBackdrops[index] = value;
    onUpdate({ ...data, backdrop_urls: newBackdrops });
  };

  const toggleSeasonVisibility = (seasonIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    newSeasons[seasonIndex].is_visible = !newSeasons[seasonIndex].is_visible;
    onUpdate({ ...data, seasons: newSeasons });
  };

  const toggleEpisodeVisibility = (seasonIndex: number, episodeIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    newSeasons[seasonIndex].episodes[episodeIndex].is_visible = 
      !newSeasons[seasonIndex].episodes[episodeIndex].is_visible;
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateSeason = (seasonIndex: number, updates: Partial<TVSeason>) => {
    const newSeasons = [...(data.seasons || [])];
    newSeasons[seasonIndex] = { ...newSeasons[seasonIndex], ...updates };
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateEpisode = (seasonIndex: number, episodeIndex: number, updates: Partial<TVEpisode>) => {
    const newSeasons = [...(data.seasons || [])];
    newSeasons[seasonIndex].episodes[episodeIndex] = {
      ...newSeasons[seasonIndex].episodes[episodeIndex],
      ...updates
    };
    onUpdate({ ...data, seasons: newSeasons });
  };

  const addStreamLink = (seasonIndex: number, episodeIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    const newLink: EpisodeStreamLink = {
      provider_id: 1,
      stream_url: '',
      player_type: 'iframe',
    };
    episode.stream_links = [...(episode.stream_links || []), newLink];
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateStreamLink = (
    seasonIndex: number,
    episodeIndex: number,
    linkIndex: number,
    updates: Partial<EpisodeStreamLink>
  ) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    episode.stream_links[linkIndex] = { ...episode.stream_links[linkIndex], ...updates };
    onUpdate({ ...data, seasons: newSeasons });
  };

  const removeStreamLink = (seasonIndex: number, episodeIndex: number, linkIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    episode.stream_links = episode.stream_links.filter((_, i) => i !== linkIndex);
    onUpdate({ ...data, seasons: newSeasons });
  };

  const addDownloadLink = (seasonIndex: number, episodeIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    const newLink: EpisodeDownload = {
      provider_id: 1,
      quality: '720p',
      file_size: '',
      download_url: '',
    };
    episode.downloads = [...(episode.downloads || []), newLink];
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateDownloadLink = (
    seasonIndex: number,
    episodeIndex: number,
    linkIndex: number,
    updates: Partial<EpisodeDownload>
  ) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    episode.downloads[linkIndex] = { ...episode.downloads[linkIndex], ...updates };
    onUpdate({ ...data, seasons: newSeasons });
  };

  const removeDownloadLink = (seasonIndex: number, episodeIndex: number, linkIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const episode = newSeasons[seasonIndex].episodes[episodeIndex];
    episode.downloads = episode.downloads.filter((_, i) => i !== linkIndex);
    onUpdate({ ...data, seasons: newSeasons });
  };

  // Step 1: Search for TV Series
  if (currentStep === 'search') {
    return (
      <div className="space-y-8">
        <div className="border border-border rounded-lg bg-card p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Search TV Series</h3>
            <p className="text-muted-foreground text-sm">
              Find and select a TV series from TMDB to begin
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Input
                placeholder="Search for a TV series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSearching && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            )}
          </div>

          {/* Search Results - Grid Layout with Poster Previews */}
          {searchQuery && searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto scrollbar-hide">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelectSeries(result.id)}
                  className="border border-border rounded-lg bg-background overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                >
                  {/* Poster Image */}
                  {result.poster_path ? (
                    <img
                      src={result.poster_path}
                      alt={result.name}
                      className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-48 bg-white/5 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}
                  
                  {/* Details Overlay */}
                  <div className="p-3 space-y-1">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-2">{result.name}</h4>
                    {result.original_name !== result.name && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{result.original_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {result.first_air_date ? result.first_air_date.split('-')[0] : 'N/A'} • ⭐ {result.vote_average.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results Message */}
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Search className="w-8 h-8 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">No TV series found for "{searchQuery}"</p>
              <p className="text-muted-foreground text-xs">Try searching with a different name</p>
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Search className="w-8 h-8 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">Start by searching for a TV series</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading series details...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Series Details
  if (currentStep === 'details') {
    return (
      <div className="space-y-8">
        {/* Selected Series Info */}
        <div className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Series Information</h3>
              <p className="text-muted-foreground text-sm mt-1">Verify and update series details</p>
            </div>
            <Button
              onClick={() => setCurrentStep('search')}
              variant="outline"
              className="border-border text-foreground hover:bg-white/5 text-sm"
            >
              Change Series
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-muted-foreground text-sm">Title</Label>
              <Input
                value={data.name || ''}
                onChange={(e) => onUpdate({ ...data, name: e.target.value })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Original Title</Label>
              <Input
                value={data.original_name || ''}
                onChange={(e) => onUpdate({ ...data, original_name: e.target.value })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">First Air Date</Label>
              <Input
                type="date"
                value={data.first_air_date || ''}
                onChange={(e) => onUpdate({ ...data, first_air_date: e.target.value })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Status</Label>
              <Input
                value={data.status || ''}
                onChange={(e) => onUpdate({ ...data, status: e.target.value })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">TMDB ID</Label>
              <Input
                value={data.tmdb_id || ''}
                disabled
                className="bg-background border-border text-muted-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">IMDB ID</Label>
              <Input
                value={data.imdb_id || ''}
                onChange={(e) => onUpdate({ ...data, imdb_id: e.target.value })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Rating</Label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={data.vote_average || ''}
                onChange={(e) => onUpdate({ ...data, vote_average: parseFloat(e.target.value) })}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Trailer Link</Label>
              <Input
                type="url"
                value={data.trailer_link || ''}
                onChange={(e) => onUpdate({ ...data, trailer_link: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-background border-border text-foreground mt-2"
              />
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-muted-foreground text-sm">Overview</Label>
            <Textarea
              value={data.overview || ''}
              onChange={(e) => onUpdate({ ...data, overview: e.target.value })}
              rows={4}
              className="bg-background border-border text-foreground mt-2"
            />
          </div>

          <div className="mb-6">
            <Label className="text-muted-foreground text-sm">Tagline</Label>
            <Input
              value={data.tagline || ''}
              onChange={(e) => onUpdate({ ...data, tagline: e.target.value })}
              className="bg-background border-border text-foreground mt-2"
            />
          </div>

          {/* Poster URLs */}
          <div className="mb-6">
            <Label className="text-muted-foreground text-sm mb-3 block">Poster Images (3 URLs)</Label>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <Input
                    value={data.poster_urls?.[index] || ''}
                    onChange={(e) => updatePosterUrl(index, e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                    className="bg-background border-border text-foreground text-sm"
                  />
                  {data.poster_urls?.[index] && (
                    <img
                      src={data.poster_urls[index]}
                      alt={`Poster ${index + 1}`}
                      className="w-full h-32 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backdrop URLs */}
          <div className="mb-6">
            <Label className="text-muted-foreground text-sm mb-3 block">Backdrop Images (3 URLs)</Label>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <Input
                    value={data.backdrop_urls?.[index] || ''}
                    onChange={(e) => updateBackdropUrl(index, e.target.value)}
                    placeholder="https://example.com/backdrop.jpg"
                    className="bg-background border-border text-foreground text-sm"
                  />
                  {data.backdrop_urls?.[index] && (
                    <img
                      src={data.backdrop_urls[index]}
                      alt={`Backdrop ${index + 1}`}
                      className="w-full h-24 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Genres */}
          {data.genres && data.genres.length > 0 && (
            <div>
              <Label className="text-muted-foreground text-sm mb-3 block">Genres</Label>
              <div className="flex flex-wrap gap-2">
                {data.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => setCurrentStep('search')}
            variant="outline"
            className="border-border text-foreground hover:bg-white/5"
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep('seasons')}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Step 3: Seasons & Episodes
  if (currentStep === 'seasons') {
    return (
      <div className="space-y-8">
        <div className="border border-border rounded-lg bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Seasons & Episodes</h3>
              <p className="text-muted-foreground text-sm mt-1">Manage seasons and episode stream/download links</p>
            </div>
          </div>

          {!data.seasons || data.seasons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No seasons found. Please go back and search for a TV series.
            </p>
          ) : (
            <Accordion type="multiple" className="space-y-3">
              {data.seasons.map((season, seasonIndex) => (
                <AccordionItem
                  key={seasonIndex}
                  value={`season-${seasonIndex}`}
                  className="border border-border rounded-lg bg-background/50 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {season.poster && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${season.poster}`}
                            alt={season.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="text-left">
                          <h4 className="font-semibold text-foreground">
                            {season.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {season.episodes?.length || 0} episodes
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSeasonVisibility(seasonIndex);
                        }}
                        variant="ghost"
                        size="sm"
                        className={`${
                          season.is_visible
                            ? 'text-primary hover:text-primary'
                            : 'text-muted-foreground hover:text-muted-foreground'
                        } hover:bg-white/10`}
                      >
                        {season.is_visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-2">
                    {/* Season Details */}
                    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-card rounded-lg border border-border">
                      <div>
                        <Label className="text-xs text-muted-foreground">Season Number</Label>
                        <Input
                          type="number"
                          value={season.season_number}
                          onChange={(e) =>
                            updateSeason(seasonIndex, {
                              season_number: parseInt(e.target.value)
                            })
                          }
                          className="bg-background border-border text-foreground mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <Input
                          value={season.title}
                          onChange={(e) =>
                            updateSeason(seasonIndex, { title: e.target.value })
                          }
                          className="bg-background border-border text-foreground mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Air Date</Label>
                        <Input
                          type="date"
                          value={season.air_date || ''}
                          onChange={(e) =>
                            updateSeason(seasonIndex, { air_date: e.target.value })
                          }
                          className="bg-background border-border text-foreground mt-1 text-sm"
                        />
                      </div>
                    </div>

                    {/* Episodes */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-semibold text-foreground">Episodes</h5>
                      {season.episodes?.map((episode, episodeIndex) => (
                        <div key={episodeIndex} className="border border-border rounded-lg bg-background p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                Episode {episode.episode_number}: {episode.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{episode.overview}</p>
                            </div>
                            <Button
                              onClick={() => toggleEpisodeVisibility(seasonIndex, episodeIndex)}
                              variant="ghost"
                              size="sm"
                              className={`${
                                episode.is_visible
                                  ? 'text-primary hover:text-primary'
                                  : 'text-muted-foreground hover:text-muted-foreground'
                              } hover:bg-white/10`}
                            >
                              {episode.is_visible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {/* Episode Title & Overview */}
                          <div className="grid grid-cols-2 gap-2 bg-card p-2 rounded">
                            <Input
                              placeholder="Episode title"
                              value={episode.title}
                              onChange={(e) =>
                                updateEpisode(seasonIndex, episodeIndex, { title: e.target.value })
                              }
                              className="bg-background border-border text-foreground text-xs"
                            />
                            <Input
                              placeholder="Thumbnail URL"
                              value={episode.thumbnail}
                              onChange={(e) =>
                                updateEpisode(seasonIndex, episodeIndex, { thumbnail: e.target.value })
                              }
                              className="bg-background border-border text-foreground text-xs"
                            />
                          </div>

                          {/* Stream Links */}
                          <div className="bg-card p-3 rounded border border-border space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-foreground">Stream Links</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addStreamLink(seasonIndex, episodeIndex)}
                                className="text-primary hover:bg-primary/10 h-auto p-1"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                            {episode.stream_links?.map((link, linkIndex) => (
                              <div key={linkIndex} className="flex gap-2 items-end">
                                <Select
                                  value={String(link.provider_id)}
                                  onValueChange={(value) =>
                                    updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                      provider_id: parseInt(value)
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {STREAM_PROVIDERS.map((p) => (
                                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                        {p.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={link.player_type}
                                  onValueChange={(value) =>
                                    updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                      player_type: value as any
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PLAYER_TYPES.map((p) => (
                                      <SelectItem key={p.value} value={p.value} className="text-xs">
                                        {p.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="Stream URL"
                                  value={link.stream_url}
                                  onChange={(e) =>
                                    updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                      stream_url: e.target.value
                                    })
                                  }
                                  className="flex-1 h-8 text-xs bg-background border-border"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeStreamLink(seasonIndex, episodeIndex, linkIndex)}
                                  className="h-8 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>

                          {/* Download Links */}
                          <div className="bg-card p-3 rounded border border-border space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-foreground">Download Links</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addDownloadLink(seasonIndex, episodeIndex)}
                                className="text-primary hover:bg-primary/10 h-auto p-1"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                            </div>
                            {episode.downloads?.map((download, downloadIndex) => (
                              <div key={downloadIndex} className="flex gap-2 items-end">
                                <Select
                                  value={String(download.provider_id)}
                                  onValueChange={(value) =>
                                    updateDownloadLink(seasonIndex, episodeIndex, downloadIndex, {
                                      provider_id: parseInt(value)
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-28 h-8 text-xs bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOWNLOAD_PROVIDERS.map((p) => (
                                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                                        {p.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={download.quality}
                                  onValueChange={(value) =>
                                    updateDownloadLink(seasonIndex, episodeIndex, downloadIndex, {
                                      quality: value as any
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-20 h-8 text-xs bg-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {QUALITY_OPTIONS.map((q) => (
                                      <SelectItem key={q} value={q} className="text-xs">
                                        {q}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  placeholder="File size"
                                  value={download.file_size}
                                  onChange={(e) =>
                                    updateDownloadLink(seasonIndex, episodeIndex, downloadIndex, {
                                      file_size: e.target.value
                                    })
                                  }
                                  className="w-20 h-8 text-xs bg-background border-border"
                                />
                                <Input
                                  placeholder="Download URL"
                                  value={download.download_url}
                                  onChange={(e) =>
                                    updateDownloadLink(seasonIndex, episodeIndex, downloadIndex, {
                                      download_url: e.target.value
                                    })
                                  }
                                  className="flex-1 h-8 text-xs bg-background border-border"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeDownloadLink(seasonIndex, episodeIndex, downloadIndex)}
                                  className="h-8 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentStep('details')}
            variant="outline"
            className="border-border text-foreground hover:bg-white/5"
          >
            Back
          </Button>
          <div className="text-sm text-muted-foreground">
            Step 3 of 3
          </div>
        </div>
      </div>
    );
  }

  return null;
}
