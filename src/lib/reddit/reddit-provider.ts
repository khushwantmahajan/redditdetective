import type {
  ActivityQueryParams,
  ActivityStatistics,
  PaginatedResult,
  RedditActivityItem,
  RedditUserProfile,
  SubredditActivity,
} from "./reddit-types";

/**
 * The contract every Reddit data source must implement.
 *
 * The UI and API routes depend only on this interface, never on a concrete
 * provider. Today `getProvider()` (see `index.ts`) returns the mock
 * provider. When legitimate Reddit API credentials are available, a real
 * `ApiRedditProvider` implementing this same interface can be swapped in
 * with a one-line change and zero UI changes.
 */
export interface RedditProvider {
  /** Fetch public profile metadata for a username. Throws RedditLookupException on failure. */
  getUserProfile(username: string): Promise<RedditUserProfile>;

  /** Fetch a page of combined posts + comments for a username. */
  getUserActivity(
    username: string,
    params: ActivityQueryParams
  ): Promise<PaginatedResult<RedditActivityItem>>;

  /** Fetch subreddit-level activity breakdown for a username. */
  getUserCommunities(username: string): Promise<SubredditActivity[]>;

  /** Fetch computed activity statistics for a username. */
  getUserStatistics(username: string): Promise<ActivityStatistics>;
}
