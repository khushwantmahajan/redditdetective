# RedditDetective

A premium, evidence-first explorer for public Reddit activity. Enter a username and see posts,
comments, communities, statistics, and an AI summary that links every observation back to the
content it's based on — no login, no Reddit API key required to try it.

RedditDetective is an independent project and is not affiliated with, endorsed by, or sponsored
by Reddit, Inc.

## Status

**Phase 1 of 11 — foundation + landing page.** The app currently runs entirely on realistic mock
Reddit data behind a provider abstraction, so it works with zero credentials. See
[Roadmap](#roadmap) below for what's next.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- [lucide-react](https://lucide.dev) for icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try searching `u/spez`, or any username —
activity is generated deterministically from mock data, so the same username always produces the
same profile.

Other useful commands:

```bash
npm run lint    # ESLint
npm run build   # production build
npm run start   # run the production build locally
```

### Demo usernames for error states

The mock provider recognizes a few reserved usernames so you can see every error state without
needing real Reddit data:

| Username            | Result                       |
| -------------------- | ----------------------------- |
| `deleted_user`, `ghostuser404` | "not found" |
| `shadowbanned_demo`, `suspended_demo` | "suspended" |
| `private_demo`, `restricted_demo` | "private / restricted" |
| anything under 3 chars or with invalid characters | "invalid username" |
| any other 3–20 character username | generates a realistic mock profile |

## Project structure

```
src/
  app/                     Routes (App Router)
    page.tsx               Landing page
    u/[username]/page.tsx  Profile page (teaser today; full dashboard in Phase 2)
  components/
    landing/                Landing page sections
    ui/                      Small reusable UI primitives (Button, Badge)
    icons/                   Hand-picked icons not available in lucide-react
  lib/
    reddit/                  Reddit data layer — UI never talks to a provider directly
      reddit-types.ts        Shared domain types (posts, comments, profile, stats, AI types...)
      reddit-provider.ts      The `RedditProvider` interface every data source implements
      mock-provider.ts        Deterministic, seeded mock data generator (used today)
      api-provider.ts          Placeholder for the real Reddit API integration (Phase 11)
      index.ts                 `getRedditProvider()` — swap mock/real via REDDIT_DATA_SOURCE
    utils.ts                 Small shared helpers (cn, formatting, username validation)
```

The UI and any future API routes are written against `RedditProvider`, never against
`MockRedditProvider` directly. That's what lets Phase 11 (real Reddit API) drop in later without
touching any component.

## Environment variables

None are required today. `.env.example` documents the one optional toggle
(`REDDIT_DATA_SOURCE`) and reserves names for credentials future phases will need. Copy it to
`.env.local` only if you want to experiment — nothing reads `.env.local` yet since there's no real
API provider to configure.

Real secrets (Reddit client ID/secret, any AI API key) will always be read server-side only and
will never use the `NEXT_PUBLIC_` prefix.

## Design & privacy principles

- Only legitimately public Reddit data is used or ever will be used.
- AI observations must cite evidence (specific posts/comments) and link back to the original
  content.
- The AI never infers sensitive personal attributes (religion, ethnicity, sexual orientation,
  health, political affiliation, etc.) or makes psychological/medical judgments — it describes
  topics and activity patterns only.
- AI summaries are labeled as potentially incomplete or imperfect.

## Roadmap

1. ~~Foundation + landing page~~ ✅
2. Profile dashboard shell
3. Mock posts & comments views
4. Communities & statistics
5. Activity timeline
6. AI profile summary architecture
7. AI evidence system
8. Search, filtering, sorting, pagination
9. Polish, responsiveness, accessibility, performance
10. GitHub + deployment preparation
11. Research and implement legitimate Reddit API integration
