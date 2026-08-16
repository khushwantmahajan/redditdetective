import { NextResponse, type NextRequest } from "next/server";
import {
  getRedditProvider,
  RedditLookupException,
  type ActivityQueryParams,
  type ContentKind,
  type SortOption,
  type TimeRange,
} from "@/lib/reddit";
import { isValidRedditUsername, normalizeUsernameInput } from "@/lib/utils";

const SORT_OPTIONS: readonly SortOption[] = ["new", "top", "controversial", "old"];
const TIME_RANGES: readonly TimeRange[] = ["day", "week", "month", "year", "all"];
const KINDS: readonly ContentKind[] = ["post", "comment"];

function statusForErrorType(type: RedditLookupException["error"]["type"]): number {
  switch (type) {
    case "invalid_username":
      return 400;
    case "not_found":
      return 404;
    case "suspended":
    case "private_or_restricted":
      return 403;
    case "rate_limited":
      return 429;
    case "network_error":
      return 502;
    case "unknown":
    default:
      return 500;
  }
}

/**
 * Server-side activity endpoint the profile dashboard's client components
 * call when the user changes tab/sort/filter/search/page. Keeping this
 * behind a route handler (rather than calling the provider directly from
 * client code) is what lets `ApiRedditProvider`'s Reddit credentials stay
 * server-only once real API access is live — the browser only ever talks to
 * this route, never to Reddit or oauth.reddit.com directly.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/reddit/[username]/activity">) {
  const { username: rawUsername } = await ctx.params;
  const username = normalizeUsernameInput(decodeURIComponent(rawUsername));

  if (!isValidRedditUsername(username)) {
    return NextResponse.json(
      { error: { type: "invalid_username", username } },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const kindParam = searchParams.get("kind");
  const sortParam = searchParams.get("sort");
  const timeRangeParam = searchParams.get("timeRange");

  const params: ActivityQueryParams = {
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    pageSize: Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10)),
    kind: kindParam && KINDS.includes(kindParam as ContentKind) ? (kindParam as ContentKind) : "all",
    sort: sortParam && SORT_OPTIONS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "new",
    timeRange:
      timeRangeParam && TIME_RANGES.includes(timeRangeParam as TimeRange)
        ? (timeRangeParam as TimeRange)
        : "all",
    search: searchParams.get("search")?.trim() || undefined,
    subreddit: searchParams.get("subreddit")?.trim() || undefined,
  };

  try {
    const result = await getRedditProvider().getUserActivity(username, params);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof RedditLookupException) {
      return NextResponse.json(
        { error: err.error },
        { status: statusForErrorType(err.error.type) }
      );
    }
    return NextResponse.json(
      { error: { type: "unknown", message: "Unexpected error." } },
      { status: 500 }
    );
  }
}
