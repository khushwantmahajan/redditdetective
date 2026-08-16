import type { RedditProvider } from "./reddit-provider";
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

/* -------------------------------------------------------------------------
 * Deterministic seeded RNG so a given username always produces the same
 * "realistic" mock activity across requests, without needing a database.
 * ---------------------------------------------------------------------- */

function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class SeededGenerator {
  private rand: () => number;

  constructor(seed: number) {
    this.rand = mulberry32(seed);
  }

  next(): number {
    return this.rand();
  }

  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  pickMultiple<T>(arr: readonly T[], count: number): T[] {
    const pool = [...arr];
    const result: T[] = [];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = this.int(0, pool.length - 1);
      result.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return result;
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }
}

/* -------------------------------------------------------------------------
 * Topic clusters: the building blocks of a generated persona. Every mock
 * account is active in a handful of these, which keeps its activity
 * thematically coherent (and gives the AI summary something real to find).
 * ---------------------------------------------------------------------- */

interface TopicCluster {
  name: string;
  subreddits: string[];
  postTitles: string[];
  postBodies: string[];
  commentBodies: string[];
  flairs: string[];
}

const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    name: "Programming & Web Development",
    subreddits: ["programming", "webdev", "reactjs", "typescript", "learnprogramming"],
    postTitles: [
      "What's your go-to pattern for handling async state in React?",
      "Finally shipped my side project built with Next.js and TypeScript",
      "Why I switched from REST to tRPC for internal tools",
      "Struggling with a memory leak in a Node.js service — advice?",
      "A clean way to type API responses without duplicating your backend types",
      "Benchmarking Bun vs Node for a small API service",
    ],
    postBodies: [
      "Been wrestling with this for a few days. Tried a few approaches, curious what's worked for others at scale.",
      "Wrote up the architecture and lessons learned in case it helps anyone starting a similar project.",
      "Not sure if this is a config issue or something deeper — logs and repro steps included.",
    ],
    commentBodies: [
      "This is the way. Saved me a lot of headaches once I adopted this pattern.",
      "Have you tried profiling it with the built-in dev tools first? Usually points right at the culprit.",
      "Solid write-up. One thing I'd add is watching out for stale closures in the effect.",
      "We moved to this exact setup at work last quarter, no regrets so far.",
      "Counterpoint: this works well until you need SSR, then it gets messy fast.",
    ],
    flairs: ["Discussion", "Help", "Show and Tell", "Question"],
  },
  {
    name: "Gaming",
    subreddits: ["gaming", "pcgaming", "patientgamers", "IndieGaming"],
    postTitles: [
      "Just finished this on hard mode, absolutely worth the frustration",
      "Underrated indie title that deserves way more attention",
      "PSA: this settings tweak fixed my stutter on release day",
      "What's the last game that genuinely surprised you?",
    ],
    postBodies: [
      "Took me about 40 hours but the pacing really paid off near the end.",
      "Picked this up on a whim during a sale and it's become my comfort game.",
    ],
    commentBodies: [
      "Same experience here, the last act really ties everything together.",
      "Adding this to my backlog, thanks for the writeup.",
      "The soundtrack alone is worth the price of admission.",
      "Fully agree, it's a shame more people haven't played this.",
    ],
    flairs: ["Discussion", "Review", "PSA"],
  },
  {
    name: "Personal Finance",
    subreddits: ["personalfinance", "investing", "financialindependence"],
    postTitles: [
      "How aggressive should my emergency fund be with a stable job?",
      "Finally hit a savings milestone after 3 years of budgeting",
      "Rebalancing after a big life change — sanity check appreciated",
    ],
    postBodies: [
      "Numbers and context in the comments. Mostly looking for a gut check on the plan.",
      "Wanted to share in case the timeline is useful for anyone else planning something similar.",
    ],
    commentBodies: [
      "Congrats, that's a great milestone — the first few years are the hardest.",
      "I'd double check the tax implications before making that move.",
      "This is roughly the allocation I landed on too after a lot of reading.",
    ],
    flairs: ["Planning", "Milestone", "Advice"],
  },
  {
    name: "Fitness",
    subreddits: ["Fitness", "running", "bodyweightfitness"],
    postTitles: [
      "6 months of consistent training, here's what actually moved the needle",
      "How do you stay motivated during a plateau?",
      "Finished my first half marathon this weekend",
    ],
    postBodies: [
      "Sharing the routine in case it helps someone starting out. Nothing fancy, just consistency.",
      "Honestly didn't think I'd make it past mile 9 but the crowd support helped a ton.",
    ],
    commentBodies: [
      "Consistency really is the whole game, nice work.",
      "Plateaus are brutal, deloading for a week helped me a lot.",
      "That's a great time for a first half, congrats!",
    ],
    flairs: ["Progress Pic", "Discussion", "Race Report"],
  },
  {
    name: "Cooking & Food",
    subreddits: ["Cooking", "AskCulinary", "MealPrepSunday"],
    postTitles: [
      "Meal prepped for the week, would love feedback on the balance",
      "What's the one technique that leveled up your cooking the most?",
      "Recreated a restaurant dish after months of trying to get the sauce right",
    ],
    postBodies: [
      "Recipe and macros in the comments if anyone wants the breakdown.",
      "Took a lot of failed attempts but finally nailed the reduction.",
    ],
    commentBodies: [
      "Looks great, how did you keep the rice from drying out reheated?",
      "Braising low and slow is honestly a cheat code once you get comfortable with it.",
      "That plating is restaurant quality, nice work.",
    ],
    flairs: ["Recipe", "Question", "Technique"],
  },
  {
    name: "Movies & TV",
    subreddits: ["movies", "television", "TrueFilm"],
    postTitles: [
      "Just watched this for the first time and I understand the hype now",
      "Unpopular opinion: the sequel is better paced than the original",
      "This season finale completely recontextualizes the first half",
    ],
    postBodies: [
      "No major spoilers below, just general thoughts on pacing and structure.",
      "Curious if others felt the same way about the third act.",
    ],
    commentBodies: [
      "Completely agree, the editing in that sequence was masterful.",
      "I was mixed on it but the performances carried a lot of the weaker scenes.",
      "This take is criminally underrated, glad someone else said it.",
    ],
    flairs: ["Discussion", "Review"],
  },
  {
    name: "Science & Technology",
    subreddits: ["science", "technology", "Futurology"],
    postTitles: [
      "New study on this topic just dropped, results are surprising",
      "Where do you think this technology realistically lands in 5 years?",
      "This explains a lot about why the earlier approach didn't scale",
    ],
    postBodies: [
      "Link to the paper in case anyone wants to read the methodology directly.",
      "Genuinely curious what people closer to the field think about the timeline.",
    ],
    commentBodies: [
      "The methodology section is worth reading before drawing conclusions from the headline.",
      "This tracks with what I've seen in adjacent research the past year.",
      "Five years feels optimistic but directionally I think this is right.",
    ],
    flairs: ["Discussion", "News"],
  },
  {
    name: "DIY & Home",
    subreddits: ["DIY", "HomeImprovement", "houseplants"],
    postTitles: [
      "Finished the weekend project, way more satisfying than expected",
      "What's the one tool you wish you'd bought sooner?",
      "This plant went from struggling to thriving after one change",
    ],
    postBodies: [
      "First time doing this myself, happy to answer questions about the process.",
      "Took some trial and error but sharing what worked in the end.",
    ],
    commentBodies: [
      "Great result for a first attempt, the finish looks clean.",
      "Wish I'd known this before my last project, saving this comment.",
      "Turns out it was a drainage issue the whole time for me too.",
    ],
    flairs: ["Finished", "Question", "Before/After"],
  },
];

const RESERVED_DEMO_USERNAMES: Record<
  string,
  "not_found" | "suspended" | "private_or_restricted"
> = {
  deleted_user: "not_found",
  ghostuser404: "not_found",
  shadowbanned_demo: "suspended",
  suspended_demo: "suspended",
  private_demo: "private_or_restricted",
  restricted_demo: "private_or_restricted",
};

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;

function simulateLatency(minMs = 350, maxMs = 850): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/* -------------------------------------------------------------------------
 * Persona / activity generation
 * ---------------------------------------------------------------------- */

interface GeneratedAccount {
  profile: RedditUserProfile;
  items: RedditActivityItem[];
  communities: SubredditActivity[];
}

const accountCache = new Map<string, GeneratedAccount>();

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function randomDateBetween(gen: SeededGenerator, startDaysAgo: number, endDaysAgo: number): Date {
  const days = gen.int(endDaysAgo, startDaysAgo);
  const date = daysAgo(days);
  date.setHours(gen.int(0, 23), gen.int(0, 59), gen.int(0, 59));
  return date;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function generateAccount(username: string): GeneratedAccount {
  const cached = accountCache.get(username.toLowerCase());
  if (cached) return cached;

  const seed = hashStringToSeed(username.toLowerCase());
  const gen = new SeededGenerator(seed);

  const accountAgeDays = gen.int(120, 2600);
  const createdAt = daysAgo(accountAgeDays);

  const clusterCount = gen.int(2, 4);
  const clusters = gen.pickMultiple(TOPIC_CLUSTERS, clusterCount);

  // Weight clusters so the persona has a clear "primary" interest.
  const weights = clusters.map((_, i) => (i === 0 ? gen.int(40, 55) : gen.int(10, 30)));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const totalItems = gen.int(60, 160);
  const items: RedditActivityItem[] = [];
  const subredditStats = new Map<string, { posts: number; comments: number; score: number; last: Date }>();

  let postIdCounter = 0;
  let commentIdCounter = 0;

  clusters.forEach((cluster, clusterIndex) => {
    const clusterShare = weights[clusterIndex] / weightSum;
    const clusterItemCount = Math.max(3, Math.round(totalItems * clusterShare));
    const postRatio = 0.35;

    for (let i = 0; i < clusterItemCount; i++) {
      const isPost = gen.bool(postRatio);
      const subreddit = gen.pick(cluster.subreddits);
      const createdDate = randomDateBetween(gen, accountAgeDays, 0);
      const score = Math.max(1, Math.round(gen.int(1, 40) * (gen.bool(0.08) ? gen.int(5, 40) : 1)));

      const stat = subredditStats.get(subreddit) ?? { posts: 0, comments: 0, score: 0, last: createdDate };
      stat.score += score;
      if (createdDate > stat.last) stat.last = createdDate;

      if (isPost) {
        postIdCounter++;
        const title = gen.pick(cluster.postTitles);
        const id = `p_${slugify(username)}_${postIdCounter}`;
        const postType = gen.bool(0.75) ? "text" : gen.pick(["link", "image", "video"] as const);
        const post: RedditPost = {
          id,
          kind: "post",
          title,
          body: postType === "text" ? gen.pick(cluster.postBodies) : undefined,
          subreddit,
          author: username,
          score,
          upvoteRatio: Math.round((0.7 + gen.next() * 0.29) * 100) / 100,
          numComments: gen.int(0, 120),
          createdAt: createdDate.toISOString(),
          permalink: `/r/${subreddit}/comments/${id}/${slugify(title)}/`,
          url: postType === "link" ? `https://example.com/article-${postIdCounter}` : undefined,
          flair: gen.bool(0.6) ? gen.pick(cluster.flairs) : undefined,
          isNsfw: false,
          isStickied: false,
          awards: gen.bool(0.12) ? gen.int(1, 3) : 0,
          postType,
        };
        items.push(post);
        stat.posts++;
      } else {
        commentIdCounter++;
        const id = `c_${slugify(username)}_${commentIdCounter}`;
        const postTitle = gen.pick(cluster.postTitles);
        const comment: RedditComment = {
          id,
          kind: "comment",
          body: gen.pick(cluster.commentBodies),
          subreddit,
          author: username,
          score,
          createdAt: createdDate.toISOString(),
          permalink: `/r/${subreddit}/comments/post_${commentIdCounter}/${slugify(postTitle)}/${id}/`,
          postTitle,
          postId: `post_${commentIdCounter}`,
          isNsfw: false,
          awards: gen.bool(0.05) ? 1 : 0,
          depth: gen.int(0, 3),
        };
        items.push(comment);
        stat.comments++;
      }

      subredditStats.set(subreddit, stat);
    }
  });

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalActivity = items.length;
  const communities: SubredditActivity[] = Array.from(subredditStats.entries())
    .map(([subreddit, stat]) => ({
      subreddit,
      postCount: stat.posts,
      commentCount: stat.comments,
      totalScore: stat.score,
      activityShare: (stat.posts + stat.comments) / totalActivity,
      lastActiveAt: stat.last.toISOString(),
    }))
    .sort((a, b) => b.activityShare - a.activityShare);

  const postKarma = items
    .filter((i): i is RedditPost => i.kind === "post")
    .reduce((sum, p) => sum + p.score, 0);
  const commentKarma = items
    .filter((i): i is RedditComment => i.kind === "comment")
    .reduce((sum, c) => sum + c.score, 0);

  const profile: RedditUserProfile = {
    username,
    createdAt: createdAt.toISOString(),
    commentKarma: commentKarma + gen.int(0, 500),
    postKarma: postKarma + gen.int(0, 500),
    totalKarma: 0,
    isVerified: gen.bool(0.1),
    isGold: gen.bool(0.08),
    bio: gen.bool(0.3) ? "Just here for the discussions." : undefined,
  };
  profile.totalKarma = profile.commentKarma + profile.postKarma;

  const account: GeneratedAccount = { profile, items, communities };
  accountCache.set(username.toLowerCase(), account);
  return account;
}

/* -------------------------------------------------------------------------
 * Provider implementation
 * ---------------------------------------------------------------------- */

function validateUsernameOrThrow(username: string): void {
  if (!USERNAME_PATTERN.test(username)) {
    throw new RedditLookupException({ type: "invalid_username", username });
  }
  const reserved = RESERVED_DEMO_USERNAMES[username.toLowerCase()];
  if (reserved) {
    throw new RedditLookupException({ type: reserved, username });
  }
}

export class MockRedditProvider implements RedditProvider {
  async getUserProfile(username: string): Promise<RedditUserProfile> {
    await simulateLatency();
    validateUsernameOrThrow(username);
    return generateAccount(username).profile;
  }

  async getUserActivity(
    username: string,
    params: ActivityQueryParams
  ): Promise<PaginatedResult<RedditActivityItem>> {
    await simulateLatency();
    validateUsernameOrThrow(username);
    const { items } = generateAccount(username);
    return queryActivity(items, params);
  }

  async getUserCommunities(username: string): Promise<SubredditActivity[]> {
    await simulateLatency();
    validateUsernameOrThrow(username);
    return generateAccount(username).communities;
  }

  async getUserStatistics(username: string): Promise<ActivityStatistics> {
    await simulateLatency();
    validateUsernameOrThrow(username);
    const { items, communities, profile } = generateAccount(username);

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
        posts.length > 0 ? Math.round(posts.reduce((s, p) => s + p.score, 0) / posts.length) : 0,
      averageCommentScore:
        comments.length > 0
          ? Math.round(comments.reduce((s, c) => s + c.score, 0) / comments.length)
          : 0,
      topSubreddits: communities.slice(0, 8),
      activityByHour,
      activityByDayOfWeek,
      activityByMonth,
      mostUpvotedPost,
      mostUpvotedComment,
      accountAgeDays: Math.floor(
        (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }
}
