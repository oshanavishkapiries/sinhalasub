'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TVSeries, TVSeason } from '@/types/admin';

interface Step2Props {
  data: Partial<TVSeries>;
  onUpdate: (data: Partial<TVSeries>) => void;
}

export function Step2Seasons({ data, onUpdate }: Step2Props) {
  const [expandedSeasons, setExpandedSeasons] = React.useState<Set<number>>(new Set([0]));

  const toggleSeason = (index: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSeasons(newExpanded);
  };

  const updateSeason = (index: number, updates: Partial<TVSeason>) => {
    const newSeasons = [...(data.seasons || [])];
    newSeasons[index] = { ...newSeasons[index], ...updates };
    onUpdate({ ...data, seasons: newSeasons });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Manage Seasons
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Review and edit season information. All seasons from TMDB have been imported.
        </p>
      </div>

      {!data.seasons || data.seasons.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No seasons found. Please complete Step 1 to import series data from TMDB.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.seasons.map((season, index) => (
            <div
              key={index}
              className="border border-border rounded-lg bg-card overflow-hidden"
            >
              <div
                onClick={() => toggleSeason(index)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedSeasons.has(index) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  {season.poster && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${season.poster}`}
                      alt={season.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {season.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {season.episode_count} episodes
                      {season.air_date && ` • ${season.air_date}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  Season {season.season_number}
                </span>
              </div>

              {expandedSeasons.has(index) && (
                <div className="p-4 border-t border-border bg-background/50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Season Number</Label>
                      <Input
                        type="number"
                        value={season.season_number}
                        onChange={(e) =>
                          updateSeason(index, {
                            season_number: parseInt(e.target.value)
                          })
                        }
                        className="bg-card border-border text-foreground mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Episode Count</Label>
                      <Input
                        type="number"
                        value={season.episode_count}
                        onChange={(e) =>
                          updateSeason(index, {
                            episode_count: parseInt(e.target.value)
                          })
                        }
                        className="bg-card border-border text-foreground mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <Input
                        value={season.title}
                        onChange={(e) =>
                          updateSeason(index, { title: e.target.value })
                        }
                        className="bg-card border-border text-foreground mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Air Date</Label>
                      <Input
                        type="date"
                        value={season.air_date || ''}
                        onChange={(e) =>
                          updateSeason(index, { air_date: e.target.value })
                        }
                        className="bg-card border-border text-foreground mt-1.5"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Poster URL</Label>
                      <Input
                        value={season.poster}
                        onChange={(e) =>
                          updateSeason(index, { poster: e.target.value })
                        }
                        placeholder="/path/to/poster.jpg"
                        className="bg-card border-border text-foreground mt-1.5"
                      />
                      {season.poster && (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${season.poster}`}
                          alt="Season poster"
                          className="mt-2 w-32 rounded"
                        />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Episodes for this season will be managed in Step 3
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          Total Seasons: <span className="text-foreground font-semibold">{data.seasons?.length || 0}</span>
          <span className="mx-2">•</span>
          Total Episodes: <span className="text-foreground font-semibold">
            {data.seasons?.reduce((sum, s) => sum + (s.episodes?.length || 0), 0) || 0}
          </span>
        </p>
      </div>
    </div>
  );
}
