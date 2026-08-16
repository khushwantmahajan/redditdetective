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
same profile. The search box also accepts a full profile URL (e.g.
`https://www.reddit.com/user/spez/`) or `u/spez` — everything normalizes to the bare username.

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
      api-provider.ts          Real Reddit Data API provider (implemented, not yet live — see below)
      reddit-client.ts         Low-level OAuth2 + fetch wrapper that api-provider.ts calls
      activity-query.ts        Shared filter/sort/paginate logic used by both providers
      index.ts                 `getRedditProvider()` — swap mock/real via REDDIT_DATA_SOURCE
    utils.ts                 Small shared helpers (cn, formatting, username normalization/validation)
```

The UI and any future API routes are written against `RedditProvider`, never against
`MockRedditProvider` directly. That's what lets Phase 11 (real Reddit API) drop in later without
touching any component.

## Environment variables

None are required to run the app today — it defaults to mock data. `.env.example` documents every
variable; copy it to `.env.local` (already gitignored) if you want to experiment.

| Variable | Required? | Purpose |
| --- | --- | --- |
| `REDDIT_DATA_SOURCE` | No (defaults to `mock`) | Set to `api` to use real Reddit data once the four variables below are all set. If `api` is set but any credential is missing, the app safely falls back to mock data instead of erroring. |
| `REDDIT_CLIENT_ID` | Only for real data | From an approved Reddit Data API app, registered as a "web app". |
| `REDDIT_CLIENT_SECRET` | Only for real data | Same app. Server-side only, never sent to the browser. |
| `REDDIT_REDIRECT_URI` | Only for real data (required by Reddit's registration form) | Not currently used by the app-only OAuth flow this app uses; reserved for a possible future "sign in with Reddit" feature. Any valid URL works. |
| `REDDIT_USER_AGENT` | Only for real data | Must follow Reddit's required format: `<platform>:<app ID>:<version> (by /u/<your username>)`. |

Real secrets (Reddit client ID/secret, any future AI API key) are always read server-side only and
will never use the `NEXT_PUBLIC_` prefix. `.env.local` is gitignored; `.env.example` is intentionally
tracked since it only documents variable names, never real values.

## Reddit API integration

RedditDetective is built to use Reddit's official Data API once access is approved, without any UI
changes — but as of this writing **API access has not been requested/approved yet**, so the app
runs on mock data (`REDDIT_DATA_SOURCE=mock`).

**What's already built:** `src/lib/reddit/api-provider.ts` implements the full `RedditProvider`
interface against Reddit's documented API (OAuth2 `client_credentials` "app-only" grant — the
right choice here since RedditDetective only reads public data and never asks a visitor to log
into Reddit). It calls `/user/{username}/about`, `/user/{username}/submitted`, and
`/user/{username}/comments` on `oauth.reddit.com`, obtaining tokens from
`https://www.reddit.com/api/v1/access_token`. This code has **not been tested against live Reddit
data** — there's nothing to test it with until credentials exist.

**Current official process (verified against Reddit's own documentation, August 2026):** Reddit no
longer offers an instant, no-review way to get Data API access. The current process is:

1. Review Reddit's [Developer Terms](https://www.redditinc.com/policies/developer-terms), [Data
   API Terms](https://www.redditinc.com/policies/data-api-terms), and [Responsible Builder
   Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy).
2. Submit a request through Reddit's [Data API access request
   form](https://support.reddithelp.com/hc/en-us/requests/new?ticket_form_id=14868593862164),
   describing the app and its purpose.
3. Reddit reviews the request ("App Review") and approves or denies it based on the stated use
   case. Non-commercial personal/hobby use is reviewed differently from commercial use, which
   requires a separate contract.
4. Once approved, register the actual OAuth app (client ID/secret) as a **web app**.

Sources: [Developer Platform & Accessing Reddit
Data](https://support.reddithelp.com/hc/en-us/articles/14945211791892-Developer-Platform-Accessing-Reddit-Data),
[Reddit Data API
Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki),
[OAuth2 technical
reference](https://github.com/reddit-archive/reddit/wiki/OAuth2) (linked directly from Reddit's own
Data API Wiki as the technical guidance for implementing OAuth).

**Note on the Responsible Builder Policy:** it prohibits deriving "potentially sensitive
characteristics about Reddit users" and commercializing Reddit data (including for AI model
*training*). RedditDetective's AI summary only describes topics/interests from evidence, never
sensitive attributes, and doesn't train any model — it calls an AI API at request time to summarize
content for the person who asked, similar to how a search engine's AI overview works. That
distinction should be described honestly in the API request form; final compliance judgment is
Reddit's via App Review, not something this README can decide unilaterally.

**Known limitation once live:** Reddit's listing endpoints paginate with an opaque cursor, not page
numbers. `ApiRedditProvider` currently fetches one bounded batch (100 items each of posts/comments,
Reddit's per-request max) and paginates that batch client-side, so very prolific accounts won't show
their complete history yet. Revisit with real cursor-based pagination once there's live data to test
against.

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
