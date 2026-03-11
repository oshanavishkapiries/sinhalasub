'use client';

import React, { useState } from 'react';
import { Search, Loader2, Plus, Trash2, Eye, EyeOff, ChevronDown } from 'lucide-react';
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

export function TVSeriesForm({ data, onUpdate }: TVSeriesFormProps) {
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

  return (
    <div className="space-y-8">
      {/* TMDB Search Section */}
      <div className="border border-border rounded-lg bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Search TMDB for TV Series
        </h3>

        <div className="flex gap-2">
          <Input
            placeholder="Search for a TV series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
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
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto scrollbar-hide border border-border rounded-lg bg-background p-4">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelectSeries(result.id)}
                className="flex gap-4 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-border"
              >
                {result.poster_path && (
                  <img
                    src={result.poster_path}
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

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading series details...</span>
          </div>
        )}
      </div>

      {data.tmdb_id && !isLoading && (
        <>
          {/* Basic Information Section */}
          <div className="border border-border rounded-lg bg-card p-6 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">
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

            {/* Poster URLs */}
            <div>
              <Label className="text-muted-foreground">Poster Images (3 URLs)</Label>
              <div className="space-y-3 mt-2">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground w-20">Poster {index + 1}</span>
                    </div>
                    <Input
                      value={data.poster_urls?.[index] || ''}
                      onChange={(e) => updatePosterUrl(index, e.target.value)}
                      placeholder="https://example.com/poster.jpg"
                      className="bg-card border-border text-foreground"
                    />
                    {data.poster_urls?.[index] && (
                      <img
                        src={data.poster_urls[index]}
                        alt={`Poster ${index + 1}`}
                        className="mt-2 w-32 rounded"
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
            <div>
              <Label className="text-muted-foreground">Backdrop Images (3 URLs)</Label>
              <div className="space-y-3 mt-2">
                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground w-20">Backdrop {index + 1}</span>
                    </div>
                    <Input
                      value={data.backdrop_urls?.[index] || ''}
                      onChange={(e) => updateBackdropUrl(index, e.target.value)}
                      placeholder="https://example.com/backdrop.jpg"
                      className="bg-card border-border text-foreground"
                    />
                    {data.backdrop_urls?.[index] && (
                      <img
                        src={data.backdrop_urls[index]}
                        alt={`Backdrop ${index + 1}`}
                        className="mt-2 w-full max-w-md rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
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

          {/* Seasons Accordion */}
          <div className="border border-border rounded-lg bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Seasons & Episodes
            </h3>

            {!data.seasons || data.seasons.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No seasons found. Search and select a TV series from TMDB above.
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
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <Input
                            value={season.title}
                            onChange={(e) =>
                              updateSeason(seasonIndex, { title: e.target.value })
                            }
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                      </div>

                      {/* Episodes Accordion */}
                      <Accordion type="multiple" className="space-y-2">
                        {season.episodes?.map((episode, episodeIndex) => (
                          <AccordionItem
                            key={episodeIndex}
                            value={`episode-${seasonIndex}-${episodeIndex}`}
                            className="border border-border rounded-lg bg-card"
                          >
                            <AccordionTrigger className="px-3 py-2 hover:bg-white/5 transition-colors">
                              <div className="flex items-center justify-between w-full pr-3">
                                <div className="flex items-center gap-2">
                                  {episode.thumbnail && (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w92${episode.thumbnail}`}
                                      alt={episode.title}
                                      className="w-16 h-10 object-cover rounded"
                                    />
                                  )}
                                  <div className="text-left">
                                    <p className="text-sm font-medium text-foreground">
                                      E{episode.episode_number}: {episode.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {episode.stream_links?.length || 0} streams •{' '}
                                      {episode.downloads?.length || 0} downloads
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEpisodeVisibility(seasonIndex, episodeIndex);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className={`${
                                    episode.is_visible
                                      ? 'text-primary hover:text-primary'
                                      : 'text-muted-foreground hover:text-muted-foreground'
                                  } hover:bg-white/10`}
                                >
                                  {episode.is_visible ? (
                                    <Eye className="w-3 h-3" />
                                  ) : (
                                    <EyeOff className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              {/* Episode Details */}
                              <div className="space-y-3 mb-4 p-3 bg-background/50 rounded-lg border border-border">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Episode #</Label>
                                    <Input
                                      type="number"
                                      value={episode.episode_number}
                                      onChange={(e) =>
                                        updateEpisode(seasonIndex, episodeIndex, {
                                          episode_number: parseInt(e.target.value)
                                        })
                                      }
                                      className="bg-card border-border text-foreground mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">Title</Label>
                                    <Input
                                      value={episode.title}
                                      onChange={(e) =>
                                        updateEpisode(seasonIndex, episodeIndex, {
                                          title: e.target.value
                                        })
                                      }
                                      className="bg-card border-border text-foreground mt-1"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Overview</Label>
                                  <Textarea
                                    value={episode.overview}
                                    onChange={(e) =>
                                      updateEpisode(seasonIndex, episodeIndex, {
                                        overview: e.target.value
                                      })
                                    }
                                    rows={2}
                                    className="bg-card border-border text-foreground mt-1"
                                  />
                                </div>
                              </div>

                              {/* Stream Links */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm text-foreground">Stream Links</Label>
                                  <Button
                                    onClick={() => addStreamLink(seasonIndex, episodeIndex)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-white h-7 text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Stream
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {episode.stream_links?.map((link, linkIndex) => (
                                    <div
                                      key={linkIndex}
                                      className="p-2 bg-background/50 rounded border border-border"
                                    >
                                      <div className="grid grid-cols-3 gap-2 mb-2">
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Provider</Label>
                                          <Select
                                            value={link.provider_id.toString()}
                                            onValueChange={(value) =>
                                              updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                                provider_id: parseInt(value)
                                              })
                                            }
                                          >
                                            <SelectTrigger className="bg-card border-border text-foreground h-8 text-xs mt-1">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                              {STREAM_PROVIDERS.map((provider) => (
                                                <SelectItem
                                                  key={provider.id}
                                                  value={provider.id.toString()}
                                                  className="hover:bg-white/10 focus:bg-white/10"
                                                >
                                                  {provider.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Player Type</Label>
                                          <Select
                                            value={link.player_type}
                                            onValueChange={(value: any) =>
                                              updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                                player_type: value
                                              })
                                            }
                                          >
                                            <SelectTrigger className="bg-card border-border text-foreground h-8 text-xs mt-1">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                              {PLAYER_TYPES.map((type) => (
                                                <SelectItem
                                                  key={type.value}
                                                  value={type.value}
                                                  className="hover:bg-white/10 focus:bg-white/10"
                                                >
                                                  {type.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-end">
                                          <Button
                                            onClick={() =>
                                              removeStreamLink(seasonIndex, episodeIndex, linkIndex)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="text-accent hover:text-accent hover:bg-accent/10 h-8 w-full"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Stream URL</Label>
                                        <Input
                                          value={link.stream_url}
                                          onChange={(e) =>
                                            updateStreamLink(seasonIndex, episodeIndex, linkIndex, {
                                              stream_url: e.target.value
                                            })
                                          }
                                          placeholder="https://..."
                                          className="bg-card border-border text-foreground h-8 text-xs mt-1"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                  {(!episode.stream_links || episode.stream_links.length === 0) && (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                      No stream links added
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Download Links */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label className="text-sm text-foreground">Download Links</Label>
                                  <Button
                                    onClick={() => addDownloadLink(seasonIndex, episodeIndex)}
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-white h-7 text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Download
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {episode.downloads?.map((link, linkIndex) => (
                                    <div
                                      key={linkIndex}
                                      className="p-2 bg-background/50 rounded border border-border"
                                    >
                                      <div className="grid grid-cols-4 gap-2 mb-2">
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Provider</Label>
                                          <Select
                                            value={link.provider_id.toString()}
                                            onValueChange={(value) =>
                                              updateDownloadLink(seasonIndex, episodeIndex, linkIndex, {
                                                provider_id: parseInt(value)
                                              })
                                            }
                                          >
                                            <SelectTrigger className="bg-card border-border text-foreground h-8 text-xs mt-1">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                              {DOWNLOAD_PROVIDERS.map((provider) => (
                                                <SelectItem
                                                  key={provider.id}
                                                  value={provider.id.toString()}
                                                  className="hover:bg-white/10 focus:bg-white/10"
                                                >
                                                  {provider.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">Quality</Label>
                                          <Select
                                            value={link.quality}
                                            onValueChange={(value: any) =>
                                              updateDownloadLink(seasonIndex, episodeIndex, linkIndex, {
                                                quality: value
                                              })
                                            }
                                          >
                                            <SelectTrigger className="bg-card border-border text-foreground h-8 text-xs mt-1">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border text-foreground">
                                              {QUALITY_OPTIONS.map((quality) => (
                                                <SelectItem
                                                  key={quality}
                                                  value={quality}
                                                  className="hover:bg-white/10 focus:bg-white/10"
                                                >
                                                  {quality}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label className="text-xs text-muted-foreground">File Size</Label>
                                          <Input
                                            value={link.file_size}
                                            onChange={(e) =>
                                              updateDownloadLink(seasonIndex, episodeIndex, linkIndex, {
                                                file_size: e.target.value
                                              })
                                            }
                                            placeholder="450 MB"
                                            className="bg-card border-border text-foreground h-8 text-xs mt-1"
                                          />
                                        </div>
                                        <div className="flex items-end">
                                          <Button
                                            onClick={() =>
                                              removeDownloadLink(seasonIndex, episodeIndex, linkIndex)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="text-accent hover:text-accent hover:bg-accent/10 h-8 w-full"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-muted-foreground">Download URL</Label>
                                        <Input
                                          value={link.download_url}
                                          onChange={(e) =>
                                            updateDownloadLink(seasonIndex, episodeIndex, linkIndex, {
                                              download_url: e.target.value
                                            })
                                          }
                                          placeholder="https://..."
                                          className="bg-card border-border text-foreground h-8 text-xs mt-1"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                  {(!episode.downloads || episode.downloads.length === 0) && (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                      No download links added
                                    </p>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </>
      )}
    </div>
  );
}
