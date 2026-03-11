# Quick Start Guide - Mock Server & TanStack Query

## Installation Complete!

All dependencies are installed and configured. Your project now has:
- Mock Server (Mocks Server)
- TanStack Query for data fetching
- React Query DevTools
- Complete API service layer

---

## Start Development

### Option 1: With Mock Server (Recommended for Development)

```bash
npm run dev:mock
```

This starts:
- **Mock Server:** http://localhost:3100
- **Admin UI:** http://localhost:3110
- **Next.js App:** http://localhost:9002

### Option 2: Without Mock Server (Uses Real TMDB API)

```bash
npm run dev
```

---

## Verify Setup

### 1. Test Mock Server

The mock server should already be working! Test it:

```bash
# Test languages endpoint
curl http://localhost:3100/api/configuration/languages

# Test trending content
curl http://localhost:3100/api/trending/all/week
```

### 2. Access Admin UI

Open http://localhost:3110 in your browser to:
- Switch between mock collections (base, empty-data, all-errors)
- View all available routes
- Change delay settings
- Monitor requests

### 3. View React Query DevTools

When running your Next.js app, look for the React Query icon in the bottom-right corner. Click it to:
- View all active queries
- Check cache status
- Manually refetch queries
- Inspect query data

---

## Project Structure

```
D:\sinhalasub\web\
├── mocks/                    # Mock Server
│   ├── data.js              # Shared mock data
│   ├── routes/              # API endpoint definitions
│   │   ├── languages.js
│   │   ├── genres.js
│   │   ├── content.js
│   │   ├── details.js
│   │   └── discover.js
│   ├── collections.json     # Scenario collections
│   └── README.md            # Full documentation
│
├── src/services/             # API Layer
│   ├── types/index.ts       # TypeScript types
│   ├── functions/index.ts   # API client functions
│   ├── hooks/index.ts       # TanStack Query hooks
│   └── endpoints.ts         # Endpoint registry
│
├── MIGRATION_GUIDE.md       # Component migration guide
└── QUICK_START.md           # This file
```

---

## Available Endpoints

All endpoints are prefixed with `/api`:

| Endpoint | Description |
|----------|-------------|
| `/configuration/languages` | Get languages |
| `/genre/tv/list` | Get TV genres |
| `/genre/movie/list` | Get movie genres |
| `/trending/all/week` | Trending content |
| `/movie/popular` | Popular movies |
| `/tv/popular` | Popular TV shows |
| `/movie/top_rated` | Top rated movies |
| `/tv/top_rated` | Top rated TV shows |
| `/movie/now_playing` | Now playing movies |
| `/movie/:id` | Movie details |
| `/tv/:id` | TV show details |
| `/search/multi?query=` | Search content |
| `/movie/:category` | Discover movies |
| `/discover/tv` | Discover TV shows |
| `/tv/:tvId/season/:seasonNumber` | TV season details |

---

## Using TanStack Query Hooks

### Example: Fetch Trending Content

```typescript
import { useTrending } from '@/services/hooks';

export default function TrendingPage() {
  const { data: content = [], isLoading, error } = useTrending();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render content */}</div>;
}
```

### Example: Discover Movies with Filters

```typescript
import { useDiscoverMovies } from '@/services/hooks';

export default function MoviesPage() {
  const [category, setCategory] = useState('popular');
  const [genres, setGenres] = useState<number[]>([]);
  const [language, setLanguage] = useState('en');

  const { data: movies = [], isLoading } = useDiscoverMovies({
    category,
    genres,
    language,
  });

  // Automatically refetches when category, genres, or language change!

  return <div>{/* render movies */}</div>;
}
```

See `src/app/movies/page.new.tsx` for a complete example!

---

## Mock Collections (Scenarios)

Switch collections via Admin UI (http://localhost:3110) or CLI:

### Available Collections:

1. **base** (default) - All successful responses
2. **empty-data** - Returns empty results for testing
3. **all-errors** - Returns error responses (500 errors)
4. **not-found-scenarios** - Returns 404 errors

---

## Next Steps

### 1. Explore the Mock Server

```bash
# Start the server
npm run dev:mock

# Visit Admin UI
open http://localhost:3110

# Try switching collections and see how your app reacts!
```

### 2. Migrate Existing Components

See `MIGRATION_GUIDE.md` for step-by-step instructions.

Example migration already done: `src/app/movies/page.new.tsx`

Components to migrate:
- `src/app/tv-shows/page.tsx`
- `src/app/search/page.tsx`

### 3. Compare Before & After

**Old approach** (`src/app/movies/page.tsx`):
- Manual state management
- Multiple useEffect hooks
- No caching
- ~128 lines

**New approach** (`src/app/movies/page.new.tsx`):
- TanStack Query hooks
- Automatic caching
- Auto-refetch on filter changes
- ~105 lines (cleaner!)

---

## Common Commands

```bash
# Development with mock server
npm run dev:mock

# Development without mock server
npm run dev

# Start only mock server
npm run mock:server

# Build for production
npm run build

# Start production server
npm run start
```

---

## Troubleshooting

### Mock Server Not Starting

**Error:** `EADDRINUSE: address already in use`

**Solution:** Kill the process on port 3100:
```bash
# Windows
netstat -ano | findstr :3100
taskkill //PID <PID> //F

# Mac/Linux
lsof -i :3100
kill -9 <PID>
```

### Can't See React Query DevTools

- Only available in development mode
- Look for floating icon in bottom-right corner
- Check browser console for errors

### API Still Calling TMDB Instead of Mock Server

Check `src/services/endpoints.ts`:
```typescript
// Should use mock server in development
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3100/api'
  : 'https://api.themoviedb.org/3';
```

---

## Resources

- **Full Documentation:** `mocks/README.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Mocks Server Docs:** https://www.mocks-server.org/
- **TanStack Query Docs:** https://tanstack.com/query/latest

---

## Summary

You now have a fully functional development setup with:

- Mock server running on port 3100
- 13 API endpoints with realistic mock data
- TanStack Query hooks for all endpoints
- Automatic caching and request deduplication
- React Query DevTools for debugging
- Multiple test scenarios (base, empty, errors, not-found)

**Start developing:**
```bash
npm run dev:mock
```

Then open:
- App: http://localhost:9002
- Mock Admin: http://localhost:3110

Happy coding!
