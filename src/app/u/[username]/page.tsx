import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ProfileDashboard } from "@/components/dashboard/profile-dashboard";
import {
  getActiveRedditDataSource,
  getRedditProvider,
  RedditLookupException,
  type ActivityStatistics,
  type PaginatedResult,
  type RedditActivityItem,
  type RedditUserProfile,
  type SubredditActivity,
} from "@/lib/reddit";
import { isValidRedditUsername, normalizeUsernameInput } from "@/lib/utils";

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

interface DashboardData {
  profile: RedditUserProfile;
  activity: PaginatedResult<RedditActivityItem>;
  communities: SubredditActivity[];
  statistics: ActivityStatistics;
}

async function loadDashboardData(
  username: string
): Promise<{ data: DashboardData } | { errorContent: { title: string; description: string } }> {
  if (!isValidRedditUsername(username)) {
    return {
      errorContent: errorContentFor(
        username,
        new RedditLookupException({ type: "invalid_username", username })
      ),
    };
  }

  try {
    const provider = getRedditProvider();
    // Fetch the profile first — if the account doesn't exist/is suspended,
    // there's no point firing off the other three requests.
    const profile = await provider.getUserProfile(username);
    const [activity, communities, statistics] = await Promise.all([
      provider.getUserActivity(username, { page: 1, pageSize: 10, sort: "new", kind: "all" }),
      provider.getUserCommunities(username),
      provider.getUserStatistics(username),
    ]);
    return { data: { profile, activity, communities, statistics } };
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
  const result = await loadDashboardData(username);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {"data" in result ? (
          <ProfileDashboard
            username={username}
            profile={result.data.profile}
            dataSource={getActiveRedditDataSource()}
            initialActivity={result.data.activity}
            communities={result.data.communities}
            statistics={result.data.statistics}
          />
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
