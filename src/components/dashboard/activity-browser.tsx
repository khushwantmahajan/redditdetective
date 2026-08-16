"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { ActivityControls } from "./activity-controls";
import { ActivityItemCard } from "./activity-item-card";
import { PaginationControls } from "./pagination-controls";
import type { ContentKind, PaginatedResult, RedditActivityItem, SortOption, TimeRange } from "@/lib/reddit";

const PAGE_SIZE = 10;

interface ApiErrorBody {
  error: { type: string; message?: string };
}

interface FetchResult {
  key: string;
  data: PaginatedResult<RedditActivityItem> | null;
  error: string | null;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="mt-2 h-3 w-full rounded bg-white/5" />
      <div className="mt-1.5 h-3 w-2/3 rounded bg-white/5" />
      <div className="mt-3 h-3 w-1/3 rounded bg-white/5" />
    </div>
  );
}

export function ActivityBrowser({
  username,
  kind,
  subredditOptions,
  emptyLabel,
}: {
  username: string;
  kind: ContentKind | "all";
  subredditOptions: string[];
  emptyLabel: string;
}) {
  const [rawSearch, setRawSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("new");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [subreddit, setSubreddit] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the free-text search so we don't fire a request per keystroke.
  // (setTimeout callback, not the effect body itself, so this doesn't hit
  // the "no setState synchronously in an effect" rule.)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(rawSearch.trim()), 350);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  const requestKey = [username, kind, sort, timeRange, subreddit, debouncedSearch, page].join("|");

  // Reset back to page 1 whenever a filter (other than page itself) changes.
  // Adjusting state during render — rather than in an effect — is the
  // pattern React recommends for "derived state that resets on a dependency
  // change"; see https://react.dev/learn/you-might-not-need-an-effect.
  const filterKey = [kind, sort, timeRange, subreddit, debouncedSearch].join("|");
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    if (page !== 1) setPage(1);
  }

  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      kind,
      sort,
      timeRange,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (subreddit) params.set("subreddit", subreddit);

    fetch(`/api/reddit/${encodeURIComponent(username)}/activity?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
          throw new Error(body?.error?.message ?? "Couldn't load this activity right now.");
        }
        return (await res.json()) as PaginatedResult<RedditActivityItem>;
      })
      .then((json) => setResult({ key: requestKey, data: json, error: null }))
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setResult({
          key: requestKey,
          data: null,
          error: (err as Error).message || "Something went wrong loading this activity.",
        });
      });

    return () => controller.abort();
  }, [requestKey, username, kind, sort, timeRange, subreddit, debouncedSearch, page]);

  const isCurrent = result?.key === requestKey;
  const loading = !isCurrent;
  const data = isCurrent ? result.data : null;
  const error = isCurrent ? result.error : null;

  return (
    <div>
      <ActivityControls
        search={rawSearch}
        onSearchChange={setRawSearch}
        sort={sort}
        onSortChange={setSort}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        subreddit={subreddit}
        onSubredditChange={setSubreddit}
        subredditOptions={subredditOptions}
      />

      <div className="mt-4 space-y-3">
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
            <AlertTriangle className="h-5 w-5 text-accent-amber" aria-hidden />
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && data && data.items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-12 text-center">
            <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted">{emptyLabel}</p>
          </div>
        )}

        {!loading &&
          !error &&
          data &&
          data.items.map((item) => <ActivityItemCard key={item.id} item={item} />)}
      </div>

      {!loading && !error && data && (
        <PaginationControls
          page={data.page}
          totalPages={data.totalPages}
          totalItems={data.totalItems}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
