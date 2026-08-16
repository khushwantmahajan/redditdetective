import type { RedditProvider } from "./reddit-provider";
import { MockRedditProvider } from "./mock-provider";
import { ApiRedditProvider } from "./api-provider";

export * from "./reddit-types";
export type { RedditProvider } from "./reddit-provider";

/**
 * Data source switch. Set REDDIT_DATA_SOURCE=api once real Reddit API
 * credentials are configured; every other part of the app is written
 * against the `RedditProvider` interface, so nothing else needs to change.
 */
let provider: RedditProvider | null = null;

export function getRedditProvider(): RedditProvider {
  if (provider) return provider;

  const dataSource = process.env.REDDIT_DATA_SOURCE ?? "mock";
  provider = dataSource === "api" ? new ApiRedditProvider() : new MockRedditProvider();
  return provider;
}
