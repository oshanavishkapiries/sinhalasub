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
import { TVSeries, EpisodeDownload, DownloadProvider } from '@/types/admin';

interface Step5Props {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

// Mock download providers
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

export function Step5DownloadLinks({ data, onUpdate }: Step5Props) {
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(0);

  const currentSeason = data.seasons?.[selectedSeason];
  const currentEpisode = currentSeason?.episodes?.[selectedEpisode];

  const addDownloadLink = () => {
    if (!currentEpisode) return;

    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    const newDownload: EpisodeDownload = {
      provider_id: 1,
      quality: '720p',
      file_size: '',
      download_url: '',
    };

    episode.downloads = [...(episode.downloads || []), newDownload];
    onUpdate({ ...data, seasons: newSeasons });
  };

  const updateDownloadLink = (linkIndex: number, updates: Partial<EpisodeDownload>) => {
    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    episode.downloads[linkIndex] = {
      ...episode.downloads[linkIndex],
      ...updates,
    };

    onUpdate({ ...data, seasons: newSeasons });
  };

  const removeDownloadLink = (linkIndex: number) => {
    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    const episode = season.episodes[selectedEpisode];

    episode.downloads = episode.downloads.filter((_, i) => i !== linkIndex);
    onUpdate({ ...data, seasons: newSeasons });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Manage Download Links
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add download links for each episode. You can add multiple quality options
          and providers per episode.
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
                  <h4 className="font-medium text-foreground">Download Links</h4>
                  <Button
                    onClick={addDownloadLink}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Download Link
                  </Button>
                </div>

                {!currentEpisode.downloads || currentEpisode.downloads.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No download links added yet. Click the button above to add one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentEpisode.downloads.map((link, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-4 bg-background/50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-sm font-medium text-foreground">
                            Download Link #{index + 1}
                          </h5>
                          <Button
                            onClick={() => removeDownloadLink(index)}
                            size="sm"
                            variant="ghost"
                            className="text-accent hover:text-accent hover:bg-accent/10 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              Provider
                            </Label>
                            <Select
                              value={link.provider_id.toString()}
                              onValueChange={(value) =>
                                updateDownloadLink(index, {
                                  provider_id: parseInt(value),
                                })
                              }
                            >
                              <SelectTrigger className="bg-card border-border text-foreground mt-1">
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
                            <Label className="text-muted-foreground text-xs">
                              Quality
                            </Label>
                            <Select
                              value={link.quality}
                              onValueChange={(value: any) =>
                                updateDownloadLink(index, { quality: value })
                              }
                            >
                              <SelectTrigger className="bg-card border-border text-foreground mt-1">
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
                            <Label className="text-muted-foreground text-xs">
                              File Size
                            </Label>
                            <Input
                              value={link.file_size}
                              onChange={(e) =>
                                updateDownloadLink(index, {
                                  file_size: e.target.value,
                                })
                              }
                              placeholder="e.g., 450 MB"
                              className="bg-card border-border text-foreground mt-1"
                            />
                          </div>

                          <div className="col-span-3">
                            <Label className="text-muted-foreground text-xs">
                              Download URL
                            </Label>
                            <Input
                              value={link.download_url}
                              onChange={(e) =>
                                updateDownloadLink(index, {
                                  download_url: e.target.value,
                                })
                              }
                              placeholder="https://example.com/download/..."
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
