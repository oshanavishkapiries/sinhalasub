# Mock Server & TanStack Query Setup

This project uses **Mocks Server** for API mocking and **TanStack Query (React Query)** for data fetching with caching, loading states, and error handling.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Mock Server](#mock-server)
- [TanStack Query](#tanstack-query)
- [API Services](#api-services)
- [Usage Examples](#usage-examples)
- [Available Scripts](#available-scripts)

---

## Overview

### What Changed?

**Before:**
- Direct fetch calls in components using `useEffect`
- Manual loading state management
- No caching or request deduplication
- Tightly coupled to TMDB API

**After:**
- Mock server for local development
- TanStack Query hooks with automatic caching
- Automatic loading/error states
- Type-safe API functions
- Decoupled frontend from data fetching logic

---

## Project Structure

```
D:\sinhalasub\web\
├── mocks/                         # Mock Server Configuration
│   ├── routes/                    # API route definitions
│   │   ├── data.js               # Shared mock data
│   │   ├── languages.js          # Language endpoints
│   │   ├── genres.js             # Genre endpoints
│   │   ├── content.js            # Trending, popular, top-rated
│   │   ├── details.js            # Content details & search
│   │   └── discover.js           # Discover & TV seasons
│   ├── collections/
│   │   └── collections.json      # Route collections (scenarios)
│   └── mocks.config.js           # Mock server config
│
├── src/
│   ├── services/                  # API Layer (NEW)
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── functions/            # API client functions
│   │   │   └── index.ts
│   │   ├── hooks/                # TanStack Query hooks
│   │   │   └── index.ts
│   │   └── endpoints.ts          # Endpoint registry & query keys
│   │
│   └── app/
│       ├── providers.tsx         # React Query provider
│       └── layout.tsx            # Updated with providers
```

---

## Getting Started

### 1. Install Dependencies

Already installed:
```bash
npm install @tanstack/react-query @mocks-server/main
npm install @tanstack/react-query-devtools npm-run-all --save-dev
```

### 2. Start Development

**Option A: With Mock Server (Recommended)**
```bash
npm run dev:mock
```

This runs:
- Mock server on `http://localhost:3100`
- Next.js app on `http://localhost:9002`

**Option B: Without Mock Server (Use Real TMDB API)**
```bash
npm run dev
```

### 3. Access Mock Server Admin

- **Admin UI:** `http://localhost:3110`
- **API Base:** `http://localhost:3100/api`

---

## Mock Server

### Configuration

**File:** `mocks.config.js`

```javascript
{
  port: 3100,           // API server port
  adminPort: 3110,      // Admin UI port
  delay: 500,           // Simulated network delay (ms)
  cors: enabled,        // CORS enabled
  watch: true,          // Auto-reload on file changes
}
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/configuration/languages` | GET | Get available languages |
| `/api/genre/tv/list` | GET | Get TV genres |
| `/api/genre/movie/list` | GET | Get movie genres |
| `/api/trending/all/week` | GET | Trending content |
| `/api/movie/popular` | GET | Popular movies |
| `/api/tv/popular` | GET | Popular TV shows |
| `/api/movie/top_rated` | GET | Top rated movies |
| `/api/tv/top_rated` | GET | Top rated TV shows |
| `/api/movie/now_playing` | GET | Now playing movies |
| `/api/movie/:id` | GET | Movie details |
| `/api/tv/:id` | GET | TV show details |
| `/api/movie/:id/similar` | GET | Similar movies |
| `/api/tv/:id/similar` | GET | Similar TV shows |
| `/api/search/multi?query=` | GET | Search content |
| `/api/movie/:category` | GET | Discover movies |
| `/api/discover/tv` | GET | Discover TV shows |
| `/api/tv/:tvId/season/:seasonNumber` | GET | TV season episodes |

### Collections (Scenarios)

Switch between different API response scenarios using the Admin UI:

- **base** (default): All successful responses
- **empty-data**: Returns empty results
- **all-errors**: Returns error responses
- **not-found-scenarios**: Returns 404 errors

### Adding New Mock Data

1. Edit `mocks/routes/data.js` to add more movies/TV shows
2. Create new route files in `mocks/routes/`
3. Update `mocks/collections/collections.json`

---

## TanStack Query

### Provider Setup

The `QueryClientProvider` is set up in `src/app/providers.tsx` and wrapped around the entire app in `src/app/layout.tsx`.

### Configuration

**Default Query Options:**
```typescript
{
  staleTime: 60 * 1000,        // 1 minute
  retry: 3,                     // Retry failed requests 3 times
  refetchOnWindowFocus: false,  // Don't refetch on window focus
}
```

### React Query Devtools

Available in development mode:
- Press the React Query icon in bottom-right corner
- View all queries, their states, and cached data
- Manually refetch or invalidate queries

---

## API Services

### 1. Type Definitions (`src/services/types/`)

```typescript
import type { Content, Genre, Language, TVSeason } from '@/services/types';
```

### 2. Endpoints Registry (`src/services/endpoints.ts`)

```typescript
import { ENDPOINTS, QUERY_KEYS, API_CONFIG } from '@/services/endpoints';
```

**Environment Detection:**
- Development: Uses mock server (`http://localhost:3100/api`)
- Production: Uses real TMDB API

### 3. API Functions (`src/services/functions/`)

```typescript
import * as api from '@/services/functions';

// Examples:
const languages = await api.fetchLanguages();
const trending = await api.fetchTrending();
const movie = await api.fetchContentDetails({ id: '1', type: 'movie' });
```

### 4. TanStack Query Hooks (`src/services/hooks/`)

```typescript
import {
  useLanguages,
  useTrending,
  useSearchContent,
  useDiscoverMovies,
} from '@/services/hooks';
```

---

## Usage Examples

### Example 1: Fetching Trending Content

**Before (Old Way):**
```typescript
'use client';
import { useState, useEffect } from 'react';
import { fetchTrending } from '@/lib/tmdb';

export default function TrendingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const result = await fetchTrending();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render data */}</div>;
}
```

**After (New Way with TanStack Query):**
```typescript
'use client';
import { useTrending } from '@/services/hooks';

export default function TrendingPage() {
  const { data, isLoading, error } = useTrending();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render data */}</div>;
}
```

### Example 2: Search with Debouncing

```typescript
'use client';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useSearchContent } from '@/services/hooks';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  const { data: results, isLoading } = useSearchContent({ 
    query: debouncedQuery 
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <div>Searching...</div>}
      {results?.map(item => (
        <div key={item.id}>{item.title || item.name}</div>
      ))}
    </div>
  );
}
```

### Example 3: Discover Movies with Filters

```typescript
'use client';
import { useState } from 'react';
import { useDiscoverMovies } from '@/services/hooks';

export default function MoviesPage() {
  const [category, setCategory] = useState('popular');
  const [genres, setGenres] = useState<number[]>([]);
  const [language, setLanguage] = useState('en');

  const { data: movies, isLoading } = useDiscoverMovies({
    category,
    genres,
    language,
  });

  // Component automatically refetches when category, genres, or language change!

  return <div>{/* render movies */}</div>;
}
```

### Example 4: Content Details

```typescript
'use client';
import { useContentDetails } from '@/services/hooks';

export default function ContentPage({ 
  params 
}: { 
  params: { id: string; type: 'movie' | 'tv' } 
}) {
  const { data: content, isLoading, error } = useContentDetails({
    id: params.id,
    type: params.type,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!content) return <div>Not found</div>;

  return (
    <div>
      <h1>{content.title || content.name}</h1>
      <p>{content.overview}</p>
    </div>
  );
}
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js (without mock server) |
| `npm run dev:mock` | Start Next.js + Mock Server (parallel) |
| `npm run mock:server` | Start only mock server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

---

## Benefits

### 1. Decoupled Architecture
- Frontend no longer depends directly on TMDB API
- Easy to switch between mock/real APIs
- Can test without internet connection

### 2. Better Developer Experience
- React Query DevTools for debugging
- Automatic request deduplication
- Background refetching
- Optimistic updates

### 3. Performance
- Automatic caching (reduces API calls)
- Stale-while-revalidate pattern
- Prefetching support

### 4. Type Safety
- Full TypeScript support
- Type-safe API functions
- Type-safe query hooks

### 5. Testing
- Easy to mock API responses
- Multiple test scenarios via collections
- Simulate errors, delays, edge cases

---

## Next Steps

### Migrate Existing Components

1. Replace `fetchFromTMDB` calls with TanStack Query hooks
2. Remove manual `useState` and `useEffect` for data fetching
3. Use `isLoading`, `error`, and `data` from hooks
4. Remove manual loading state management

### Add More Features

1. **Mutations:** Use `useMutation` for POST/PUT/DELETE
2. **Infinite Queries:** Use `useInfiniteQuery` for pagination
3. **Optimistic Updates:** Update UI before server responds
4. **Prefetching:** Prefetch data on hover

---

## Troubleshooting

### Mock Server Not Starting

```bash
# Check if port 3100 is already in use
netstat -ano | findstr :3100

# Kill the process or change port in mocks.config.js
```

### API Still Calling TMDB

Make sure `NODE_ENV=development` is set:
```bash
# Check in src/services/endpoints.ts
console.log('API_CONFIG:', API_CONFIG);
```

### React Query DevTools Not Showing

- Only available in development mode
- Check browser console for errors
- Verify `@tanstack/react-query-devtools` is installed

---

## Resources

- [Mocks Server Docs](https://www.mocks-server.org/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Next.js App Router + React Query](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)

---

**Happy Coding!**
