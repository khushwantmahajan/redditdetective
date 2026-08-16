import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Basic client-side syntactic validation matching Reddit's username rules. */
export function isValidRedditUsername(username: string): boolean {
  return /^[A-Za-z0-9_-]{3,20}$/.test(username);
}

/**
 * Normalizes anything a user might paste into the search box down to a bare
 * username. Accepts, and all resolve to `"spez"`:
 *  - `spez`
 *  - `u/spez` / `/u/spez`
 *  - `https://www.reddit.com/user/spez/` (or `/u/spez`, old.reddit.com, no
 *    scheme, trailing path segments like `/submitted`, etc.)
 */
export function normalizeUsernameInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (/(^|\.)reddit\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/\/u(?:ser)?\/([^/]+)/i);
      if (match) return match[1];
    }
  } catch {
    // Not a parseable URL — fall through to plain-text handling below.
  }

  return trimmed.replace(/^\/?u\//i, "").replace(/\/+$/, "");
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value
  );
}

/** Human-readable account age (e.g. "2 years", "5 months"), computed from an ISO date. */
export function formatAccountAge(createdAtIso: string, asOfMs: number = Date.now()): string {
  const days = Math.floor((asOfMs - new Date(createdAtIso).getTime()) / (1000 * 60 * 60 * 24));
  if (days > 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"}`;
  }
  const months = Math.max(1, Math.floor(days / 30));
  return `${months} month${months === 1 ? "" : "s"}`;
}

/** Absolute date for tooltips/titles, e.g. "Mar 4, 2019". */
export function formatAbsoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Relative time ("just now", "5m ago", "3d ago", "2y ago") for activity feeds. */
export function formatRelativeTime(iso: string, asOfMs: number = Date.now()): string {
  const seconds = Math.max(0, Math.floor((asOfMs - new Date(iso).getTime()) / 1000));
  const UNITS: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [unitSeconds, label] of UNITS) {
    if (seconds >= unitSeconds) {
      return `${Math.floor(seconds / unitSeconds)}${label} ago`;
    }
  }
  return "just now";
}

/** Signed, compact karma/score display, e.g. "1.2k", "-42", "0". */
export function formatScore(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${formatCompactNumber(Math.abs(value))}`;
}

/** Absolute date + time for timeline entries, e.g. "Mar 4, 2019, 2:15 PM". */
export function formatAbsoluteDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Day-grouping label for a timeline, e.g. "Today", "Yesterday", or
 * "Monday, August 10" (with a year appended if not the current year).
 * Grouping is by local calendar day, not a rolling 24h window.
 */
export function formatDateGroupLabel(iso: string, asOfMs: number = Date.now()): string {
  const date = new Date(iso);
  const now = new Date(asOfMs);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
