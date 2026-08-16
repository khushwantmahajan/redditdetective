/**
 * Low-level Reddit Data API client: OAuth2 "application only" (client_credentials)
 * token handling plus a thin authenticated fetch wrapper.
 *
 * This file talks to Reddit's real API. It knows nothing about our domain
 * types (RedditPost, RedditUserProfile, ...) — that mapping lives in
 * `api-provider.ts`. Keeping the two separate means this file can be tested
 * / swapped independently of how we shape data for the UI.
 *
 * Reference (official docs, verified August 2026):
 *  - Registration & approval process: https://support.reddithelp.com/hc/en-us/articles/14945211791892
 *  - Data API Wiki (OAuth requirement, User-Agent rules): https://support.reddithelp.com/hc/en-us/articles/16160319875092
 *  - OAuth2 technical mechanics (token endpoint, grant types): https://github.com/reddit-archive/reddit/wiki/OAuth2
 *  - Data API Terms: https://www.redditinc.com/policies/data-api-terms
 *  - Developer Terms: https://www.redditinc.com/policies/developer-terms
 *
 * IMPORTANT: this client has not been exercised against a real Reddit
 * account yet — RedditDetective does not have approved API credentials as
 * of this writing. It's implemented carefully against Reddit's documented,
 * long-stable API shape, but treat it as untested until REDDIT_CLIENT_ID /
 * REDDIT_CLIENT_SECRET are configured and someone runs a real lookup.
 */

const TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const API_BASE = "https://oauth.reddit.com";

interface TokenState {
  accessToken: string;
  expiresAt: number; // ms epoch
}

let cachedToken: TokenState | null = null;
let inFlightTokenRequest: Promise<string> | null = null;

/** Reads the four Reddit env vars. Never log or expose these values. */
function readRedditEnv() {
  return {
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    userAgent: process.env.REDDIT_USER_AGENT,
    // Not used by the client_credentials ("app-only") flow this client uses today —
    // reserved for a future "sign in with Reddit" feature (authorization_code flow).
    redirectUri: process.env.REDDIT_REDIRECT_URI,
  };
}

/**
 * True once the minimum credentials needed for read-only, app-only access
 * are present. `getRedditProvider()` (in `index.ts`) uses this to decide
 * whether it's safe to hand out the real provider instead of the mock one.
 */
export function isRedditApiConfigured(): boolean {
  const { clientId, clientSecret, userAgent } = readRedditEnv();
  return Boolean(clientId && clientSecret && userAgent);
}

class RedditApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "RedditApiError";
  }
}

/**
 * Fetches (and caches) an app-only OAuth token via the client_credentials
 * grant. This grant is for "confidential clients (web apps / scripts) not
 * acting on behalf of one or more logged out users" — exactly our case,
 * since RedditDetective only reads public data and never asks a visitor to
 * log into Reddit. App-only tokens never come with a refresh_token, so we
 * just re-request a new one once the cached one is close to expiring.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 30_000 > now) {
    return cachedToken.accessToken;
  }
  if (inFlightTokenRequest) {
    return inFlightTokenRequest;
  }

  const { clientId, clientSecret, userAgent } = readRedditEnv();
  if (!clientId || !clientSecret || !userAgent) {
    throw new RedditApiError(
      "Reddit API credentials are not configured (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET / REDDIT_USER_AGENT).",
      0
    );
  }

  inFlightTokenRequest = (async () => {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": userAgent,
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) {
      throw new RedditApiError(
        `Failed to obtain Reddit access token (HTTP ${response.status}).`,
        response.status
      );
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.accessToken;
  })();

  try {
    return await inFlightTokenRequest;
  } finally {
    inFlightTokenRequest = null;
  }
}

/**
 * Authenticated GET against oauth.reddit.com. Retries once on a 401 (token
 * might have just expired server-side) by forcing a fresh token.
 */
export async function redditGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  const { userAgent } = readRedditEnv();
  if (!userAgent) {
    throw new RedditApiError("REDDIT_USER_AGENT is not configured.", 0);
  }

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const url = `${API_BASE}${path}${query.toString() ? `?${query.toString()}` : ""}`;

  const doFetch = async (token: string) =>
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": userAgent,
      },
      // Public data changes constantly; let each request go through rather
      // than serving a stale Next.js fetch cache entry.
      cache: "no-store",
    });

  let token = await getAccessToken();
  let response = await doFetch(token);

  if (response.status === 401) {
    cachedToken = null;
    token = await getAccessToken();
    response = await doFetch(token);
  }

  if (response.status === 404) {
    throw new RedditApiError("Not found.", 404);
  }
  if (response.status === 403) {
    throw new RedditApiError("Forbidden (private or restricted).", 403);
  }
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    throw new RedditApiError(
      "Rate limited by Reddit.",
      429,
      Number.isFinite(retryAfter) ? retryAfter : undefined
    );
  }
  if (!response.ok) {
    throw new RedditApiError(`Reddit API error (HTTP ${response.status}).`, response.status);
  }

  return (await response.json()) as T;
}

export { RedditApiError };
