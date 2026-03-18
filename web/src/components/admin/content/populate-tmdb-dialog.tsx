'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCompleteMovieData } from '@/services/tmdb-client';
import type { TMDBMovieData } from '@/types/tmdb';

interface PopulateTMDBDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPopulate: (data: TMDBMovieData) => void;
}

export function PopulateTMDBDialog({
  open,
  onOpenChange,
  onPopulate,
}: PopulateTMDBDialogProps) {
  const [tmdbId, setTmdbId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadedData, setLoadedData] = useState<TMDBMovieData | null>(null);

  const handleFetch = async () => {
    if (!tmdbId.trim()) {
      setError('Please enter a TMDB ID');
      return;
    }

    const id = parseInt(tmdbId, 10);
    if (isNaN(id)) {
      setError('TMDB ID must be a valid number');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const data = await getCompleteMovieData(id);
      setLoadedData(data);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch movie data';
      setError(errorMessage);
      setLoadedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (loadedData) {
      onPopulate(loadedData);
      // Reset form
      setTmdbId('');
      setError(null);
      setSuccess(false);
      setLoadedData(null);
      onOpenChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleFetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl">Populate from TMDB</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a TMDB Movie ID to automatically populate the form with movie data including
            details and cast information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* TMDB ID Input */}
          <div className="space-y-2">
            <Label htmlFor="tmdb-id" className="text-muted-foreground">
              TMDB Movie ID *
            </Label>
            <Input
              id="tmdb-id"
              type="number"
              placeholder="e.g., 550 (Fight Club)"
              value={tmdbId}
              onChange={(e) => {
                setTmdbId(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading || success}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Find TMDB ID on{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                themoviedb.org
              </a>
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-950 border border-red-800 rounded text-red-200 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Success State with Data Preview */}
          {success && loadedData && (
            <div className="space-y-3 p-3 bg-green-950 border border-green-800 rounded">
              <div className="flex gap-2 text-green-200 text-sm">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Movie data loaded successfully!</span>
              </div>

              <div className="space-y-2 text-xs text-green-200">
                <div>
                  <span className="font-semibold">Title:</span> {loadedData.movie.title}
                </div>
                <div>
                  <span className="font-semibold">Release Date:</span>{' '}
                  {loadedData.movie.release_date}
                </div>
                <div>
                  <span className="font-semibold">Rating:</span>{' '}
                  {loadedData.movie.rating.toFixed(1)}
                </div>
                <div>
                  <span className="font-semibold">Director:</span>{' '}
                  {loadedData.movieDetails.director || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Cast Members:</span>{' '}
                  {loadedData.cast.length > 0
                    ? `${loadedData.cast.length} actors loaded`
                    : 'No cast data'}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{' '}
                  {loadedData.movieDetails.duration} minutes
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching movie data from TMDB...</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!success ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleFetch} disabled={isLoading || !tmdbId.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Data'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(false);
                  setLoadedData(null);
                }}
              >
                Back
              </Button>
              <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Populate Form
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
