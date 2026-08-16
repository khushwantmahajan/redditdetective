"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, History, Inbox, Loader2, RotateCcw } from "lucide-react";
import { TimelineControls } from "./timeline-controls";
import { TimelineItem } from "./timeline-item";
import type { ContentKind, RedditActivityItem, TimeRange } from "@/lib/reddit";
import { formatDateGroupLabel } from "@/lib/utils";

const PAGE_SIZE = 15;

interface ApiErrorBody {
  error: { type: string; message?: string };
}

interface Meta {
  totalPages: number;
  totalItems: number;
}

type FetchState =
  | { key: string; status: "success" }
  | { key: string; status: "error"; message: string };

function groupByDate(items: RedditActivityItem[]): { label: string; items: RedditActivityItem[] }[] {
  const groups: { label: string; items: RedditActivityItem[] }[] = [];
  for (const item of items) {
    const label = formatDateGroupLabel(item.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-8 w-8 shrink-0 rounded-full bg-white/10" />
          <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="h-3 w-1/3 rounded bg-white/5" />
            <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
            <div className="mt-2 h-3 w-full rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimelineTab({
  username,
  subredditOptions,
}: {
  username: string;
  subredditOptions: string[];
}) {
  const [rawSearch, setRawSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kind, setKind] = useState<ContentKind | "all">("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [subreddit, setSubreddit] = useState("");
  const [direction, setDirection] = useState<"new" | "old">("new");
  const [page, setPage] = useState(1);
  const [retryNonce, setRetryNonce] = useState(0);

  const [items, setItems] = useState<RedditActivityItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [fetchState, setFetchState] = useState<FetchState | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(rawSearch.trim()), 350);
    return () => clearTimeout(timer);
  }, [rawSearch]);

  // Adjust state during render when a filter changes — see the note in
  // ActivityBrowser (Phase 2) for why this avoids react-hooks/set-state-in-effect
  // rather than doing this reset inside a useEffect.
  const filterKey = [kind, direction, timeRange, subreddit, debouncedSearch].join("|");
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
    setItems([]);
    setMeta(null);
  }

  const requestKey = [username, filterKey, page, retryNonce].join("|");

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams({
      kind,
      sort: direction,
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
        return (await res.json()) as {
          items: RedditActivityItem[];
          totalPages: number;
          totalItems: number;
        };
      })
      .then((json) => {
        setItems((prev) => (page === 1 ? json.items : [...prev, ...json.items]));
        setMeta({ totalPages: json.totalPages, totalItems: json.totalItems });
        setFetchState({ key: requestKey, status: "success" });
      })
      .catch((err: unknown) => {
        if ((err as Error).name === "AbortError") return;
        setFetchState({
          key: requestKey,
          status: "error",
          message: (err as Error).message || "Something went wrong loading this activity.",
        });
      });

    return () => controller.abort();
  }, [requestKey, username, kind, direction, timeRange, subreddit, debouncedSearch, page]);

  const isCurrent = fetchState?.key === requestKey;
  const loading = !isCurrent;
  const error = isCurrent && fetchState.status === "error" ? fetchState.message : null;
  const isInitialLoad = loading && items.length === 0;
  const isLoadingMore = loading && items.length > 0;
  const hasMore = meta ? page < meta.totalPages : false;
  const groups = groupByDate(items);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <History className="h-4 w-4" aria-hidden />
        Chronological view of every public post and comment, newest activity{" "}
        {direction === "new" ? "first" : "last"}.
      </div>

      <TimelineControls
        search={rawSearch}
        onSearchChange={setRawSearch}
        kind={kind}
        onKindChange={setKind}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        subreddit={subreddit}
        onSubredditChange={setSubreddit}
        subredditOptions={subredditOptions}
        direction={direction}
        onDirectionChange={setDirection}
      />

      <div className="mt-6">
        {isInitialLoad && <TimelineSkeleton />}

        {!isInitialLoad && error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
            <AlertTriangle className="h-5 w-5 text-accent-amber" aria-hidden />
            <p className="text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={() => setRetryNonce((n) => n + 1)}
              className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-white/20"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Try again
            </button>
          </div>
        )}

        {!isInitialLoad && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-12 text-center">
            <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted">No activity matches these filters.</p>
          </div>
        )}

        {items.length > 0 &&
          groups.map((group) => (
            <div key={group.label} className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h3>
              <div>
                {group.items.map((item, i) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={
                      group === groups[groups.length - 1] && i === group.items.length - 1
                    }
                  />
                ))}
              </div>
            </div>
          ))}

        {items.length > 0 && (
          <div className="flex flex-col items-center gap-3 pt-2">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Loading more...
              </div>
            )}
            {!isLoadingMore && error && (
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-xs text-muted">{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryNonce((n) => n + 1)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-white/20"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Try again
                </button>
              </div>
            )}
            {!isLoadingMore && !error && hasMore && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-white/20 hover:bg-white/[0.05]"
              >
                Load more
              </button>
            )}
            {!isLoadingMore && !error && !hasMore && meta && (
              <p className="text-xs text-muted-foreground">
                That&apos;s all {meta.totalItems} matching items.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
