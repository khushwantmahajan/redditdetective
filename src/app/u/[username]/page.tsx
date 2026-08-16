import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarDays, Sparkles, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Badge } from "@/components/ui/badge";
import { getRedditProvider, RedditLookupException, type RedditUserProfile } from "@/lib/reddit";
import {
  formatAccountAge,
  formatCompactNumber,
  isValidRedditUsername,
  normalizeUsernameInput,
} from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  return { title: `u/${username}` };
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-surface">
        <AlertTriangle className="h-6 w-6 text-accent-amber" aria-hidden />
      </div>
      <h1 className="mt-6 text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent-cyan hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Try another username
      </Link>
    </div>
  );
}

function errorContentFor(username: string, exception: RedditLookupException) {
  switch (exception.error.type) {
    case "invalid_username":
      return {
        title: "That doesn't look like a valid username",
        description:
          "Reddit usernames are 3–20 characters and can only contain letters, numbers, underscores, and hyphens.",
      };
    case "not_found":
      return {
        title: `u/${username} couldn't be found`,
        description:
          "This account may have been deleted, or the username may be misspelled. Double-check the spelling and try again.",
      };
    case "suspended":
      return {
        title: `u/${username} is suspended`,
        description: "Reddit has suspended this account, so no public activity is available.",
      };
    case "private_or_restricted":
      return {
        title: `u/${username}'s activity is private`,
        description: "This account's public activity is restricted and can't be explored.",
      };
    case "rate_limited":
      return {
        title: "Too many requests",
        description: "We're being rate limited right now. Please wait a moment and try again.",
      };
    default:
      return {
        title: "Something went wrong",
        description: exception.message,
      };
  }
}

function ProfileTeaser({ profile }: { profile: RedditUserProfile }) {
  const accountAgeLabel = formatAccountAge(profile.createdAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to search
      </Link>

      <div className="glass-card mt-8 rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-violet to-accent-cyan text-2xl font-semibold text-white">
          {profile.username.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-foreground">u/{profile.username}</h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          Reddit member for {accountAgeLabel}
        </p>

        <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xl font-semibold text-foreground">
              {formatCompactNumber(profile.totalKarma)}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" aria-hidden />
              Total karma
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-xl font-semibold text-foreground">
              {formatCompactNumber(profile.postKarma)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Post karma</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-white/[0.015] p-6">
          <Badge variant="violet" className="mx-auto w-fit">
            <Sparkles className="h-3 w-3" aria-hidden />
            Coming in Phase 2
          </Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The full profile dashboard — posts, comments, communities, statistics, activity
            timeline, and the AI evidence system — is being built next. This teaser confirms the
            Reddit data layer and username lookup are working end-to-end on mock data.
          </p>
        </div>
      </div>
    </div>
  );
}

async function loadProfile(
  username: string
): Promise<{ profile: RedditUserProfile } | { errorContent: { title: string; description: string } }> {
  if (!isValidRedditUsername(username)) {
    return {
      errorContent: errorContentFor(
        username,
        new RedditLookupException({ type: "invalid_username", username })
      ),
    };
  }

  try {
    const profile = await getRedditProvider().getUserProfile(username);
    return { profile };
  } catch (err) {
    const exception =
      err instanceof RedditLookupException
        ? err
        : new RedditLookupException({ type: "unknown", message: "Unexpected error." });
    return { errorContent: errorContentFor(username, exception) };
  }
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username: rawUsername } = await params;
  const username = normalizeUsernameInput(decodeURIComponent(rawUsername));
  const result = await loadProfile(username);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {"profile" in result ? (
          <ProfileTeaser profile={result.profile} />
        ) : (
          <ErrorState
            title={result.errorContent.title}
            description={result.errorContent.description}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
