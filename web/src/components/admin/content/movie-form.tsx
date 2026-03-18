'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMovieFormStore, MovieFormData } from '@/stores/movie-form-store';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateMovieMutation,
  useCreateUpdateMovieDetailsMutation,
  useBulkAddCastMutation,
  useBulkAddCategoriesMutation,
  useBulkAddPlayerProvidersMutation,
  useBulkAddSubtitlesMutation,
  useBulkAddDownloadOptionsMutation,
} from '@/services/hooks/useMovies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Film, Eye, ImageIcon, Download } from 'lucide-react';
import Link from 'next/link';
import { PopulateTMDBDialog } from './populate-tmdb-dialog';
import type { TMDBMovieData } from '@/types/tmdb';

function MovieBasicSection() {
  const { data, setMovieField, errors } = useMovieFormStore();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Basic Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter the basic movie details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title" className="text-muted-foreground">Title *</Label>
            <Input
              id="title"
              value={data.movie.title}
              onChange={(e) => setMovieField('title', e.target.value)}
              onBlur={() => useMovieFormStore.getState().validateSection('movie')}
              className="bg-background border-border text-foreground mt-1.5"
            />
            {errors.movie && <p className="text-red-500 text-sm mt-1">{errors.movie[0]}</p>}
          </div>
          <div>
            <Label htmlFor="slug" className="text-muted-foreground">Slug *</Label>
            <Input
              id="slug"
              value={data.movie.slug}
              onChange={(e) => setMovieField('slug', e.target.value)}
              onBlur={() => useMovieFormStore.getState().validateSection('movie')}
              className="bg-background border-border text-foreground mt-1.5"
            />
            {errors.movie && errors.movie.some(e => e.includes('Slug')) && (
              <p className="text-red-500 text-sm mt-1">{errors.movie.find(e => e.includes('Slug'))}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="poster_url" className="text-muted-foreground">Poster URL *</Label>
            <Input
              id="poster_url"
              value={data.movie.poster_url}
              onChange={(e) => setMovieField('poster_url', e.target.value)}
              onBlur={() => useMovieFormStore.getState().validateSection('movie')}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="rating" className="text-muted-foreground">Rating</Label>
            <Select
              value={data.movie.rating.toString()}
              onValueChange={(value) => setMovieField('rating', parseFloat(value))}
            >
              <SelectTrigger id="rating" className="bg-background border-border text-foreground mt-1.5">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {[...Array(21)].map((_, i) => (
                  <SelectItem key={i} value={(i / 2).toString()}>
                    {(i / 2).toFixed(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="release_date" className="text-muted-foreground">Release Date *</Label>
          <Input
            id="release_date"
            type="date"
            value={data.movie.release_date}
            onChange={(e) => setMovieField('release_date', e.target.value)}
            onBlur={() => useMovieFormStore.getState().validateSection('movie')}
            className="bg-background border-border text-foreground mt-1.5"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MovieDetailsSection() {
  const { data, setMovieDetailsField, errors } = useMovieFormStore();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Movie Details</CardTitle>
        <CardDescription className="text-muted-foreground">
          Additional details about the movie
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="overview" className="text-muted-foreground">Overview *</Label>
          <Textarea
            id="overview"
            rows={4}
            value={data.movieDetails.overview}
            onChange={(e) => setMovieDetailsField('overview', e.target.value)}
            onBlur={() => useMovieFormStore.getState().validateSection('movieDetails')}
            className="bg-background border-border text-foreground mt-1.5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tmdb_id" className="text-muted-foreground">TMDB ID</Label>
            <Input
              id="tmdb_id"
              type="number"
              value={data.movieDetails.tmdb_id || ''}
              onChange={(e) => setMovieDetailsField('tmdb_id', parseInt(e.target.value) || 0)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="imdb_id" className="text-muted-foreground">IMDb ID</Label>
            <Input
              id="imdb_id"
              value={data.movieDetails.imdb_id}
              onChange={(e) => setMovieDetailsField('imdb_id', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="director" className="text-muted-foreground">Director</Label>
            <Input
              id="director"
              value={data.movieDetails.director}
              onChange={(e) => setMovieDetailsField('director', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="language" className="text-muted-foreground">Language</Label>
            <Input
              id="language"
              value={data.movieDetails.language}
              onChange={(e) => setMovieDetailsField('language', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country" className="text-muted-foreground">Country</Label>
            <Input
              id="country"
              value={data.movieDetails.country}
              onChange={(e) => setMovieDetailsField('country', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="duration" className="text-muted-foreground">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              value={data.movieDetails.duration || ''}
              onChange={(e) => setMovieDetailsField('duration', parseInt(e.target.value) || 0)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="backdrop_url" className="text-muted-foreground">Backdrop URL</Label>
            <Input
              id="backdrop_url"
              value={data.movieDetails.backdrop_url}
              onChange={(e) => setMovieDetailsField('backdrop_url', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="trailer_url" className="text-muted-foreground">Trailer URL</Label>
            <Input
              id="trailer_url"
              value={data.movieDetails.trailer_url}
              onChange={(e) => setMovieDetailsField('trailer_url', e.target.value)}
              className="bg-background border-border text-foreground mt-1.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="adult"
            checked={data.movieDetails.adult}
            onCheckedChange={(checked) => setMovieDetailsField('adult', checked as boolean)}
          />
          <Label htmlFor="adult" className="text-muted-foreground">Adult Content</Label>
        </div>
      </CardContent>
    </Card>
  );
}

function CastSection() {
  const { data, addCast, updateCast, removeCast, errors } = useMovieFormStore();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Cast</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add cast members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.cast.map((castItem: MovieFormData['cast'][number], index: number) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-background rounded-lg border border-border">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-muted-foreground text-sm">Actor Name *</Label>
                <Input
                  value={castItem.actor_name}
                  onChange={(e) => updateCast(index, 'actor_name', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('cast')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Actor name"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Character Name</Label>
                <Input
                  value={castItem.character_name}
                  onChange={(e) => updateCast(index, 'character_name', e.target.value)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Character name"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Image URL</Label>
                <Input
                  value={castItem.actor_image_url}
                  onChange={(e) => updateCast(index, 'actor_image_url', e.target.value)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Image URL"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeCast(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCast} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Cast Member
        </Button>
        {errors.cast && <p className="text-red-500 text-sm">{errors.cast[0]}</p>}
      </CardContent>
    </Card>
  );
}

function CategorySection() {
  const { data, addCategory, updateCategory, removeCategory, errors } = useMovieFormStore();

  const categories = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Animation', 'Adventure', 'Sci-Fi', 'Documentary'];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Categories</CardTitle>
        <CardDescription className="text-muted-foreground">
          Select or add categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.category.map((cat: MovieFormData['category'][number], index: number) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-background rounded-lg border border-border">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-sm">Category Name *</Label>
                <Select
                  value={cat.category_name}
                  onValueChange={(value) => updateCategory(index, 'category_name', value)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Category ID</Label>
                <Input
                  type="number"
                  value={cat.category_id || ''}
                  onChange={(e) => updateCategory(index, 'category_id', parseInt(e.target.value) || 0)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Category ID"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeCategory(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addCategory} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
        {errors.category && <p className="text-red-500 text-sm">{errors.category[0]}</p>}
      </CardContent>
    </Card>
  );
}

function PlayerProviderSection() {
  const { data, addPlayerProvider, updatePlayerProvider, removePlayerProvider, errors } = useMovieFormStore();

  const providerTypes = ['iframe', 'video', 'custom'];
  const qualities = ['360p', '480p', '720p', '1080p', '4K'];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Player Providers</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add streaming providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.playerProviders.map((provider: MovieFormData['playerProviders'][number], index: number) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-background rounded-lg border border-border">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-sm">Provider Name *</Label>
                <Input
                  value={provider.player_provider}
                  onChange={(e) => updatePlayerProvider(index, 'player_provider', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('playerProviders')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Provider name"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Provider URL *</Label>
                <Input
                  value={provider.player_provider_url}
                  onChange={(e) => updatePlayerProvider(index, 'player_provider_url', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('playerProviders')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Provider URL"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Provider Type</Label>
                <Select
                  value={provider.player_provider_type}
                  onValueChange={(value) => updatePlayerProvider(index, 'player_provider_type', value)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {providerTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Video Quality</Label>
                <Select
                  value={provider.video_quality}
                  onValueChange={(value) => updatePlayerProvider(index, 'video_quality', value)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground mt-1">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {qualities.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={provider.is_default}
                  onCheckedChange={(checked) => updatePlayerProvider(index, 'is_default', checked as boolean)}
                />
                <Label className="text-muted-foreground text-sm">Default</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={provider.is_ads_available}
                  onCheckedChange={(checked) => updatePlayerProvider(index, 'is_ads_available', checked as boolean)}
                />
                <Label className="text-muted-foreground text-sm">Has Ads</Label>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removePlayerProvider(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addPlayerProvider} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Player Provider
        </Button>
        {errors.playerProviders && <p className="text-red-500 text-sm">{errors.playerProviders[0]}</p>}
      </CardContent>
    </Card>
  );
}

function SubtitlesSection() {
  const { data, addSubtitle, updateSubtitle, removeSubtitle, errors } = useMovieFormStore();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Subtitles</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add subtitle files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.subtitles.map((subtitle: MovieFormData['subtitles'][number], index: number) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-background rounded-lg border border-border">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-muted-foreground text-sm">Language *</Label>
                <Input
                  value={subtitle.language}
                  onChange={(e) => updateSubtitle(index, 'language', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('subtitles')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="e.g., English, Sinhala"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Subtitle URL *</Label>
                <Input
                  value={subtitle.subtitle_url}
                  onChange={(e) => updateSubtitle(index, 'subtitle_url', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('subtitles')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Subtitle URL"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Author</Label>
                <Input
                  value={subtitle.subtitle_author}
                  onChange={(e) => updateSubtitle(index, 'subtitle_author', e.target.value)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Author name"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeSubtitle(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addSubtitle} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtitle
        </Button>
        {errors.subtitles && <p className="text-red-500 text-sm">{errors.subtitles[0]}</p>}
      </CardContent>
    </Card>
  );
}

function DownloadLinksSection() {
  const { data, addDownloadLink, updateDownloadLink, removeDownloadLink, errors } = useMovieFormStore();

  const qualities = ['360p', '480p', '720p', '1080p', '4K'];
  const optionTypes = ['google-drive', 'mega', 'streamtape', 'doodstream', 'other'];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Download Links</CardTitle>
        <CardDescription className="text-muted-foreground">
          Add download link providers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.downloadLinks.map((link: MovieFormData['downloadLinks'][number], index: number) => (
          <div key={index} className="flex gap-4 items-start p-4 bg-background rounded-lg border border-border">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-sm">Download URL *</Label>
                <Input
                  value={link.download_option_url}
                  onChange={(e) => updateDownloadLink(index, 'download_option_url', e.target.value)}
                  onBlur={() => useMovieFormStore.getState().validateSection('downloadLinks')}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Download URL"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Option Name</Label>
                <Input
                  value={link.download_option}
                  onChange={(e) => updateDownloadLink(index, 'download_option', e.target.value)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="Option name"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Option Type</Label>
                <Select
                  value={link.download_option_type}
                  onValueChange={(value) => updateDownloadLink(index, 'download_option_type', value)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {optionTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Video Quality</Label>
                <Select
                  value={link.video_quality}
                  onValueChange={(value) => updateDownloadLink(index, 'video_quality', value)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground mt-1">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    {qualities.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">File Size</Label>
                <Input
                  value={link.file_size}
                  onChange={(e) => updateDownloadLink(index, 'file_size', e.target.value)}
                  className="bg-card border-border text-foreground mt-1"
                  placeholder="e.g., 1.5GB"
                />
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeDownloadLink(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addDownloadLink} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Download Link
        </Button>
        {errors.downloadLinks && <p className="text-red-500 text-sm">{errors.downloadLinks[0]}</p>}
      </CardContent>
    </Card>
  );
}

function PreviewContent() {
  const { data } = useMovieFormStore();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <span className="text-muted-foreground text-sm block mb-2">Poster</span>
            {data.movie.poster_url ? (
              <div className="relative w-[150px] h-[225px] rounded-lg overflow-hidden bg-background">
                <img
                  src={data.movie.poster_url}
                  alt="Poster"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-[150px] h-[225px] rounded-lg bg-background flex items-center justify-center border border-dashed border-border">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Title:</span>
              <span className="ml-2 font-medium">{data.movie.title || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Slug:</span>
              <span className="ml-2 font-medium">{data.movie.slug || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Release Date:</span>
              <span className="ml-2 font-medium">{data.movie.release_date || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rating:</span>
              <span className="ml-2 font-medium">{data.movie.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Movie Details</h3>
        {data.movieDetails.backdrop_url && (
          <div className="mb-4">
            <span className="text-muted-foreground text-sm block mb-2">Backdrop</span>
            <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-background">
              <img
                src={data.movieDetails.backdrop_url}
                alt="Backdrop"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <span className="text-muted-foreground">Overview:</span>
            <p className="mt-1">{data.movieDetails.overview || '-'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">TMDB ID:</span>
            <span className="ml-2 font-medium">{data.movieDetails.tmdb_id || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">IMDb ID:</span>
            <span className="ml-2 font-medium">{data.movieDetails.imdb_id || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Director:</span>
            <span className="ml-2 font-medium">{data.movieDetails.director || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Language:</span>
            <span className="ml-2 font-medium">{data.movieDetails.language || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Country:</span>
            <span className="ml-2 font-medium">{data.movieDetails.country || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2 font-medium">{data.movieDetails.duration ? `${data.movieDetails.duration} min` : '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Adult Content:</span>
            <span className="ml-2 font-medium">{data.movieDetails.adult ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Cast ({data.cast.length})</h3>
        {data.cast.length === 0 ? (
          <p className="text-muted-foreground text-sm">No cast members added</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.cast.map((castItem: MovieFormData['cast'][number], idx: number) => (
              <div key={idx} className="flex flex-col items-center text-sm bg-background p-3 rounded-lg">
                {castItem.actor_image_url ? (
                  <img
                    src={castItem.actor_image_url}
                    alt={castItem.actor_name}
                    className="w-16 h-16 rounded-full object-cover mb-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <span className="font-medium text-center">{castItem.actor_name}</span>
                {castItem.character_name && (
                  <span className="text-muted-foreground text-xs text-center">as {castItem.character_name}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Categories ({data.category.length})</h3>
        {data.category.length === 0 ? (
          <p className="text-muted-foreground text-sm">No categories added</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.category.map((cat: MovieFormData['category'][number], idx: number) => (
              <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                {cat.category_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Player Providers ({data.playerProviders.length})</h3>
        {data.playerProviders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No player providers added</p>
        ) : (
          <div className="space-y-2">
            {data.playerProviders.map((provider: MovieFormData['playerProviders'][number], idx: number) => (
              <div key={idx} className="bg-background p-3 rounded text-sm">
                <div className="flex gap-2">
                  <span className="font-medium">{provider.player_provider}</span>
                  {provider.is_default && <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Default</span>}
                  {provider.is_ads_available && <span className="bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">Ads</span>}
                </div>
                <p className="text-muted-foreground text-xs mt-1">{provider.player_provider_url}</p>
                <p className="text-muted-foreground text-xs">{provider.video_quality} | {provider.player_provider_type}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-border pb-4">
        <h3 className="text-lg font-semibold mb-3">Subtitles ({data.subtitles.length})</h3>
        {data.subtitles.length === 0 ? (
          <p className="text-muted-foreground text-sm">No subtitles added</p>
        ) : (
          <div className="space-y-2">
            {data.subtitles.map((subtitle: MovieFormData['subtitles'][number], idx: number) => (
              <div key={idx} className="flex gap-4 text-sm bg-background p-2 rounded">
                <span className="font-medium">{subtitle.language}</span>
                {subtitle.subtitle_author && <span className="text-muted-foreground">by {subtitle.subtitle_author}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Download Links ({data.downloadLinks.length})</h3>
        {data.downloadLinks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No download links added</p>
        ) : (
          <div className="space-y-2">
            {data.downloadLinks.map((link: MovieFormData['downloadLinks'][number], idx: number) => (
              <div key={idx} className="bg-background p-3 rounded text-sm">
                <div className="flex gap-2">
                  <span className="font-medium">{link.download_option || 'Download'}</span>
                  <span className="text-muted-foreground">{link.video_quality}</span>
                  {link.file_size && <span className="text-muted-foreground">({link.file_size})</span>}
                </div>
                <p className="text-muted-foreground text-xs mt-1">{link.download_option_url}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateMovieForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    validateAll,
    getData,
    reset,
    setMovieField,
    setMovieDetailsField,
    addCast,
    removeCast,
    updateCast,
    addCategory,
    removeCategory,
    updateCategory,
  } = useMovieFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [populateOpen, setPopulateOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps] = useState(8);

  // Initialize all mutations
  const createMovieMutation = useCreateMovieMutation();
  const updateDetailsMutation = useCreateUpdateMovieDetailsMutation();
  const addCastMutation = useBulkAddCastMutation();
  const addCategoriesMutation = useBulkAddCategoriesMutation();
  const addPlayersMutation = useBulkAddPlayerProvidersMutation();
  const addSubtitlesMutation = useBulkAddSubtitlesMutation();
  const addDownloadsMutation = useBulkAddDownloadOptionsMutation();

  /**
   * Update step counter and display progress
   */
  const updateStep = useCallback((step: number, stepName: string) => {
    setCurrentStep(step);
    console.log(`Step ${step}/${totalSteps}: ${stepName}`);
  }, [totalSteps]);

  /**
   * Handle TMDB data population
   */
  const handlePopulateTMDB = useCallback(
    (tmdbData: TMDBMovieData) => {
      try {
        // Set basic movie info
        setMovieField('title', tmdbData.movie.title);
        setMovieField('slug', tmdbData.movie.slug || '');
        setMovieField('poster_url', tmdbData.movie.poster_url);
        setMovieField('rating', tmdbData.movie.rating);
        setMovieField('release_date', tmdbData.movie.release_date);

        // Set movie details
        setMovieDetailsField('overview', tmdbData.movieDetails.overview);
        setMovieDetailsField('director', tmdbData.movieDetails.director);
        setMovieDetailsField('language', tmdbData.movieDetails.language);
        setMovieDetailsField('country', tmdbData.movieDetails.country);
        setMovieDetailsField('duration', tmdbData.movieDetails.duration);
        setMovieDetailsField('imdb_id', tmdbData.movieDetails.imdb_id);
        setMovieDetailsField('tmdb_id', tmdbData.movieDetails.tmdb_id);
        setMovieDetailsField('backdrop_url', tmdbData.movieDetails.backdrop_url);
        setMovieDetailsField('trailer_url', tmdbData.movieDetails.trailer_url);
        setMovieDetailsField('adult', tmdbData.movieDetails.adult);

        // Set categories
        const currentData = getData();
        // Remove existing categories
        for (let i = currentData.category.length - 1; i >= 0; i--) {
          removeCategory(i);
        }
        // Add new categories
        tmdbData.categories.forEach((category) => {
          addCategory();
        });
        // Update newly added categories
        tmdbData.categories.forEach((category, index) => {
          updateCategory(index, 'category_id', category.category_id);
          updateCategory(index, 'category_name', category.category_name);
        });

        // Clear existing cast and add new cast members
        // Remove existing cast
        for (let i = currentData.cast.length - 1; i >= 0; i--) {
          removeCast(i);
        }

        // Add new cast members
        tmdbData.cast.forEach((actor) => {
          addCast();
        });

        // Update newly added cast
        tmdbData.cast.forEach((actor, index) => {
          updateCast(index, 'actor_name', actor.actor_name);
          updateCast(index, 'character_name', actor.character_name);
          updateCast(index, 'actor_image_url', actor.actor_image_url);
          updateCast(index, 'tmdb_id', actor.tmdb_id);
        });

        toast({
          title: '✅ Data Populated',
          description: `Loaded "${tmdbData.movie.title}" with ${tmdbData.categories.length} genres and ${tmdbData.cast.length} cast members`,
        });
      } catch (error) {
        console.error('Error populating form:', error);
        toast({
          title: 'Error',
          description: 'Failed to populate form data',
          variant: 'destructive',
        });
      }
    },
    [setMovieField, setMovieDetailsField, addCategory, updateCategory, removeCategory, addCast, removeCast, updateCast, getData, toast]
  );

  /**
   * Main publish handler with sequential API calls
   */
  const handlePublish = async () => {
    const isValid = validateAll();
    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before publishing',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setCurrentStep(0);
      const formData = getData();

      // STEP 1: Create base movie
      updateStep(1, 'Creating movie...');
      const movieResponse = await createMovieMutation.mutateAsync({
        title: formData.movie.title,
        slug: formData.movie.slug,
        poster_url: formData.movie.poster_url,
        rating: formData.movie.rating,
        release_date: formData.movie.release_date,
        overview: formData.movieDetails.overview,
      });

      if (!movieResponse.success || !movieResponse.data?.id) {
        throw new Error(movieResponse.error || 'Failed to create movie');
      }

      const movieId = movieResponse.data.id;
      console.log('✅ Movie created:', movieId);
      toast({
        title: 'Progress',
        description: `(1/8) Movie created successfully`,
      });

      // STEP 2: Create/Update movie details
      updateStep(2, 'Updating movie details...');
      const detailsResponse = await updateDetailsMutation.mutateAsync({
        movieId,
        data: {
          overview: formData.movieDetails.overview,
          director: formData.movieDetails.director,
          language: formData.movieDetails.language,
          country: formData.movieDetails.country,
          duration: formData.movieDetails.duration,
          imdb_id: formData.movieDetails.imdb_id,
          tmdb_id: formData.movieDetails.tmdb_id,
          backdrop_url: formData.movieDetails.backdrop_url,
          trailer_url: formData.movieDetails.trailer_url,
          adult: formData.movieDetails.adult,
        },
      });

      if (!detailsResponse.success) {
        console.warn('⚠️ Failed to update details, continuing...', detailsResponse.error);
      } else {
        console.log('✅ Movie details updated');
      }
      toast({
        title: 'Progress',
        description: `(2/8) Movie details updated`,
      });

      // STEP 3: Add categories
      updateStep(3, 'Adding categories...');
      if (formData.category.length > 0) {
        const categoriesResponse = await addCategoriesMutation.mutateAsync({
          movieId,
          data: {
            categories: formData.category.map((cat) => ({
              category_id: cat.category_id,
              category_name: cat.category_name,
            })),
          },
        });

        if (!categoriesResponse.success) {
          console.warn('⚠️ Failed to add categories, continuing...', categoriesResponse.error);
        } else {
          console.log('✅ Categories added');
        }
      }
      toast({
        title: 'Progress',
        description: `(3/8) Categories added`,
      });

      // STEP 4: Add cast
      updateStep(4, 'Adding cast members...');
      if (formData.cast.length > 0) {
        const castResponse = await addCastMutation.mutateAsync({
          movieId,
          data: {
            cast: formData.cast.map((actor) => ({
              actor_name: actor.actor_name,
              character_name: actor.character_name,
              actor_image_url: actor.actor_image_url,
              tmdb_id: actor.tmdb_id,
            })),
          },
        });

        if (!castResponse.success) {
          console.warn('⚠️ Failed to add cast, continuing...', castResponse.error);
        } else {
          console.log('✅ Cast members added');
        }
      }
      toast({
        title: 'Progress',
        description: `(4/8) Cast members added`,
      });

      // STEP 5: Add player providers
      updateStep(5, 'Adding streaming providers...');
      if (formData.playerProviders.length > 0) {
        const playersResponse = await addPlayersMutation.mutateAsync({
          movieId,
          data: {
            providers: formData.playerProviders.map((provider) => ({
              player_provider: provider.player_provider,
              player_provider_url: provider.player_provider_url,
              player_provider_type: provider.player_provider_type,
              video_quality: provider.video_quality,
              is_default: provider.is_default,
              is_ads_available: provider.is_ads_available,
            })),
          },
        });

        if (!playersResponse.success) {
          console.warn('⚠️ Failed to add players, continuing...', playersResponse.error);
        } else {
          console.log('✅ Player providers added');
        }
      }
      toast({
        title: 'Progress',
        description: `(5/8) Streaming providers added`,
      });

      // STEP 6: Add subtitles
      updateStep(6, 'Adding subtitles...');
      if (formData.subtitles.length > 0) {
        const subtitlesResponse = await addSubtitlesMutation.mutateAsync({
          movieId,
          data: {
            subtitles: formData.subtitles.map((sub) => ({
              language: sub.language,
              subtitle_url: sub.subtitle_url,
              subtitle_author: sub.subtitle_author,
            })),
          },
        });

        if (!subtitlesResponse.success) {
          console.warn('⚠️ Failed to add subtitles, continuing...', subtitlesResponse.error);
        } else {
          console.log('✅ Subtitles added');
        }
      }
      toast({
        title: 'Progress',
        description: `(6/8) Subtitles added`,
      });

      // STEP 7: Add download options
      updateStep(7, 'Adding download options...');
      if (formData.downloadLinks.length > 0) {
        const downloadsResponse = await addDownloadsMutation.mutateAsync({
          movieId,
          data: {
            downloads: formData.downloadLinks.map((link) => ({
              download_option: link.download_option,
              download_option_type: link.download_option_type,
              download_option_url: link.download_option_url,
              video_quality: link.video_quality,
              file_size: link.file_size,
            })),
          },
        });

        if (!downloadsResponse.success) {
          console.warn('⚠️ Failed to add downloads, continuing...', downloadsResponse.error);
        } else {
          console.log('✅ Download options added');
        }
      }
      toast({
        title: 'Progress',
        description: `(7/8) Download options added`,
      });

      // STEP 8: Complete
      updateStep(8, 'Finalizing...');
      reset();
      setCurrentStep(totalSteps);

      toast({
        title: '🎉 Success!',
        description: `Movie "${formData.movie.title}" created successfully with ID: ${movieId}`,
      });

      // Navigate after short delay
      setTimeout(() => {
        router.push('/admin/movies');
      }, 1000);
    } catch (error) {
      console.error('❌ Error publishing movie:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movie',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/movies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Film className="h-8 w-8" />
              Create New Movie
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSubmitting ? `Creating movie... (Step ${currentStep}/${totalSteps})` : 'Add a new movie to the system'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setPopulateOpen(true)}
            disabled={isSubmitting}
            className="bg-blue-950 hover:bg-blue-900 border-blue-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Populate from TMDB
          </Button>
          <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={isSubmitting}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handlePublish} disabled={isSubmitting}>
            {isSubmitting ? `Publishing... (${currentStep}/${totalSteps})` : 'Publish'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="bg-card border-border">
          <TabsTrigger value="basic" className="data-[state=active]:bg-primary">Basic</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-primary">Details</TabsTrigger>
          <TabsTrigger value="cast" className="data-[state=active]:bg-primary">Cast</TabsTrigger>
          <TabsTrigger value="category" className="data-[state=active]:bg-primary">Category</TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-primary">Players</TabsTrigger>
          <TabsTrigger value="subtitles" className="data-[state=active]:bg-primary">Subtitles</TabsTrigger>
          <TabsTrigger value="downloads" className="data-[state=active]:bg-primary">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <MovieBasicSection />
        </TabsContent>

        <TabsContent value="details">
          <MovieDetailsSection />
        </TabsContent>

        <TabsContent value="cast">
          <CastSection />
        </TabsContent>

        <TabsContent value="category">
          <CategorySection />
        </TabsContent>

        <TabsContent value="players">
          <PlayerProviderSection />
        </TabsContent>

        <TabsContent value="subtitles">
          <SubtitlesSection />
        </TabsContent>

        <TabsContent value="downloads">
          <DownloadLinksSection />
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl">Movie Preview</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review all the information before publishing
            </DialogDescription>
          </DialogHeader>
          <PreviewContent />
        </DialogContent>
      </Dialog>

      <PopulateTMDBDialog
        open={populateOpen}
        onOpenChange={setPopulateOpen}
        onPopulate={handlePopulateTMDB}
      />
    </div>
  );
}
