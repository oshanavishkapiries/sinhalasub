# Web Setup

## Prerequisites

- Node.js (LTS recommended)

## Install

```bash
npm install
```

## Environment

Create `D:\sinhalasub\web\.env` (or edit the existing one):

```bash
NEXT_PUBLIC_TMDB_API_KEY=""
```

Optional (only if you have a backend API for auth/admin features):

```bash
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Run

```bash
npm run dev
```

App runs on http://localhost:9002

## Notes

- The Mocks Server-based mock API has been removed. If you need mocks again, consider using Next.js route handlers, MSW, or a separate fixture service.
