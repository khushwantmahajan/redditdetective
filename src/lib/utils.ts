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
