'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TVSeries, EpisodeStreamLink, StreamProvider } from '@/types/admin';

interface Step4Props {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

// Mock stream providers
const STREAM_PROVIDERS: StreamProvider[] = [
  { id: 1, name: 'Vidsrc', has_ads: false },
  { id: 2, name: 'Embedstream', has_ads: false },
  { id: 3, name: 'Doodstream', has_ads: true },
  { id: 4, name: 'Streamtape', has_ads: true },
  { id: 5, name: 'Upstream', has_ads: false },
];

const PLAYER_TYPES = [
  { value: 'iframe', label: 'IFrame Player' },
  { value: 'video', label: 'Video Player' },
  { value: 'custom', label: 'Custom Player' },
];

export function Step4StreamLinks({ data, onUpdate }: Step4Props) {
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  const currentSeason = data.seasons?.[selectedSeason];
  const currentEpisode = currentSeason?.episodes?.[selectedEpisode];

  const addStreamLink = () => {
    if (!currentEpisode) return;

    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    const newStreamLink: EpisodeStreamLink = {
      provider_id: 1,
      stream_url: '',
      player_type: 'iframe',
    };

    episode.stream_links = [...(episode.stream_links || []), newStreamLink];
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateStreamLink = (linkIndex: number, updates: Partial<EpisodeStreamLink>) => {
    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    episode.stream_links[linkIndex] = {
      ...episode.stream_links[linkIndex],
      ...updates,
    };

    onUpdate({ ...data, seasons: newSeasons });
  };

  const removeStreamLink = (linkIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    episode.stream_links = episode.stream_links.filter((_, i) => i !== linkIndex);
    onUpdate({ ...data, seasons: newSeasons });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Manage Stream Links
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add streaming links for each episode. You can add multiple stream providers
          per episode.
        </p>
      </div>

      {!data.seasons || data.seasons.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No seasons found. Please complete previous steps first.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Select Season</Label>
              <Select
                value={selectedSeason.toString()}
                onValueChange={(value) => {
                  setSelectedSeason(parseInt(value));
                  setSelectedEpisode(0);
                }}
              >
                <SelectTrigger className="bg-card border-border text-foreground mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {data.seasons.map((season, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      {season.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-muted-foreground">Select Episode</Label>
              <Select
                value={selectedEpisode.toString()}
                onValueChange={(value) => setSelectedEpisode(parseInt(value))}
              >
                <SelectTrigger className="bg-card border-border text-foreground mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground max-h-80 scrollbar-hide">
                  {currentSeason?.episodes?.map((episode, index) => (
                    <SelectItem
                      key={index}
                      value={index.toString()}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      E{episode.episode_number}: {episode.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentEpisode && (
            <div className="border border-border rounded-lg bg-card p-4">
              <div className="flex items-start gap-4 mb-6">
                {currentEpisode.thumbnail && (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${currentEpisode.thumbnail}`}
                    alt={currentEpisode.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    Episode {currentEpisode.episode_number}: {currentEpisode.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentEpisode.overview}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Stream Links</h4>
                  <Button
                    onClick={addStreamLink}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stream Link
                  </Button>
                </div>

                {!currentEpisode.stream_links || currentEpisode.stream_links.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No stream links added yet. Click the button above to add one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentEpisode.stream_links.map((link, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 bg-background/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-sm font-medium text-foreground">
                            Stream Link #{index + 1}
                          </h5>
                          <Button
                            onClick={() => removeStreamLink(index)}
                            size="sm"
                            variant="ghost"
                            className="text-accent hover:text-accent hover:bg-accent/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              Provider
                            </Label>
                            <Select
                              value={link.provider_id.toString()}
                              onValueChange={(value) =>
                                updateStreamLink(index, {
                                  provider_id: parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger className="bg-card border-border text-foreground mt-1">
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
                                    {provider.has_ads && ' (Ads)'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-muted-foreground text-xs">
                              Player Type
                            </Label>
                            <Select
                              value={link.player_type}
                              onValueChange={(value: any) =>
                                updateStreamLink(index, { player_type: value })
                              }
                            >
                              <SelectTrigger className="bg-card border-border text-foreground mt-1">
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

                          <div className="col-span-2">
                            <Label className="text-muted-foreground text-xs">
                              Stream URL
                            </Label>
                            <Input
                              value={link.stream_url}
                              onChange={(e) =>
                                updateStreamLink(index, {
                                  stream_url: e.target.value,
                                })
                              }
                              placeholder="https://example.com/stream/..."
                              className="bg-card border-border text-foreground mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
