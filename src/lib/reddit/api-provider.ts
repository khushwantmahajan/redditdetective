import type { RedditProvider } from "./reddit-provider";
import { redditGet, RedditApiError } from "./reddit-client";
import { queryActivity } from "./activity-query";
import {
  RedditLookupException,
  type ActivityQueryParams,
  type ActivityStatistics,
  type PaginatedResult,
  type RedditActivityItem,
  type RedditComment,
  type RedditPost,
  type RedditUserProfile,
  type SubredditActivity,
} from "./reddit-types";

/**
 * Real Reddit Data API-backed provider.
 *
 * Status as of this writing: RedditDetective does NOT yet have approved
 * Reddit API credentials (see project README / HUMAN ACTION REQUIRED note
 * from the API access request). This class is written carefully against
 * Reddit's documented, long-stable public API shape, but it has not been
 * exercised against a live account — treat it as untested until
 * REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET are configured and someone runs a
 * real lookup end to end.
 *
 * Known limitation (documented, not a bug to "fix" casually): Reddit's own
 * listing endpoints paginate with an opaque `after` cursor, not page
 * numbers. To keep the exact same `ActivityQueryParams` (page/pageSize)
 * contract the UI already uses against the mock provider, this class fetches
 * one bounded batch per user (Reddit's per-request max, 100 items, for
 * submitted and comments each) and paginates/sorts/filters that batch
 * client-side via the same `queryActivity` helper the mock provider uses.
 * That means very prolific accounts (100+ posts or comments) won't show
 * their full history through this provider yet — revisit with real cursor
 * pagination once we're actually testing against live data.
 */

const FETCH_LIMIT = 100;

interface RedditListing<T> {
  kind: "Listing";
  data: {
    children: { kind: string; data: T }[];
    after: string | null;
    before: string | null;
  };
}

interface RawAbout {
  name: string;
  icon_img?: string;
  created_utc: number;
  comment_karma: number;
  link_karma: number;
  total_karma?: number;
  is_gold?: boolean;
  has_verified_email?: boolean;
  is_suspended?: boolean;
  subreddit?: {
    public_description?: string;
    banner_img?: string;
  };
}

interface RawLink {
  id: string;
  title: string;
  selftext?: string;
  subreddit: string;
  author: string;
  score: number;
  upvote_ratio?: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  url?: string;
  link_flair_text?: string | null;
  over_18?: boolean;
  stickied?: boolean;
  total_awards_received?: number;
  is_self?: boolean;
  post_hint?: string;
  thumbnail?: string;
}

interface RawComment {
  id: string;
  body: string;
  subreddit: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
  link_title?: string;
  link_id?: string;
  over_18?: boolean;
  total_awards_received?: number;
  depth?: number;
}

function mapPost(raw: RawLink): RedditPost {
  const postType: RedditPost["postType"] = raw.is_self
    ? "text"
    : raw.post_hint === "image"
      ? "image"
      : raw.post_hint === "hosted:video" || raw.post_hint === "rich:video"
        ? "video"
        : "link";

  return {
    id: raw.id,
    kind: "post",
    title: raw.title,
    body: raw.is_self ? raw.selftext || undefined : undefined,
    subreddit: raw.subreddit,
    author: raw.author,
    score: raw.score,
    upvoteRatio: raw.upvote_ratio ?? 1,
    numComments: raw.num_comments,
    createdAt: new Date(raw.created_utc * 1000).toISOString(),
    permalink: raw.permalink,
    url: postType !== "text" ? raw.url : undefined,
    flair: raw.link_flair_text || undefined,
    isNsfw: Boolean(raw.over_18),
    isStickied: Boolean(raw.stickied),
    awards: raw.total_awards_received ?? 0,
    postType,
    thumbnailUrl:
      raw.thumbnail && raw.thumbnail.startsWith("http") ? raw.thumbnail : undefined,
  };
}

function mapComment(raw: RawComment): RedditComment {
  return {
    id: raw.id,
    kind: "comment",
    body: raw.body,
    subreddit: raw.subreddit,
    author: raw.author,
    score: raw.score,
    createdAt: new Date(raw.created_utc * 1000).toISOString(),
    permalink: raw.permalink,
    postTitle: raw.link_title ?? "",
    postId: raw.link_id ?? "",
    isNsfw: Boolean(raw.over_18),
    awards: raw.total_awards_received ?? 0,
    depth: raw.depth ?? 0,
  };
}

function toLookupException(err: unknown, username: string): RedditLookupException {
  if (err instanceof RedditApiError) {
    switch (err.status) {
      case 404:
        return new RedditLookupException({ type: "not_found", username });
      case 403:
        return new RedditLookupException({ type: "private_or_restricted", username });
      case 429:
        return new RedditLookupException({
          type: "rate_limited",
          retryAfterSeconds: err.retryAfterSeconds,
        });
      case 0:
        return new RedditLookupException({ type: "unknown", message: err.message });
      default:
        return new RedditLookupException({
          type: "network_error",
          message: err.message,
        });
    }
  }
  return new RedditLookupException({
    type: "unknown",
    message: err instanceof Error ? err.message : "Unknown error contacting Reddit.",
  });
}

async function fetchAllActivity(username: string): Promise<RedditActivityItem[]> {
  const [submitted, comments] = await Promise.all([
    redditGet<RedditListing<RawLink>>(`/user/${encodeURIComponent(username)}/submitted`, {
      limit: FETCH_LIMIT,
    }),
    redditGet<RedditListing<RawComment>>(`/user/${encodeURIComponent(username)}/comments`, {
      limit: FETCH_LIMIT,
    }),
  ]);

  const posts = submitted.data.children.map((c) => mapPost(c.data));
  const commentItems = comments.data.children.map((c) => mapComment(c.data));
  return [...posts, ...commentItems];
}

function communitiesFromActivity(items: RedditActivityItem[]): SubredditActivity[] {
  const stats = new Map<
    string,
    { posts: number; comments: number; score: number; last: Date }
  >();

  for (const item of items) {
    const createdAt = new Date(item.createdAt);
    const entry = stats.get(item.subreddit) ?? {
      posts: 0,
      comments: 0,
      score: 0,
      last: createdAt,
    };
    entry.score += item.score;
    if (createdAt > entry.last) entry.last = createdAt;
    if (item.kind === "post") entry.posts++;
    else entry.comments++;
    stats.set(item.subreddit, entry);
  }

  const total = items.length || 1;
  return Array.from(stats.entries())
    .map(([subreddit, s]) => ({
      subreddit,
      postCount: s.posts,
      commentCount: s.comments,
      totalScore: s.score,
      activityShare: (s.posts + s.comments) / total,
      lastActiveAt: s.last.toISOString(),
    }))
    .sort((a, b) => b.activityShare - a.activityShare);
}

export class ApiRedditProvider implements RedditProvider {
  async getUserProfile(username: string): Promise<RedditUserProfile> {
    try {
      const about = await redditGet<{ data: RawAbout }>(
        `/user/${encodeURIComponent(username)}/about`
      );
      const data = about.data;

      if (data.is_suspended) {
        throw new RedditLookupException({ type: "suspended", username });
      }

      return {
        username: data.name,
        avatarUrl: data.icon_img ? data.icon_img.split("?")[0] : undefined,
        createdAt: new Date(data.created_utc * 1000).toISOString(),
        commentKarma: data.comment_karma,
        postKarma: data.link_karma,
        totalKarma: data.total_karma ?? data.comment_karma + data.link_karma,
        isVerified: Boolean(data.has_verified_email),
        isGold: Boolean(data.is_gold),
        bannerUrl: data.subreddit?.banner_img || undefined,
        bio: data.subreddit?.public_description || undefined,
      };
    } catch (err) {
      if (err instanceof RedditLookupException) throw err;
      throw toLookupException(err, username);
    }
  }

  async getUserActivity(
    username: string,
    params: ActivityQueryParams
  ): Promise<PaginatedResult<RedditActivityItem>> {
    try {
      const items = await fetchAllActivity(username);
      return queryActivity(items, params);
    } catch (err) {
      throw toLookupException(err, username);
    }
  }

  async getUserCommunities(username: string): Promise<SubredditActivity[]> {
    try {
      const items = await fetchAllActivity(username);
      return communitiesFromActivity(items);
    } catch (err) {
      throw toLookupException(err, username);
    }
  }

  async getUserStatistics(username: string): Promise<ActivityStatistics> {
    try {
      const [profile, items] = await Promise.all([
        this.getUserProfile(username),
        fetchAllActivity(username),
      ]);

      const posts = items.filter((i): i is RedditPost => i.kind === "post");
      const comments = items.filter((i): i is RedditComment => i.kind === "comment");

      const activityByHour = new Array(24).fill(0);
      const activityByDayOfWeek = new Array(7).fill(0);
      const monthMap = new Map<string, { posts: number; comments: number }>();

      for (const item of items) {
        const date = new Date(item.createdAt);
        activityByHour[date.getHours()]++;
        activityByDayOfWeek[date.getDay()]++;
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(monthKey) ?? { posts: 0, comments: 0 };
        if (item.kind === "post") entry.posts++;
        else entry.comments++;
        monthMap.set(monthKey, entry);
      }

      const now = new Date();
      const activityByMonth: ActivityStatistics["activityByMonth"] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(key) ?? { posts: 0, comments: 0 };
        activityByMonth.push({
          month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          posts: entry.posts,
          comments: entry.comments,
        });
      }

      const mostUpvotedPost = posts.reduce<RedditPost | undefined>(
        (max, p) => (!max || p.score > max.score ? p : max),
        undefined
      );
      const mostUpvotedComment = comments.reduce<RedditComment | undefined>(
        (max, c) => (!max || c.score > max.score ? c : max),
        undefined
      );

      return {
        totalPosts: posts.length,
        totalComments: comments.length,
        averagePostScore:
          posts.length > 0
            ? Math.round(posts.reduce((s, p) => s + p.score, 0) / posts.length)
            : 0,
        averageCommentScore:
          comments.length > 0
            ? Math.round(comments.reduce((s, c) => s + c.score, 0) / comments.length)
            : 0,
        topSubreddits: communitiesFromActivity(items).slice(0, 8),
        activityByHour,
        activityByDayOfWeek,
        activityByMonth,
        mostUpvotedPost,
        mostUpvotedComment,
        accountAgeDays: Math.floor(
          (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    } catch (err) {
      if (err instanceof RedditLookupException) throw err;
      throw toLookupException(err, username);
    }
  }
}
