'use client';

import React, { useEffect } from 'react';
import { useMovieFormStore } from '@/stores/movie-form-store';
import CreateMovieForm from '@/components/admin/content/movie-form';

export default function CreateMoviePage() {
  const reset = useMovieFormStore((state) => state.reset);

  useEffect(() => {
    reset();
    return () => reset();
  }, [reset]);

  return <CreateMovieForm />;
}
