import { create } from 'zustand';
import { z } from 'zod';

export const movieFormSchema = {
  movie: z.object({
    poster_url: z.string().min(1, 'Poster URL is required'),
    rating: z.number().min(0).max(10),
    release_date: z.string().min(1, 'Release date is required'),
    slug: z.string().min(1, 'Slug is required'),
    title: z.string().min(1, 'Title is required'),
  }),

  movieDetails: z.object({
    adult: z.boolean(),
    backdrop_url: z.string(),
    country: z.string(),
    director: z.string(),
    duration: z.number().int().min(0),
    imdb_id: z.string(),
    language: z.string(),
    overview: z.string().min(1, 'Overview is required'),
    tmdb_id: z.number().int(),
    trailer_url: z.string(),
  }),

  cast: z.array(z.object({
    actor_image_url: z.string(),
    actor_name: z.string().min(1, 'Actor name is required'),
    character_name: z.string(),
    tmdb_id: z.number().int().optional(),
  })),

  category: z.array(z.object({
    category_id: z.number().int(),
    category_name: z.string().min(1, 'Category name is required'),
  })),

  playerProviders: z.array(z.object({
    is_ads_available: z.boolean(),
    is_default: z.boolean(),
    player_provider: z.string().min(1, 'Provider name is required'),
    player_provider_type: z.string(),
    player_provider_url: z.string().min(1, 'Provider URL is required'),
    video_quality: z.string(),
  })),

  subtitles: z.array(z.object({
    language: z.string().min(1, 'Language is required'),
    subtitle_author: z.string(),
    subtitle_url: z.string().min(1, 'Subtitle URL is required'),
  })),

  downloadLinks: z.array(z.object({
    download_option: z.string(),
    download_option_type: z.string(),
    download_option_url: z.string().min(1, 'Download URL is required'),
    file_size: z.string(),
    video_quality: z.string(),
  })),
};

export type MovieFormData = {
  movie: z.infer<typeof movieFormSchema.movie>;
  movieDetails: z.infer<typeof movieFormSchema.movieDetails>;
  cast: z.infer<typeof movieFormSchema.cast>;
  category: z.infer<typeof movieFormSchema.category>;
  playerProviders: z.infer<typeof movieFormSchema.playerProviders>;
  subtitles: z.infer<typeof movieFormSchema.subtitles>;
  downloadLinks: z.infer<typeof movieFormSchema.downloadLinks>;
};

interface MovieFormErrors {
  movie?: string[];
  movieDetails?: string[];
  cast?: string[];
  category?: string[];
  playerProviders?: string[];
  subtitles?: string[];
  downloadLinks?: string[];
}

interface MovieFormState {
  data: MovieFormData;
  errors: MovieFormErrors;
  isDirty: boolean;

  setMovieField: <K extends keyof MovieFormData['movie']>(key: K, value: MovieFormData['movie'][K]) => void;
  setMovieDetailsField: <K extends keyof MovieFormData['movieDetails']>(key: K, value: MovieFormData['movieDetails'][K]) => void;
  
  addCast: () => void;
  updateCast: (index: number, field: keyof MovieFormData['cast'][number], value: any) => void;
  removeCast: (index: number) => void;

  addCategory: () => void;
  updateCategory: (index: number, field: keyof MovieFormData['category'][number], value: any) => void;
  removeCategory: (index: number) => void;

  addPlayerProvider: () => void;
  updatePlayerProvider: (index: number, field: keyof MovieFormData['playerProviders'][number], value: any) => void;
  removePlayerProvider: (index: number) => void;

  addSubtitle: () => void;
  updateSubtitle: (index: number, field: keyof MovieFormData['subtitles'][number], value: any) => void;
  removeSubtitle: (index: number) => void;

  addDownloadLink: () => void;
  updateDownloadLink: (index: number, field: keyof MovieFormData['downloadLinks'][number], value: any) => void;
  removeDownloadLink: (index: number) => void;

  validateSection: (section: keyof MovieFormErrors) => boolean;
  validateAll: () => boolean;
  getData: () => MovieFormData;
  reset: () => void;
}

const initialMovie = {
  poster_url: '',
  rating: 0,
  release_date: new Date().toISOString().split('T')[0],
  slug: '',
  title: '',
};

const initialMovieDetails = {
  adult: false,
  backdrop_url: '',
  country: '',
  director: '',
  duration: 0,
  imdb_id: '',
  language: '',
  overview: '',
  tmdb_id: 0,
  trailer_url: '',
};

const initialState: MovieFormData = {
  movie: initialMovie,
  movieDetails: initialMovieDetails,
  cast: [],
  category: [],
  playerProviders: [],
  subtitles: [],
  downloadLinks: [],
};

export const useMovieFormStore = create<MovieFormState>((set, get) => ({
  data: { ...initialState },
  errors: {},
  isDirty: false,

  setMovieField: (key, value) => set((state) => ({
    data: { ...state.data, movie: { ...state.data.movie, [key]: value } },
    isDirty: true,
  })),

  setMovieDetailsField: (key, value) => set((state) => ({
    data: { ...state.data, movieDetails: { ...state.data.movieDetails, [key]: value } },
    isDirty: true,
  })),

  addCast: () => set((state) => ({
    data: { ...state.data, cast: [...state.data.cast, { actor_image_url: '', actor_name: '', character_name: '', tmdb_id: undefined }] },
    isDirty: true,
  })),

  updateCast: (index, field, value) => set((state) => {
    const newCast = [...state.data.cast];
    newCast[index] = { ...newCast[index], [field]: value };
    return { data: { ...state.data, cast: newCast }, isDirty: true };
  }),

  removeCast: (index) => set((state) => ({
    data: { ...state.data, cast: state.data.cast.filter((_, i) => i !== index) },
    isDirty: true,
  })),

  addCategory: () => set((state) => ({
    data: { ...state.data, category: [...state.data.category, { category_id: 0, category_name: '' }] },
    isDirty: true,
  })),

  updateCategory: (index, field, value) => set((state) => {
    const newCategory = [...state.data.category];
    newCategory[index] = { ...newCategory[index], [field]: value };
    return { data: { ...state.data, category: newCategory }, isDirty: true };
  }),

  removeCategory: (index) => set((state) => ({
    data: { ...state.data, category: state.data.category.filter((_, i) => i !== index) },
    isDirty: true,
  })),

  addPlayerProvider: () => set((state) => ({
    data: {
      ...state.data,
      playerProviders: [
        ...state.data.playerProviders,
        { is_ads_available: false, is_default: false, player_provider: '', player_provider_type: '', player_provider_url: '', video_quality: '' }
      ]
    },
    isDirty: true,
  })),

  updatePlayerProvider: (index, field, value) => set((state) => {
    const newProviders = [...state.data.playerProviders];
    newProviders[index] = { ...newProviders[index], [field]: value };
    return { data: { ...state.data, playerProviders: newProviders }, isDirty: true };
  }),

  removePlayerProvider: (index) => set((state) => ({
    data: { ...state.data, playerProviders: state.data.playerProviders.filter((_, i) => i !== index) },
    isDirty: true,
  })),

  addSubtitle: () => set((state) => ({
    data: { ...state.data, subtitles: [...state.data.subtitles, { language: '', subtitle_author: '', subtitle_url: '' }] },
    isDirty: true,
  })),

  updateSubtitle: (index, field, value) => set((state) => {
    const newSubtitles = [...state.data.subtitles];
    newSubtitles[index] = { ...newSubtitles[index], [field]: value };
    return { data: { ...state.data, subtitles: newSubtitles }, isDirty: true };
  }),

  removeSubtitle: (index) => set((state) => ({
    data: { ...state.data, subtitles: state.data.subtitles.filter((_, i) => i !== index) },
    isDirty: true,
  })),

  addDownloadLink: () => set((state) => ({
    data: { ...state.data, downloadLinks: [...state.data.downloadLinks, { download_option: '', download_option_type: '', download_option_url: '', file_size: '', video_quality: '' }] },
    isDirty: true,
  })),

  updateDownloadLink: (index, field, value) => set((state) => {
    const newLinks = [...state.data.downloadLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    return { data: { ...state.data, downloadLinks: newLinks }, isDirty: true };
  }),

  removeDownloadLink: (index) => set((state) => ({
    data: { ...state.data, downloadLinks: state.data.downloadLinks.filter((_, i) => i !== index) },
    isDirty: true,
  })),

  validateSection: (section) => {
    const schema = movieFormSchema[section];
    const result = schema.safeParse(get().data[section]);
    if (!result.success) {
      const errorMessages = result.error.errors.map(e => e.message);
      set((state) => ({ errors: { ...state.errors, [section]: errorMessages } }));
      return false;
    }
    set((state) => ({ errors: { ...state.errors, [section]: undefined } }));
    return true;
  },

  validateAll: () => {
    const data = get().data;
    const allResults = {
      movie: movieFormSchema.movie.safeParse(data.movie),
      movieDetails: movieFormSchema.movieDetails.safeParse(data.movieDetails),
      cast: movieFormSchema.cast.safeParse(data.cast),
      category: movieFormSchema.category.safeParse(data.category),
      playerProviders: movieFormSchema.playerProviders.safeParse(data.playerProviders),
      subtitles: movieFormSchema.subtitles.safeParse(data.subtitles),
      downloadLinks: movieFormSchema.downloadLinks.safeParse(data.downloadLinks),
    };

    const errors: MovieFormErrors = {};
    let isValid = true;

    (Object.keys(allResults) as Array<keyof typeof allResults>).forEach((key) => {
      if (!allResults[key].success) {
        errors[key as keyof MovieFormErrors] = allResults[key].error.errors.map(e => e.message);
        isValid = false;
      }
    });

    set({ errors });
    return isValid;
  },

  getData: () => get().data,

  reset: () => set({ data: { ...initialState }, errors: {}, isDirty: false }),
}));
