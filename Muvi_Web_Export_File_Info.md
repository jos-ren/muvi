# Muvi Export Guide

This document explains the structure of a Muvi Web JSON export file — what every field means, where it came from, and how the pieces fit together.

---

## What is this file?

When you press **Export as JSON** in Muvi's Settings page, the app reads your entire personal library from Firebase Firestore and saves it as a single `.json` file. The file contains two main collections:

| Collection | What it is |
|---|---|
| **`mediaList`** | Every movie, TV show, and anime you have ever added — whether you've watched it or just bookmarked it for later. |
| **`watchHistory`** | A day-by-day log of when you watched things. Each entry records a single "session" for one title on one date. |

There is **no** user profile data, credentials, or sensitive account information in the export. It is purely your content library and viewing activity.

---

## Top-Level Structure

```json
{
  "exportedAt": "2026-04-05T03:43:58.401Z",
  "version": "1",
  "mediaList": [ ... ],
  "watchHistory": [ ... ]
}
```

| Field | Description |
|---|---|
| `exportedAt` | ISO 8601 timestamp of when the export was generated. |
| `version` | Schema version number. Currently always `"1"`. Used for forward-compatibility if the export format ever changes. |
| `mediaList` | Array of media items (see below). |
| `watchHistory` | Array of watch log entries (see below). |

---

## MediaList

Each object in `mediaList` represents one title (a movie, TV show, or anime) that exists in your library. Every title is in exactly one of two lists: **Seen** or **Watchlist**.

### Full field reference

| Field | Type | Source | Description |
|---|---|---|---|
| `docId` | string | Firebase | The Firestore document ID. Auto-generated, looks like `0A2N1fsZstwUxKx6t4jY`. Used internally for database operations. |
| `tmdb_id` | number | TMDB | The unique identifier for this title on [The Movie Database](https://www.themoviedb.org/). For example, `108978` is Reacher. This is the primary key used to detect duplicates during import. |
| `title` | string | TMDB | The English display name. For movies this comes from `title`; for TV/anime it comes from `name` in the TMDB API. |
| `media_type` | string | TMDB | Always one of: `"movie"` or `"tv"`. Note: anime is also `"tv"` — the `is_anime` flag distinguishes it. |
| `is_anime` | boolean | Derived | `true` if the title's original language is Japanese **and** it has the Animation genre (TMDB genre ID 16). This is determined automatically when the item is first added. |
| `is_seasonal_anime` | boolean | User | An optional flag that can be set on anime titles. Indicates the anime follows a seasonal release schedule (as opposed to continuous/completed runs). Not present on most items. |
| `list_type` | string | User | Which list this item belongs to: **`"seen"`** (you've watched it) or **`"watchlist"`** (you plan to watch it). Items can be moved between lists. |
| `my_season` | number | User | The season you've watched up to. For movies this is always `1` (meaningless — movies don't have seasons). For TV/anime, this tracks your progress. |
| `my_episode` | number | User | The episode you've watched up to within `my_season`. For movies this is always `1`. For TV/anime, this tracks your progress. For example, `my_season: 3, my_episode: 5` means "I've watched up to Season 3, Episode 5." |
| `my_rating` | number | User | Your personal rating on a 1–10 scale (allows decimals like `7.5`). `0` means unrated. Watchlist items are never rated. |
| `my_review` | string | User | An optional free-text personal note or review. Not present on most items. |
| `date_added` | string (ISO 8601) | System | When you first added this title to your library. |
| `last_edited` | string (ISO 8601) | System | When this item was last modified (e.g., you updated your rating, changed your season/episode progress, or moved it between lists). |
| `release_date` | string (YYYY-MM-DD) | TMDB | The original release date. For movies, this is the theatrical release. For TV, this is the first episode's air date. |
| `upcoming_release` | string (YYYY-MM-DD) | TMDB | For **movies**: identical to `release_date`. For **TV**: the air date of the next upcoming episode (if the show is still airing), or the last episode's air date (if the show has ended). Used by Muvi's Upcoming page to notify you about new releases. |
| `is_hidden` | boolean or null | User | Controls visibility on the Upcoming page. `true` = hidden from Upcoming, `false` = explicitly unhidden, `null`/absent = default (shown). You can hide items from Settings. |
| `details` | object | TMDB | The full TMDB API response for this title. This is a large nested object containing rich metadata (see breakdown below). |

### Understanding `list_type`

Every item is in exactly one list:

- **`"seen"`** — You have watched this title (or are currently watching it). You can set a rating, update your season/episode progress, and write a review.
- **`"watchlist"`** — You plan to watch this but haven't started. Watchlist items always have `my_rating: 0`, `my_season: 1`, `my_episode: 1`, and no review.

When you move an item from Watchlist to Seen (or vice versa), the `list_type` is updated and `last_edited` records when the move happened.

### Understanding `my_season` / `my_episode` for TV shows

These fields track your viewing progress:

| Scenario | `my_season` | `my_episode` | Meaning |
|---|---|---|---|
| Just added a TV show | `1` | `1` | Default starting point |
| Watching Season 3, finished Episode 7 | `3` | `7` | Up to S3E7 |
| Finished entire series (5 seasons) | `5` | `24` | Last season, last episode |
| It's a movie | `1` | `1` | Always defaults — not meaningful for movies |

### Understanding `is_anime` vs. `media_type`

In the TMDB API, anime is categorized as TV. Muvi detects anime automatically:

```
If original_language == "ja" AND genres include Animation (ID 16)
    → is_anime = true
```

So `media_type` will be `"tv"` and `is_anime` will be `true`. The UI uses this flag to display anime in a separate tab from regular TV shows.

---

## The `details` Object (TMDB Data)

The `details` field is a snapshot of the full TMDB API response at the time the title was added (and periodically refreshed for returning series). It contains rich metadata straight from TMDB.

### Movie `details`

| Field | Type | Description |
|---|---|---|
| `id` | number | TMDB ID (same as parent `tmdb_id`) |
| `title` | string | English title |
| `original_title` | string | Title in original language |
| `overview` | string | Plot synopsis |
| `tagline` | string | Marketing tagline |
| `status` | string | Release status (see table below) |
| `release_date` | string | Theatrical release date |
| `runtime` | number | Duration in minutes |
| `budget` | number | Production budget in USD |
| `revenue` | number | Box office revenue in USD |
| `imdb_id` | string | IMDb ID (e.g., `"tt0101414"`) |
| `poster_path` | string | Path to poster image (append to `https://image.tmdb.org/t/p/original/`) |
| `backdrop_path` | string | Path to backdrop image |
| `genres` | array | Genre objects: `[{ "id": 12, "name": "Adventure" }]` |
| `production_companies` | array | Studio/producer objects: `[{ "id": 3857, "name": "Fireworks Pictures", "origin_country": "CA" }]` |
| `production_countries` | array | Country objects |
| `spoken_languages` | array | Language objects |
| `vote_average` | number | TMDB community average rating (1–10 scale) |
| `vote_count` | number | Number of TMDB user votes |
| `popularity` | number | TMDB popularity score |
| `adult` | boolean | Whether this is classified as adult content |
| `belongs_to_collection` | object or null | If part of a franchise (e.g., `{ "name": "Beauty and the Beast Collection" }`) |

**Movie `status` values:**

| Status | Meaning |
|---|---|
| `"Released"` | Available to watch |
| `"In Production"` | Currently being made |
| `"Post Production"` | Filming complete, in post-production |
| `"Planned"` | Announced but not yet in production |

### TV Show / Anime `details`

TV shows have a different shape than movies:

| Field | Type | Description |
|---|---|---|
| `id` | number | TMDB ID |
| `name` | string | English title (TV uses `name`, not `title`) |
| `original_name` | string | Original language title |
| `overview` | string | Show synopsis |
| `tagline` | string | Show tagline |
| `status` | string | Airing status (see table below) |
| `type` | string | Show type (e.g., `"Scripted"`, `"Miniseries"`) |
| `first_air_date` | string | When the first episode aired |
| `last_air_date` | string | When the most recent episode aired |
| `number_of_seasons` | number | Total season count |
| `number_of_episodes` | number | Total episode count across all seasons |
| `in_production` | boolean | Whether the show is still actively producing episodes |
| `poster_path` | string | Poster image path |
| `backdrop_path` | string | Backdrop image path |
| `genres` | array | Genre objects |
| `networks` | array | Broadcasting networks |
| `created_by` | array | Show creators |
| `production_companies` | array | Production companies |
| `production_countries` | array | Production countries |
| `spoken_languages` | array | Languages |
| `origin_country` | array | Country of origin codes |
| `vote_average` | number | TMDB average rating |
| `vote_count` | number | Number of TMDB votes |
| `popularity` | number | TMDB popularity score |
| `seasons` | array | Season details (see below) |
| `next_episode_to_air` | object or null | Details of the next episode to air, if any |
| `last_episode_to_air` | object or null | Details of the most recently aired episode |

**TV `status` values:**

| Status | Meaning |
|---|---|
| `"Returning Series"` | Renewed; new episodes are coming |
| `"Ended"` | Concluded naturally |
| `"Canceled"` | Cancelled before a planned conclusion |
| `"In Production"` | Being produced but hasn't aired yet |

### The `seasons` array

Each element in `details.seasons` describes one season:

```json
{
  "season_number": 1,
  "name": "Season 1",
  "episode_count": 25,
  "air_date": "2006-10-05",
  "overview": "After the Holy Empire...",
  "poster_path": "/up5U9C0leEStyrgP7H317CGyYco.jpg",
  "vote_average": 7.9,
  "id": 43227
}
```

Season 0 is "Specials" — bonus content, OVAs, or standalone episodes not part of the main run.

### `next_episode_to_air` / `last_episode_to_air`

These objects describe a single episode:

```json
{
  "season_number": 3,
  "episode_number": 8,
  "name": "Unfinished Business",
  "air_date": "2025-03-27",
  "episode_type": "finale",
  "overview": "Reacher finally faces off with both Paulie and Quinn.",
  "runtime": null,
  "still_path": "/y0LEFFyCAZqZPM7zggm4KysdF2h.jpg"
}
```

`next_episode_to_air` is `null` when a show has ended, been canceled, or the next episode hasn't been announced. `last_episode_to_air` is always populated for shows that have aired at least one episode.

---

## WatchHistory

The `watchHistory` array is a chronological log of viewing activity. Each entry represents one "viewing session" — the act of watching something on a specific date.

### Full field reference

| Field | Type | Present For | Description |
|---|---|---|---|
| `docId` | string | All | Firestore document ID. Format: `"YYYY-MM-DD_tmdbId"` (e.g., `"2024-11-20_1622"`). This encodes both the date and the show, meaning there is **at most one entry per title per day**. |
| `date` | string | All | The date in `YYYY-MM-DD` format. |
| `type` | string | All | `"movie"`, `"tv"`, or `"anime"`. |
| `showId` | number | All | The TMDB ID of the title watched. Links back to `tmdb_id` in mediaList. |
| `showName` | string | All | Display name of the title. |
| `thumbnail` | string or null | All | Poster image path. May be `null` for older entries. |
| `startSeason` | number | TV/Anime only | The season you were on at the **start** of this viewing session. |
| `startEpisode` | number | TV/Anime only | The episode you were on at the **start** of this session. |
| `endSeason` | number | TV/Anime only | The season you were on at the **end** of this session. |
| `endEpisode` | number | TV/Anime only | The episode you reached by the **end** of this session. |
| `episodesWatched` | number | TV/Anime only | Total number of episodes watched in this session. Calculated from the start/end positions and TMDB season data. |

### How watch history entries are created

A watch history entry is logged automatically whenever:
1. You **add a title to your Seen list** (first watch)
2. You **update your season/episode progress** on a TV show or anime
3. You **move an item from Watchlist to Seen**

There is **at most one entry per title per day** (the doc ID `YYYY-MM-DD_tmdbId` enforces this). If you update your progress on the same show multiple times in one day, the existing entry is updated rather than a new one being created.

### Movie vs. TV watch history

**Movies** have minimal entries — just the date and identifiers. Movies don't have season/episode tracking:

```json
{
  "docId": "2024-11-20_989662",
  "date": "2024-11-20",
  "type": "movie",
  "showId": 989662,
  "showName": "A Different Man",
  "thumbnail": null
}
```

**TV shows and anime** include the full episode range:

```json
{
  "docId": "2024-11-20_1622",
  "date": "2024-11-20",
  "type": "tv",
  "showId": 1622,
  "showName": "Supernatural",
  "startSeason": 2,
  "startEpisode": 22,
  "endSeason": 3,
  "endEpisode": 2,
  "episodesWatched": 3,
  "thumbnail": null
}
```

This entry means: "On November 20, 2024, I watched Supernatural from Season 2, Episode 22 through Season 3, Episode 2, totaling 3 episodes."

### Reading a show's watch history progression

When you look at multiple watch history entries for the same show sorted by date, you can see the binge pattern:

```
2024-11-20  Supernatural  S2E22 → S3E2   (3 episodes)
2024-11-21  Supernatural  S3E2  → S3E5   (3 episodes)
2024-11-23  Supernatural  S3E5  → S3E7   (2 episodes)
2024-12-02  Supernatural  S3E7  → S3E11  (4 episodes)
2024-12-05  Supernatural  S3E11 → S3E13  (2 episodes)
2024-12-14  Supernatural  S3E15 → S3E16  (1 episode)
```

The `startSeason`/`startEpisode` of each entry typically matches (or is close to) the `endSeason`/`endEpisode` of the previous entry, forming a continuous timeline of viewing progress.

---
