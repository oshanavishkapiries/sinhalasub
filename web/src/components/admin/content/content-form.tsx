'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { AdminContent } from '@/types/admin';
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

interface ContentFormProps {
  content?: AdminContent;
  onSubmit: (data: Partial<AdminContent>) => void;
  isSubmitting?: boolean;
}

const TYPES = ['movie', 'tv'];
const GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Thriller',
  'Animation',
  'Adventure',
];

export function ContentForm({ content, onSubmit, isSubmitting = false }: ContentFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<Partial<AdminContent>>({
    defaultValues: content || {
      title: '',
      type: 'movie',
      overview: '',
      releaseDate: new Date().toISOString().split('T')[0],
      genres: [],
      rating: 0,
    },
  });

  const type = watch('type');
  const selectedGenres = watch('genres');

  const toggleGenre = (genre: string) => {
    const current = selectedGenres || [];
    if (current.includes(genre)) {
      setValue(
        'genres',
        current.filter((g) => g !== genre)
      );
    } else {
      setValue('genres', [...current, genre]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-gray-300">Title</Label>
        <Input
          id="title"
          placeholder="Content title"
          {...register('title', { required: 'Title is required' })}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="type" className="text-gray-300">Type</Label>
        <Select value={type || 'movie'} onValueChange={(value) => setValue('type', value as any)}>
          <SelectTrigger id="type" className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            {TYPES.map((t) => (
              <SelectItem key={t} value={t} className="hover:bg-white/10 focus:bg-white/10">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="overview" className="text-gray-300">Overview</Label>
        <Textarea
          id="overview"
          placeholder="Content overview and description"
          rows={4}
          {...register('overview', { required: 'Overview is required' })}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="releaseDate" className="text-gray-300">Release Date</Label>
        <Input
          id="releaseDate"
          type="date"
          {...register('releaseDate', { required: 'Release date is required' })}
          className="bg-[#1a1a1a] border-white/10 text-white focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="rating" className="text-gray-300">Rating</Label>
        <Input
          id="rating"
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="0-10"
          {...register('rating', { valueAsNumber: true })}
          className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E50914] focus:ring-[#E50914]/20 mt-1.5"
        />
      </div>

      <div>
        <Label className="text-gray-300">Genres</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {GENRES.map((genre) => (
            <label key={genre} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={selectedGenres?.includes(genre) || false}
                onChange={() => toggleGenre(genre)}
                className="h-4 w-4 rounded border-white/20 bg-[#1a1a1a] text-[#E50914] focus:ring-[#E50914] focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">{genre}</span>
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
