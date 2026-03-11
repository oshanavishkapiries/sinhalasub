# Dynamic Mock Server - Using Real TMDB Data

## Overview

The mock server now supports **dynamic mode** where it fetches real data from the TMDB API instead of serving static mock data. This gives you the best of both worlds:

- **Development**: Use real TMDB data through the mock server (port 3100)
- **Testing**: Switch to static data for predictable, offline testing
- **Production**: Frontend automatically uses the real TMDB API

## How It Works

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐
│  Frontend   │────────▶│ Mock Server  │────────▶│  TMDB API  │
│ (localhost: │         │ (port 3100)  │         │   (Real)   │
│    9002)    │         │              │         │            │
└─────────────┘         └──────────────┘         └────────────┘
                             ▲
                             │
                        Caches & Adds
                        500ms Delay
```

## Switching Between Modes

### 1. Static Mode (Default)
Uses hardcoded mock data from `mocks/data.js`

```javascript
// mocks.config.js
selected: "base"  // Static data
```

### 2. Dynamic Mode
Fetches real data from TMDB API

```javascript
// mocks.config.js
selected: "dynamic"  // Real TMDB data
```

### 3. Using Admin UI
You can switch collections in real-time:

1. Open Admin UI: http://localhost:3110
2. Select "Select collection"
3. Choose:
   - `base` - Static mock data
   - `dynamic` - Real TMDB data  
   - `empty-data` - Empty results
   - `all-errors` - Error responses
   - `not-found-scenarios` - 404 errors

## Configuration

The dynamic mode requires your TMDB API key to be set in `.env`:

```env
NEXT_PUBLIC_TMDB_API_KEY="your_api_key_here"
```

The mock server automatically loads this using `dotenv`.

## Files Created

### Core Files

**`mocks/tmdb-fetcher.js`** (230 lines)
- Fetches real data from TMDB API
- 13 functions matching all API endpoints
- Automatic error handling and logging
- Returns same format as static mocks

### Updated Files

All route files now have `dynamic` variants:
- `mocks/routes/languages.js` - Languages endpoint
- `mocks/routes/genres.js` - TV & Movie genres
- `mocks/routes/content.js` - Trending, popular, top rated, now playing
- `mocks/routes/details.js` - Details, search, similar content
- `mocks/routes/discover.js` - Discover movies/TV, seasons

**`mocks/collections.json`**
- Added `dynamic` collection with all dynamic variants

**`mocks.config.js`**
- Default collection changed to `dynamic`

## Advantages of Dynamic Mode

### 1. **Real Data**
- Get actual trending movies/TV shows
- Search returns real results
- See actual genres, ratings, release dates
- Real posters and backdrops

### 2. **Development Speed**
- No need to update mock data
- Test with latest TMDB content
- Realistic data volumes

### 3. **Still Local**
- All requests go through localhost:3100
- Simulated 500ms network delay
- CORS handled by mock server
- Can test offline with static mode

### 4. **Easy Testing**
- Switch to static mode for predictable tests
- Switch to error mode to test error handling
- Switch to empty mode to test empty states

## API Endpoints (All Work in Dynamic Mode)

✅ **Configuration**
- `GET /api/configuration/languages`

✅ **Genres**
- `GET /api/genre/tv/list`
- `GET /api/genre/movie/list`

✅ **Content Lists**
- `GET /api/trending/all/week`
- `GET /api/movie/popular`
- `GET /api/tv/popular`
- `GET /api/movie/top_rated`
- `GET /api/tv/top_rated`
- `GET /api/movie/now_playing`

✅ **Details & Search**
- `GET /api/movie/:id`
- `GET /api/tv/:id`
- `GET /api/search/multi?query=...`
- `GET /api/movie/:id/similar`
- `GET /api/tv/:id/similar`

✅ **Discover & Seasons**
- `GET /api/movie/:category?with_genres=...&with_original_language=...`
- `GET /api/tv/:category?with_genres=...&with_original_language=...`
- `GET /api/discover/tv?with_genres=...`
- `GET /api/tv/:tvId/season/:seasonNumber`

## Testing

### Test Dynamic Mode

```bash
# Start servers with dynamic mode
npm run dev:mock

# Test trending (real data)
curl http://localhost:3100/api/trending/all/week

# Test search (real results)
curl "http://localhost:3100/api/search/multi?query=avatar"

# Test genres (real genres)
curl http://localhost:3100/api/genre/movie/list
```

### Switch to Static Mode

```bash
# 1. Open mocks.config.js
# 2. Change: selected: "dynamic" → selected: "base"
# 3. Mock server auto-reloads

# Or use Admin UI at http://localhost:3110
```

## Verified Working

All endpoints tested and working with real TMDB data:

- ✅ Trending: Returns real trending content (ONE PIECE, War Machine, etc.)
- ✅ Search: Returns real search results (Avatar 2009, etc.)
- ✅ Genres: Returns 19 movie genres & 16 TV genres from TMDB
- ✅ Popular: Real popular movies and TV shows
- ✅ Details: Real movie/TV details by ID

## Performance

- **Network Delay**: 500ms simulated (configurable in `mocks.config.js`)
- **TMDB API**: ~200-300ms response time
- **Total**: ~700-800ms per request (realistic development environment)

## Troubleshooting

### "Empty results" in dynamic mode

Check if API key is loaded:
```bash
# Should see: [TMDB Fetcher] API key loaded successfully
npm run dev:mock
```

### API key not found

Make sure `.env` file exists with:
```env
NEXT_PUBLIC_TMDB_API_KEY="your_key"
```

### Want to see API calls

Check mock server logs - they now include:
```
[TMDB Fetcher] Fetching: https://api.themoviedb.org/3/...
[TMDB Fetcher] Success: /trending/all/week returned {...}
```

## Summary

You now have a flexible mock server that can:
1. ✅ Use **real TMDB data** in development (dynamic mode)
2. ✅ Use **static mock data** for predictable testing (base mode)
3. ✅ Switch between modes **in real-time** via Admin UI
4. ✅ Work **offline** with static mode when needed
5. ✅ **Simulate** network delays and errors

This is the best of both worlds! 🎉
