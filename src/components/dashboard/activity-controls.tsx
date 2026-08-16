"use client";

import { Search, X } from "lucide-react";
import type { SortOption, TimeRange } from "@/lib/reddit";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<SortOption, string> = {
  new: "New",
  top: "Top",
  controversial: "Controversial",
  old: "Old",
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  day: "Past day",
  week: "Past week",
  month: "Past month",
  year: "Past year",
  all: "All time",
};

function Select<T extends string>({
  value,
  onChange,
  options,
  labels,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  labels: Record<T, string>;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      aria-label={ariaLabel}
      className="h-9 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-sm text-foreground transition-colors hover:border-white/20 focus:border-accent-violet/50 focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-surface text-foreground">
          {labels[opt]}
        </option>
      ))}
    </select>
  );
}

export function ActivityControls({
  search,
  onSearchChange,
  sort,
  onSortChange,
  timeRange,
  onTimeRangeChange,
  subreddit,
  onSubredditChange,
  subredditOptions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  subreddit: string;
  onSubredditChange: (value: string) => void;
  subredditOptions: string[];
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

      {subredditOptions.length > 0 && (
        <select
          value={subreddit}
          onChange={(e) => onSubredditChange(e.target.value)}
          aria-label="Filter by subreddit"
          className={cn(
            "h-9 max-w-[160px] rounded-lg border border-white/10 bg-white/[0.02] px-2.5 text-sm text-foreground transition-colors hover:border-white/20 focus:border-accent-violet/50 focus:outline-none"
          )}
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

      <Select value={sort} onChange={onSortChange} options={Object.keys(SORT_LABELS) as SortOption[]} labels={SORT_LABELS} ariaLabel="Sort by" />
      <Select
        value={timeRange}
        onChange={onTimeRangeChange}
        options={Object.keys(TIME_RANGE_LABELS) as TimeRange[]}
        labels={TIME_RANGE_LABELS}
        ariaLabel="Time range"
      />
    </div>
  );
}
