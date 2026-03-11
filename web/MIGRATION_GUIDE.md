# Migration Guide: From Direct Fetch to TanStack Query

This guide shows you how to migrate existing components from manual data fetching to TanStack Query hooks.

## Before & After Comparison

### Movies Page Migration

#### Before (Old Approach)
```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchMovieGenres, fetchDiscoverMovies, fetchLanguages } from '@/lib/tmdb';

export default function MoviesPage() {
  const [movies, setMovies] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('all_languages');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data
  useEffect(() => {
    async function getInitialData() {
      const [movieGenres, languages] = await Promise.all([
          fetchMovieGenres(),
          fetchLanguages()
      ]);
      setGenres(movieGenres || []);
      setLanguages(languages || []);
    }
    getInitialData();
  }, []);
  
  // Fetch movies when filters change
  useEffect(() => {
    async function getMovies() {
        setIsLoading(true);
        const languageToFetch = selectedLanguage === 'all_languages' ? '' : selectedLanguage;
        const fetchedMovies = await fetchDiscoverMovies(selectedCategory, selectedGenres, languageToFetch);
        setMovies(fetchedMovies || []);
        setIsLoading(false);
    }
    getMovies();
  }, [selectedCategory, selectedGenres, selectedLanguage]);

  // ...rest of component
}
```

**Problems:**
- Manual state management for data, loading, and errors
- Multiple useEffect hooks
- No caching (refetches on every mount)
- No automatic refetching
- Manual null checks
- Code duplication

---

#### After (TanStack Query Approach)
```typescript
'use client';

import { useState } from 'react';
import { useMovieGenres, useLanguages, useDiscoverMovies } from '@/services/hooks';

export default function MoviesPage() {
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Fetch genres and languages using TanStack Query
  const { data: genres = [], isLoading: genresLoading } = useMovieGenres();
  const { data: languages = [], isLoading: languagesLoading } = useLanguages();

  // Fetch movies based on filters
  const { data: movies = [], isLoading: moviesLoading } = useDiscoverMovies({
    category: selectedCategory,
    genres: selectedGenres,
    language: selectedLanguage,
  });

  const isLoading = moviesLoading || genresLoading || languagesLoading;

  // ...rest of component
}
```

**Benefits:**
- Automatic caching (genres/languages cached for 24 hours!)
- Automatic refetching when dependencies change
- Built-in loading states
- Default values with destructuring
- No useEffect needed
- Cleaner, more readable code
- Type-safe

---

## Step-by-Step Migration Process

### Step 1: Identify Data Fetching Logic

Look for:
- `useState` for data
- `useState` for loading
- `useState` for errors
- `useEffect` with async functions
- Direct API calls (`fetchFromTMDB`, `fetch`, etc.)

### Step 2: Find or Create the Appropriate Hook

Check `src/services/hooks/index.ts` for available hooks:

- `useLanguages()` - Fetch languages
- `useTVGenres()` - Fetch TV genres
- `useMovieGenres()` - Fetch movie genres
- `useTrending()` - Fetch trending content
- `usePopular()` - Fetch popular content
- `useTopRated()` - Fetch top rated content
- `useNowPlaying()` - Fetch now playing movies
- `useContentDetails({ id, type })` - Fetch content details
- `useSearchContent({ query })` - Search content
- `useSimilarContent({ id, type })` - Fetch similar content
- `useTVSeason({ tvId, seasonNumber })` - Fetch TV season
- `useDiscoverTV({ category, genres, language })` - Discover TV shows
- `useDiscoverMovies({ category, genres, language })` - Discover movies

### Step 3: Replace useState + useEffect

**Before:**
```typescript
const [movies, setMovies] = useState<Content[]>([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  async function getMovies() {
    setIsLoading(true);
    const data = await fetchDiscoverMovies(category, genres, language);
    setMovies(data || []);
    setIsLoading(false);
  }
  getMovies();
}, [category, genres, language]);
```

**After:**
```typescript
const { data: movies = [], isLoading } = useDiscoverMovies({
  category,
  genres,
  language,
});
```

### Step 4: Handle Loading States

**Before:**
```typescript
if (isLoading) return <div>Loading...</div>;
```

**After:**
```typescript
if (isLoading) return <div>Loading...</div>;
// OR combine multiple loading states:
const isLoading = moviesLoading || genresLoading;
```

### Step 5: Handle Error States (Optional)

**Before:**
```typescript
const [error, setError] = useState<Error | null>(null);

try {
  const data = await fetchMovies();
} catch (err) {
  setError(err);
}

if (error) return <div>Error: {error.message}</div>;
```

**After:**
```typescript
const { data: movies = [], isLoading, error } = useDiscoverMovies({...});

if (error) return <div>Error: {error.message}</div>;
```

### Step 6: Remove Old Imports

**Remove:**
```typescript
import { fetchMovieGenres, fetchDiscoverMovies } from '@/lib/tmdb';
```

**Add:**
```typescript
import { useMovieGenres, useDiscoverMovies } from '@/services/hooks';
```

---

## Common Migration Patterns

### Pattern 1: Simple Data Fetch

**Before:**
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchData() {
    setLoading(true);
    const result = await fetchTrending();
    setData(result || []);
    setLoading(false);
  }
  fetchData();
}, []);
```

**After:**
```typescript
const { data = [], isLoading } = useTrending();
```

---

### Pattern 2: Search with Debouncing

**Before:**
```typescript
const [query, setQuery] = useState('');
const [debouncedQuery] = useDebounce(query, 500);
const [results, setResults] = useState([]);

useEffect(() => {
  async function search() {
    if (debouncedQuery) {
      const data = await searchContent(debouncedQuery);
      setResults(data || []);
    }
  }
  search();
}, [debouncedQuery]);
```

**After:**
```typescript
const [query, setQuery] = useState('');
const [debouncedQuery] = useDebounce(query, 500);

const { data: results = [] } = useSearchContent({ 
  query: debouncedQuery 
});
```

---

### Pattern 3: Dependent Queries

**Before:**
```typescript
const [content, setContent] = useState(null);
const [similar, setSimilar] = useState([]);

useEffect(() => {
  async function fetchContent() {
    const data = await fetchContentDetails(id, type);
    setContent(data);
  }
  fetchContent();
}, [id, type]);

useEffect(() => {
  if (content) {
    async function fetchSimilar() {
      const data = await fetchSimilarContent(id, type);
      setSimilar(data || []);
    }
    fetchSimilar();
  }
}, [content, id, type]);
```

**After:**
```typescript
const { data: content } = useContentDetails({ id, type });

// Automatically disabled until content is loaded
const { data: similar = [] } = useSimilarContent({ 
  id, 
  type 
});
```

---

### Pattern 4: Multiple Filters with Auto-Refetch

**Before:**
```typescript
const [category, setCategory] = useState('popular');
const [genres, setGenres] = useState<number[]>([]);
const [language, setLanguage] = useState('en');
const [data, setData] = useState([]);

useEffect(() => {
  async function fetchData() {
    const result = await fetchDiscoverMovies(category, genres, language);
    setData(result || []);
  }
  fetchData();
}, [category, genres, language]); // Must remember all dependencies!
```

**After:**
```typescript
const [category, setCategory] = useState('popular');
const [genres, setGenres] = useState<number[]>([]);
const [language, setLanguage] = useState('en');

// Automatically refetches when any param changes!
const { data = [] } = useDiscoverMovies({
  category,
  genres,
  language,
});
```

---

## Migration Checklist

For each component you migrate:

- [ ] Remove `useState` for data
- [ ] Remove `useState` for loading
- [ ] Remove `useState` for errors (if present)
- [ ] Remove `useEffect` with fetch logic
- [ ] Import appropriate hook from `@/services/hooks`
- [ ] Replace with `const { data, isLoading, error } = useHook(...)`
- [ ] Use default values with destructuring (`data = []`)
- [ ] Update loading condition if combining multiple queries
- [ ] Remove old imports from `@/lib/tmdb`
- [ ] Test the component

---

## Components to Migrate

### High Priority (Client Components)

1. **src/app/movies/page.tsx** ✅ MIGRATED (see page.new.tsx)
   - Use: `useMovieGenres`, `useLanguages`, `useDiscoverMovies`

2. **src/app/tv-shows/page.tsx**
   - Use: `useTVGenres`, `useLanguages`, `useDiscoverTV`

3. **src/app/search/page.tsx**
   - Use: `useSearchContent`

### Medium Priority (Server Components - Optional)

Server components can continue using the API functions directly:

```typescript
// Server Component (src/app/page.tsx)
import * as api from '@/services/functions';

export default async function Home() {
  const trending = await api.fetchTrending();
  const popular = await api.fetchPopular();
  
  return <div>...</div>;
}
```

---

## Testing Your Migration

1. **Start the mock server:**
   ```bash
   npm run dev:mock
   ```

2. **Open React Query DevTools:**
   - Look for the React Query icon in bottom-right
   - View all active queries
   - Check cache status and refetch behavior

3. **Test these scenarios:**
   - Initial page load
   - Changing filters (should refetch automatically)
   - Navigate away and back (should use cached data)
   - Network errors (disconnect internet)
   - Different mock collections (via Admin UI)

---

## Troubleshooting

### "Query not refetching when state changes"

Make sure you're passing the state as query parameters:
```typescript
// ✅ Correct
const { data } = useDiscoverMovies({ category, genres, language });

// ❌ Wrong
const { data } = useDiscoverMovies({ 
  category: 'popular',  // Hardcoded!
  genres: [],
  language: 'en' 
});
```

### "Infinite refetching loop"

Don't create new objects/arrays in render:
```typescript
// ❌ Wrong - creates new array every render
const { data } = useDiscoverMovies({ 
  category, 
  genres: [],  // New array every render!
  language 
});

// ✅ Correct - use state
const [genres, setGenres] = useState<number[]>([]);
const { data } = useDiscoverMovies({ category, genres, language });
```

### "TypeScript errors with Content type"

Make sure you're using types from `@/types`:
```typescript
import type { Content } from '@/types';
```

---

## Next Steps

After migrating all components:

1. Remove old `src/lib/tmdb.ts` (keep for reference initially)
2. Remove old `src/lib/data.ts`
3. Update any remaining imports
4. Run tests
5. Deploy!

---

**Happy Migrating!**
