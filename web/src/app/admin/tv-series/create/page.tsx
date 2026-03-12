'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TVSeries } from '@/types/admin';
import { TVSeriesForm } from '@/components/admin/tv-series/tv-series-form';

export default function CreateTVSeriesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tvSeriesData, setTvSeriesData] = useState<Partial<TVSeries>>({
    seasons: [],
    poster_urls: ['', '', ''],
    backdrop_urls: ['', '', ''],
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateData = (data: Partial<TVSeries>) => {
    setTvSeriesData(data);
  };

  const handleCancel = () => {
    router.push('/admin/tv-series');
  };

  const handleSave = async () => {
    // Final validation
    if (!tvSeriesData.tmdb_id) {
      toast({
        title: 'Validation Error',
        description: 'Please search and select a TV series from TMDB first.',
        variant: 'destructive',
      });
      return;
    }

    if (!tvSeriesData.name || !tvSeriesData.original_name) {
      toast({
        title: 'Validation Error',
        description: 'Series name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!tvSeriesData.overview) {
      toast({
        title: 'Validation Error',
        description: 'Series overview is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate at least one poster URL
    const hasValidPoster = tvSeriesData.poster_urls?.some(url => url.trim() !== '');
    if (!hasValidPoster) {
      toast({
        title: 'Validation Error',
        description: 'At least one poster URL is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate seasons and episodes
    if (!tvSeriesData.seasons || tvSeriesData.seasons.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one season is required.',
        variant: 'destructive',
      });
      return;
    }

    // Check if at least one season has episodes
    const hasEpisodes = tvSeriesData.seasons.some(season => season.episodes && season.episodes.length > 0);
    if (!hasEpisodes) {
      toast({
        title: 'Validation Error',
        description: 'At least one season must have episodes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call API to save TV series
      console.log('Saving TV series:', tvSeriesData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Success',
        description: 'TV series created successfully!',
      });

      router.push('/admin/tv-series');
    } catch (error) {
      console.error('Error saving TV series:', error);
      toast({
        title: 'Error',
        description: 'Failed to save TV series. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create TV Series</h1>
        <p className="text-muted-foreground mt-2">
          Add a new TV series with complete season and episode information
        </p>
      </div>

      <TVSeriesForm data={tvSeriesData} onUpdate={handleUpdateData} />

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="border-border text-foreground hover:bg-white/5"
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Create TV Series
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
