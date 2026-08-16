import type { RedditProvider } from "./reddit-provider";
import { MockRedditProvider } from "./mock-provider";
import { ApiRedditProvider } from "./api-provider";
import { isRedditApiConfigured } from "./reddit-client";

export * from "./reddit-types";
export type { RedditProvider } from "./reddit-provider";
export { isRedditApiConfigured } from "./reddit-client";

/**
 * Data source switch. Set REDDIT_DATA_SOURCE=api once real Reddit API
 * credentials are configured; every other part of the app is written
 * against the `RedditProvider` interface, so nothing else needs to change.
 *
 * Safety net: even if REDDIT_DATA_SOURCE=api is set, we only actually hand
 * out the real provider when REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET /
 * REDDIT_USER_AGENT are all present — otherwise every request would fail.
 * Falling back to mock data keeps the app usable instead of erroring.
 */
let provider: RedditProvider | null = null;

export function getRedditProvider(): RedditProvider {
  if (provider) return provider;

  const wantsApi = process.env.REDDIT_DATA_SOURCE === "api";
  provider = wantsApi && isRedditApiConfigured() ? new ApiRedditProvider() : new MockRedditProvider();
  return provider;
}

/** Which provider `getRedditProvider()` will actually return right now. Useful for diagnostics/UI. */
export function getActiveRedditDataSource(): "mock" | "api" {
  const wantsApi = process.env.REDDIT_DATA_SOURCE === "api";
  return wantsApi && isRedditApiConfigured() ? "api" : "mock";
}
