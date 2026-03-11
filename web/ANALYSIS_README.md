# Mock Server API Structure Analysis - Complete Report

## Overview

This directory contains a comprehensive analysis of the mock server API structure for the SinhalaSub project. The analysis covers all endpoints, data models, response formats, patterns, and guidelines for extending the API.

## 📄 Document Reference

**Main Analysis Document:**
- `MOCK_API_STRUCTURE_ANALYSIS.txt` (272 lines)
  - Complete analysis with all details and code examples
  - Covers endpoints, data models, patterns, CRUD operations, admin API structure

## 📊 Analysis Contents

### 1. Current API Endpoint Patterns
- Base URLs (development, production, admin UI)
- Route structure format (Mocks Server standard)
- Response types and HTTP status codes
- Network delay simulation (500ms)

### 2. Complete Endpoint Inventory (23 Total)
- **Authentication** (5): login, signup, me, refresh, logout
- **Configuration** (1): languages
- **Genres** (2): movie genres, TV genres
- **Content Lists** (6): trending, popular, top-rated, now playing
- **Details** (2): movie details, TV details with seasons
- **Similar Content** (2): similar movies, similar TV
- **Search** (1): multi-search
- **Discover** (3): movies, TV with filters
- **TV Seasons** (1): season episodes

### 3. Data Models & Structures
- Movie model (title, overview, poster, ratings, release date, genres)
- TV Show model (name, overview, seasons with episodes)
- Season/Episode models
- Genre model
- Language model (with ISO 639-1 codes)
- User model (with roles: admin, user)

### 4. Response Format Conventions
- **Success responses**: Paginated lists, single items, auth responses
- **Error responses**: Structured with success flag, message, error code
- **HTTP status codes**: 200, 201, 400, 401, 404, 409, 500
- **Error codes**: INVALID_CREDENTIALS, EMAIL_EXISTS, NO_TOKEN, etc.

### 5. Pagination & Filtering Patterns
- **Pagination**: { page, results, total_pages, total_results }
- **Genre filtering**: Comma-separated multi-select
- **Language filtering**: ISO 639-1 single code
- **Search**: Free-text case-insensitive search
- **Combined filters**: Supported on discover endpoints

### 6. Error Handling Approach
- Proper HTTP status codes for all scenarios
- Meaningful error codes for client handling
- Graceful fallback from dynamic to static mode
- Consistent error response format

### 7. CRUD Operation Patterns
- **CREATE** (POST): Status 201, validation, ID generation
- **READ** (GET): Status 200, finds by ID, 404 if not found
- **UPDATE** (PUT): Status 200, merges with existing item
- **DELETE** (DELETE): Status 200, removes from array

### 8. Route File Organization
- 6 route files (auth, languages, genres, content, details, discover)
- Each exports array of route objects
- Multiple variants per endpoint (success, dynamic, empty, error, not-found)
- Supporting files: data.js, tmdb-fetcher.js, collections.json

### 9. Variant System (Testing Scenarios)
- **success**: Static mock response
- **dynamic**: Real TMDB API data
- **empty**: Empty results for testing
- **error**: Server error response
- **not-found**: 404 response
- Collections for switching all endpoints: base, dynamic, empty-data, all-errors, not-found-scenarios

### 10. Admin API Structure Guidelines
- Step-by-step guide for adding new endpoints
- Route file creation template
- Mock data structure examples
- Authentication middleware examples
- Best practices and conventions

## 🎯 Key Findings

### Strengths
✅ 23 well-organized endpoints with clear separation of concerns
✅ Consistent response formats across all endpoints
✅ Multiple response variants for comprehensive testing
✅ Dynamic mode allows testing with real TMDB data
✅ Full authentication system with token refresh
✅ Filtering, pagination, and search capabilities
✅ Graceful error handling with fallbacks
✅ Admin UI for easy scenario switching
✅ Ready-to-extend architecture for admin APIs
✅ Proper HTTP status codes and error codes

### Architecture Patterns
✅ Middleware-based route handlers for complex logic
✅ Variants system for testing different scenarios
✅ Collections for grouping related scenario switches
✅ Centralized mock data in mocks/data.js
✅ Separation of concerns (routes, data, configuration)

## 🚀 Quick Start

### Starting Development
```bash
npm run dev:mock           # Start with mock server
npm run mock:server        # Start mock server only
npm run dev                # Start without mock server
```

### Accessing Services
- Frontend: http://localhost:9002
- Mock API: http://localhost:3100/api
- Admin UI: http://localhost:3110

### Testing Collections
1. Open Admin UI: http://localhost:3110
2. Click "Select collection"
3. Choose desired scenario:
   - `base` - Static mock data
   - `dynamic` - Real TMDB data
   - `empty-data` - Empty results
   - `all-errors` - Error responses
   - `not-found-scenarios` - 404 responses

## 📝 Adding New Admin APIs

### Step-by-Step Process
1. Create `mocks/routes/admin-resource.js`
2. Define CRUD endpoints with variants
3. Add mock data to `mocks/data.js`
4. Update `mocks/collections.json`
5. Add authentication middleware if needed
6. Create service functions
7. Create TanStack Query hooks
8. Update endpoint registry
9. Add TypeScript types
10. Document in ENDPOINTS.md

### Best Practices
- Use kebab-case for route IDs
- Use `/api/resource-type/action` for URLs
- Provide success, error, not-found variants
- Use middleware type for complex logic
- Return consistent response format
- Use proper HTTP status codes
- Validate input before processing
- Check authorization headers
- Update all collections

## 📂 File Locations

- **Routes**: `mocks/routes/`
- **Mock Data**: `mocks/data.js`
- **Configuration**: `mocks.config.js`
- **Collections**: `mocks/collections.json`
- **TMDB Integration**: `mocks/tmdb-fetcher.js`
- **Services**: `src/services/`

## 🔐 Authentication

### Mock Users
- **Admin**: admin@sinhalasub.lk (password: test@123)
- **User**: user@sinhalasub.lk (password: test@123)

### Flow
1. Login → Receive token and refreshToken
2. Use token in Authorization header: `Bearer <token>`
3. Refresh token to get new token before expiry
4. Logout to clear session

## 🎬 Available Languages

- English (en)
- Sinhala (si)
- Tamil (ta)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Korean (ko)
- Hindi (hi)

## 📋 Endpoint Summary Table

| Category | Count | Endpoints |
|----------|-------|-----------|
| Authentication | 5 | login, signup, me, refresh, logout |
| Configuration | 1 | languages |
| Genres | 2 | movie genres, TV genres |
| Content Lists | 6 | trending, popular, top-rated, now-playing |
| Details | 2 | movie details, TV details |
| Similar Content | 2 | similar movies, similar TV |
| Search | 1 | multi-search |
| Discover | 3 | movies, TV, TV by category |
| TV Seasons | 1 | season episodes |
| **TOTAL** | **23** | **All endpoints** |

## 🔄 Dynamic Mode

### How It Works
- Fetches real TMDB API data through mock server
- Maintains 500ms simulated network delay
- All requests still go through localhost:3100
- Easy switching between mock and real data

### Available Functions
- fetchLanguages()
- fetchTVGenres() / fetchMovieGenres()
- fetchTrending() / fetchPopular() / fetchTopRated() / fetchNowPlaying()
- fetchContentDetails(id, type)
- fetchSimilarContent(id, type)
- searchContent(query)
- fetchDiscoverMovies/TV(category, genres, language)
- fetchTVSeason(tvId, seasonNumber)

## ✨ Summary

The mock server provides a solid, well-organized foundation for:
- Local development with mock data
- Testing with real TMDB data
- Multiple scenario testing via collections
- Full CRUD operations
- Authentication and authorization
- Filtering, pagination, and search
- Easy extension for new admin APIs

All patterns and structures are established and ready for implementation of new features.

---

**Analysis Date**: March 11, 2026
**Framework**: Mocks Server v3+ + Express.js + Next.js 13+ + TanStack Query
**Total Endpoints**: 23
**Route Files**: 6
**Documentation**: Comprehensive (272 lines)
