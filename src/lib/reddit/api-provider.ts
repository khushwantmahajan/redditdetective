import type { RedditProvider } from "./reddit-provider";
import {
  RedditLookupException,
  type ActivityStatistics,
  type PaginatedResult,
  type RedditActivityItem,
  type RedditUserProfile,
  type SubredditActivity,
} from "./reddit-types";

/**
 * Real Reddit API-backed provider — NOT YET IMPLEMENTED.
 *
 * This is a placeholder so the rest of the app can be written against the
 * `RedditProvider` interface today. Once legitimate Reddit API access is
 * set up (see project README, "Phase 11: Reddit API integration"), this
 * class will use OAuth2 (installed-app or web-app flow, per Reddit's
 * official API terms) and Reddit's public listing endpoints
 * (`/user/{username}/about`, `/user/{username}/submitted`,
 * `/user/{username}/comments`) to fetch real public activity.
 *
 * Requirements before this can be implemented:
 *  - A registered Reddit application (client id/secret) — REDDIT_CLIENT_ID
 *    and REDDIT_CLIENT_SECRET, kept server-side only.
 *  - Compliance with Reddit's API terms and rate limits.
 *
 * Until then, `getProvider()` in `index.ts` returns `MockRedditProvider`.
 */
export class ApiRedditProvider implements RedditProvider {
  getUserProfile(): Promise<RedditUserProfile> {
    return this.notImplemented();
  }

  getUserActivity(): Promise<PaginatedResult<RedditActivityItem>> {
    return this.notImplemented();
  }

  getUserCommunities(): Promise<SubredditActivity[]> {
    return this.notImplemented();
  }

  getUserStatistics(): Promise<ActivityStatistics> {
    return this.notImplemented();
  }

  private notImplemented(): never {
    throw new RedditLookupException({
      type: "unknown",
      message:
        "The real Reddit API provider is not implemented yet. RedditDetective is currently running on mock data.",
    });
  }
}
