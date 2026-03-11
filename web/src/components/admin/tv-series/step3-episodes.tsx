'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TVSeries, TVEpisode } from '@/types/admin';

interface Step3Props {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

export function Step3Episodes({ data, onUpdate }: Step3Props) {
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set());

  const toggleEpisode = (index: number) => {
    const newExpanded = new Set(expandedEpisodes);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEpisodes(newExpanded);
  };

  const updateEpisode = (episodeIndex: number, updates: Partial<TVEpisode>) => {
    const newSeasons = [...(data.seasons || [])];
    const season = newSeasons[selectedSeason];
    if (season) {
      const newEpisodes = [...(season.episodes || [])];
      newEpisodes[episodeIndex] = { ...newEpisodes[episodeIndex], ...updates };
      season.episodes = newEpisodes;
      onUpdate({ ...data, seasons: newSeasons });
    }
  };

  const currentSeason = data.seasons?.[selectedSeason];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Manage Episodes
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit episode information for each season.
        </p>
      </div>

      {!data.seasons || data.seasons.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No seasons found. Please complete Step 1 to import series data from TMDB.
          </p>
        </div>
      ) : (
        <>
          <div>
            <Label className="text-muted-foreground">Select Season</Label>
            <Select
              value={selectedSeason.toString()}
              onValueChange={(value) => {
                setSelectedSeason(parseInt(value));
                setExpandedEpisodes(new Set());
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
                    {season.title} ({season.episodes?.length || 0} episodes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentSeason && (
            <div className="space-y-3">
              {!currentSeason.episodes || currentSeason.episodes.length === 0 ? (
                <div className="text-center py-8 border border-border rounded-lg bg-card">
                  <p className="text-muted-foreground">
                    No episodes found for this season.
                  </p>
                </div>
              ) : (
                currentSeason.episodes.map((episode, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg bg-card overflow-hidden"
                  >
                    <div
                      onClick={() => toggleEpisode(index)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {expandedEpisodes.has(index) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        {episode.thumbnail && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${episode.thumbnail}`}
                            alt={episode.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            {episode.episode_number}. {episode.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {episode.overview}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {episode.stream_links?.length || 0} streams •{' '}
                        {episode.downloads?.length || 0} downloads
                      </div>
                    </div>

                    {expandedEpisodes.has(index) && (
                      <div className="p-4 border-t border-border bg-background/50 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">
                              Episode Number
                            </Label>
                            <Input
                              type="number"
                              value={episode.episode_number}
                              onChange={(e) =>
                                updateEpisode(index, {
                                  episode_number: parseInt(e.target.value)
                                })
                              }
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="text-muted-foreground">Title</Label>
                            <Input
                              value={episode.title}
                              onChange={(e) =>
                                updateEpisode(index, { title: e.target.value })
                              }
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="text-muted-foreground">Air Date</Label>
                            <Input
                              type="date"
                              value={episode.air_date || ''}
                              onChange={(e) =>
                                updateEpisode(index, { air_date: e.target.value })
                              }
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                          </div>

                          <div>
                            <Label className="text-muted-foreground">
                              Runtime (minutes)
                            </Label>
                            <Input
                              type="number"
                              value={episode.runtime || ''}
                              onChange={(e) =>
                                updateEpisode(index, {
                                  runtime: parseInt(e.target.value)
                                })
                              }
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-muted-foreground">Overview</Label>
                            <Textarea
                              value={episode.overview}
                              onChange={(e) =>
                                updateEpisode(index, { overview: e.target.value })
                              }
                              rows={3}
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-muted-foreground">
                              Thumbnail URL
                            </Label>
                            <Input
                              value={episode.thumbnail}
                              onChange={(e) =>
                                updateEpisode(index, { thumbnail: e.target.value })
                              }
                              placeholder="/path/to/thumbnail.jpg"
                              className="bg-card border-border text-foreground mt-1.5"
                            />
                            {episode.thumbnail && (
                              <img
                                src={`https://image.tmdb.org/t/p/w300${episode.thumbnail}`}
                                alt="Episode thumbnail"
                                className="mt-2 w-full max-w-md rounded"
                              />
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            Stream and download links for this episode will be managed in
                            Steps 4 and 5
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              {currentSeason?.title}:{' '}
              <span className="text-foreground font-semibold">
                {currentSeason?.episodes?.length || 0}
              </span>{' '}
              episodes
            </p>
          </div>
        </>
      )}
    </div>
  );
}
