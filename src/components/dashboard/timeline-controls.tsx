"use client";

import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search, X } from "lucide-react";
import type { ContentKind, TimeRange } from "@/lib/reddit";
import { cn } from "@/lib/utils";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  day: "Past day",
  week: "Past week",
  month: "Past month",
  year: "Past year",
  all: "All time",
};

const KIND_OPTIONS: { value: ContentKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "post", label: "Posts" },
  { value: "comment", label: "Comments" },
];

export function TimelineControls({
  search,
  onSearchChange,
  kind,
  onKindChange,
  timeRange,
  onTimeRangeChange,
  subreddit,
  onSubredditChange,
  subredditOptions,
  direction,
  onDirectionChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  kind: ContentKind | "all";
  onKindChange: (value: ContentKind | "all") => void;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  subreddit: string;
  onSubredditChange: (value: string) => void;
  subredditOptions: string[];
  direction: "new" | "old";
  onDirectionChange: (value: "new" | "old") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search this user's activity..."
          aria-label="Search activity"
          className="h-9 w-full rounded-lg border border-white/10 bg-white/[0.02] pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-white/20 focus:border-accent-violet/50 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      <div role="group" aria-label="Filter by activity type" className="flex rounded-lg border border-white/10 p-0.5">
        {KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onKindChange(opt.value)}
            aria-pressed={kind === opt.value}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              kind === opt.value
                ? "bg-white/10 text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {subredditOptions.length > 0 && (
        <select
          value={subreddit}
          onChange={(e) => onSubredditChange(e.target.value)}
          aria-label="Filter by subreddit"
          className="h-9 max-w-[160px] rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-sm text-foreground transition-colors hover:border-white/20 focus:border-accent-violet/50 focus:outline-none"
        >
          <option value="" className="bg-surface text-foreground">
            All subreddits
          </option>
          {subredditOptions.map((sr) => (
            <option key={sr} value={sr} className="bg-surface text-foreground">
              r/{sr}
            </option>
          ))}
        </select>
      )}

      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        aria-label="Date range"
        className="h-9 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-sm text-foreground transition-colors hover:border-white/20 focus:border-accent-violet/50 focus:outline-none"
      >
        {(Object.keys(TIME_RANGE_LABELS) as TimeRange[]).map((tr) => (
          <option key={tr} value={tr} className="bg-surface text-foreground">
            {TIME_RANGE_LABELS[tr]}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onDirectionChange(direction === "new" ? "old" : "new")}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-sm text-foreground transition-colors hover:border-white/20"
        aria-label={direction === "new" ? "Showing newest first" : "Showing oldest first"}
      >
        {direction === "new" ? (
          <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ArrowUpWideNarrow className="h-3.5 w-3.5" aria-hidden />
        )}
        {direction === "new" ? "Newest first" : "Oldest first"}
      </button>
    </div>
  );
}
