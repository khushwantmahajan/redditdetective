/**
 * Core domain types for RedditDetective's Reddit data layer.
 *
 * These types are intentionally provider-agnostic: both the mock provider
 * (used today) and the future real Reddit API provider must return data
 * shaped exactly like this. UI code should only ever import from this file
 * and from `reddit-provider.ts` — never reach into a specific provider.
 */

export type ContentKind = "post" | "comment";

/** A public Reddit post authored by a user. */
export interface RedditPost {
  id: string;
  kind: "post";
  title: string;
  /** Self-text body for text posts. Undefined for link/image/video posts. */
  body?: string;
  subreddit: string;
  author: string;
  score: number;
  upvoteRatio: number;
  numComments: number;
  createdAt: string; // ISO 8601
  permalink: string; // relative Reddit permalink, e.g. /r/programming/comments/abc123/title
  url?: string; // external link for link posts
  flair?: string;
  isNsfw: boolean;
  isStickied: boolean;
  awards: number;
  postType: "text" | "link" | "image" | "video";
  thumbnailUrl?: string;
}

/** A public Reddit comment authored by a user. */
export interface RedditComment {
  id: string;
  kind: "comment";
  body: string;
  subreddit: string;
  author: string;
  score: number;
  createdAt: string; // ISO 8601
  permalink: string;
  /** Title of the submission this comment belongs to. */
  postTitle: string;
  postId: string;
  isNsfw: boolean;
  awards: number;
  /** Depth in the comment thread; 0 = top-level reply to the post. */
  depth: number;
}

export type RedditActivityItem = RedditPost | RedditComment;

/** Aggregated info about a subreddit the user is active in. */
export interface SubredditActivity {
  subreddit: string;
  postCount: number;
  commentCount: number;
  totalScore: number;
  /** 0-1, share of this user's total activity that happens here. */
  activityShare: number;
  lastActiveAt: string; // ISO 8601
}

/** Public, non-sensitive profile metadata. */
export interface RedditUserProfile {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string; // ISO 8601 account creation date
  commentKarma: number;
  postKarma: number;
  totalKarma: number;
  isVerified: boolean;
  isGold: boolean;
  bannerUrl?: string;
  bio?: string;
}

/** Bucketed statistics used to power charts and the stats panel. */
export interface ActivityStatistics {
  totalPosts: number;
  totalComments: number;
  averagePostScore: number;
  averageCommentScore: number;
  topSubreddits: SubredditActivity[];
  /** Activity count grouped by hour-of-day (0-23), local to the account's data. */
  activityByHour: number[]; // length 24
  /** Activity count grouped by day-of-week (0=Sunday .. 6=Saturday). */
  activityByDayOfWeek: number[]; // length 7
  /** Activity count grouped by month, most recent 12 months, oldest first. */
  activityByMonth: { month: string; posts: number; comments: number }[];
  mostUpvotedPost?: RedditPost;
  mostUpvotedComment?: RedditComment;
  accountAgeDays: number;
}

/** A single evidence citation supporting an AI observation. */
export interface EvidenceItem {
  itemId: string;
  kind: ContentKind;
  excerpt: string;
  subreddit: string;
  permalink: string;
  createdAt: string;
}

/** One observation produced by the AI summary, always evidence-backed. */
export interface AiObservation {
  id: string;
  category: "topic" | "community" | "pattern" | "interest";
  summary: string;
  confidence: "low" | "medium" | "high";
  evidence: EvidenceItem[];
}

/** Full AI-generated profile summary. Never includes sensitive inferences. */
export interface AiProfileSummary {
  username: string;
  generatedAt: string;
  overview: string;
  observations: AiObservation[];
  topTopics: { topic: string; weight: number }[];
  disclaimer: string;
}

export type SortOption = "new" | "top" | "controversial" | "old";
export type TimeRange = "day" | "week" | "month" | "year" | "all";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ActivityQueryParams extends PaginationParams {
  sort?: SortOption;
  timeRange?: TimeRange;
  search?: string;
  subreddit?: string;
  kind?: ContentKind | "all";
}

/** Discriminated error type so the UI can render precise empty/error states. */
export type RedditLookupError =
  | { type: "not_found"; username: string }
  | { type: "suspended"; username: string }
  | { type: "private_or_restricted"; username: string }
  | { type: "rate_limited"; retryAfterSeconds?: number }
  | { type: "network_error"; message: string }
  | { type: "invalid_username"; username: string }
  | { type: "unknown"; message: string };

export class RedditLookupException extends Error {
  constructor(public readonly error: RedditLookupError) {
    super(RedditLookupException.messageFor(error));
    this.name = "RedditLookupException";
  }

  static messageFor(error: RedditLookupError): string {
    switch (error.type) {
      case "not_found":
        return `User u/${error.username} could not be found.`;
      case "suspended":
        return `User u/${error.username} is suspended.`;
      case "private_or_restricted":
        return `User u/${error.username}'s activity is private or restricted.`;
      case "rate_limited":
        return "Rate limited. Please try again shortly.";
      case "network_error":
        return `Network error: ${error.message}`;
      case "invalid_username":
        return `"${error.username}" is not a valid Reddit username.`;
      case "unknown":
        return error.message;
    }
  }
}
