# Copilot Instructions for Muvi

## Project Overview

Muvi is a movie/TV/anime tracking app. Users search for content via the TMDB API, add it to personal "Seen" or "Watchlist" lists stored in Firebase Firestore, and view statistics about their watching habits.

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint (extends next/core-web-vitals)
```

No test framework is configured.

## Architecture

**Client → TMDB API** for search/discovery. **Client → Firebase** for all persistence. There is no backend API layer — all Firebase and TMDB calls are made directly from the browser using `NEXT_PUBLIC_` env vars.

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout — wraps app in ThemeProvider + GlobalProvider
│   ├── (pages)/auth/       # Login/signup (Google OAuth + email/password)
│   └── (pages)/(has-navbar)/  # Auth-protected routes with navbar layout
│       ├── search/         # TMDB search & add to lists
│       ├── seen/           # Watched items
│       ├── watchlist/      # Watchlist items
│       ├── upcoming/       # Upcoming releases
│       ├── statistics/     # Analytics dashboard (WIP)
│       └── profile/settings/
├── api/
│   ├── api.js              # All Firestore CRUD (16 exported functions)
│   └── statistics.js       # Client-side stats calculations
├── vendor/vendor.js         # TMDB API wrapper (tmdbSearch, tmdbFetchMovies)
├── context/
│   ├── store.js            # GlobalContext — auth state + user media lists
│   └── ThemeContext.js     # Light/dark theme (partially implemented)
├── components/             # Shared UI components
│   └── statistics/         # Stats dashboard components
├── config/firebase.js      # Firebase init & exports
└── utils/constants.js      # COLORS, BORDERRADIUS, TMDB base URLs
```

## Key Conventions

**Path alias:** `@/*` maps to `src/*` — always use `@/` for imports, not relative paths.

**Styling stack:** Styled Components for dynamic/layout styles; Ant Design for most UI components; Material-UI used only for `useMediaQuery()` responsive breakpoints. No Tailwind.

**Global context:** Access auth and user data via `useGlobalContext()` from `@/context/store.js`. Access theme via `useTheme()` from `@/context/ThemeContext.js`. Never read Firebase auth state directly in components.

**Media object shape:** Items in Firestore combine TMDB data with user fields:
```js
{
  tmdb_id, title, media_type, is_anime,   // from TMDB
  my_season, my_episode, my_rating,        // user-set
  date_added, list_type, last_edited,      // metadata
  details, upcoming_release               // nested TMDB detail object
}
```

**`list_type`** distinguishes Seen (`"seen"`) from Watchlist (`"watchlist"`) items within the same Firestore collection.

**`is_anime`** is a boolean flag on media items — anime is fetched from TMDB's TV endpoint but tracked separately in the UI.

**Hydration:** GlobalContext uses a `hasMounted` flag — guard any auth-dependent rendering behind it to avoid SSR/client mismatches.

**Error handling:** Firebase error codes are transformed via `transformErrorMessage()` in `api.js`. Display errors with Ant Design's `message` API, not `alert()`.

**Auth protection:** Routes under `(has-navbar)/layout.js` redirect unauthenticated users to `/auth`. Don't add per-page auth guards.

## Environment Variables

All client-side (`NEXT_PUBLIC_`):
```
NEXT_PUBLIC_FB_API_KEY
NEXT_PUBLIC_FB_AUTH_DOMAIN
NEXT_PUBLIC_FB_PROJECT_ID
NEXT_PUBLIC_FB_STORAGE_BUCKET
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID
NEXT_PUBLIC_FB_APP_ID
NEXT_PUBLIC_FB_MEASUREMENT_ID
NEXT_PUBLIC_TMDB_ACCESS_TOKEN
```
