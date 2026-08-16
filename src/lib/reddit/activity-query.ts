import type {
  ActivityQueryParams,
  PaginatedResult,
  RedditActivityItem,
} from "./reddit-types";

/**
 * Shared search/filter/sort/paginate logic over an already-fetched batch of
 * activity items. Both `MockRedditProvider` and `ApiRedditProvider` fetch
 * (or generate) a batch of items up front and then run it through this same
 * function, so pagination/sorting/filtering behaves identically regardless
 * of which provider is active.
 *
 * Note for the real API provider: Reddit's own endpoints paginate with an
 * opaque `after` cursor, not page numbers, so `ApiRedditProvider` fetches a
 * bounded batch (Reddit's per-request max) and paginates that batch
 * client-side here. That's an accepted limitation for now — see the comment
 * in `api-provider.ts`.
 */
export function queryActivity(
  items: RedditActivityItem[],
  params: ActivityQueryParams
): PaginatedResult<RedditActivityItem> {
  let filtered = items;

  if (params.kind && params.kind !== "all") {
    filtered = filtered.filter((i) => i.kind === params.kind);
  }
  if (params.subreddit) {
    filtered = filtered.filter(
      (i) => i.subreddit.toLowerCase() === params.subreddit!.toLowerCase()
    );
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((i) => {
      const haystack =
        i.kind === "post" ? `${i.title} ${i.body ?? ""}` : `${i.body} ${i.postTitle}`;
      return haystack.toLowerCase().includes(q);
    });
  }
  if (params.timeRange && params.timeRange !== "all") {
    const rangeDays: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays[params.timeRange]);
    filtered = filtered.filter((i) => new Date(i.createdAt) >= cutoff);
  }

  const sort = params.sort ?? "new";
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "top":
        return b.score - a.score;
      case "old":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "controversial":
        return Math.abs(a.score - 50) - Math.abs(b.score - 50);
      case "new":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const pageSize = params.pageSize || 10;
  const page = params.page || 1;
  const start = (page - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    totalItems: sorted.length,
    totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
  };
}
