import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, ExternalLink, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RedditUserProfile } from "@/lib/reddit";
import { formatAbsoluteDate, formatAccountAge, formatScore } from "@/lib/utils";

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-center">
      <p className="text-lg font-semibold text-foreground sm:text-xl">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

export function ProfileHeader({
  profile,
  dataSource,
}: {
  profile: RedditUserProfile;
  dataSource: "mock" | "api";
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to search
      </Link>

      <div className="glass-card mt-5 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-violet to-accent-cyan text-xl font-semibold text-white sm:h-20 sm:w-20 sm:text-2xl">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                  u/{profile.username}
                </h1>
                {profile.isVerified && (
                  <Badge variant="cyan">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    Verified
                  </Badge>
                )}
                {profile.isGold && (
                  <Badge variant="violet">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    Gold
                  </Badge>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                Member for {formatAccountAge(profile.createdAt)} · joined{" "}
                {formatAbsoluteDate(profile.createdAt)}
              </p>
              {profile.bio && (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{profile.bio}</p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <Badge variant={dataSource === "api" ? "emerald" : "neutral"}>
              {dataSource === "api" ? "Live Reddit data" : "Mock data"}
            </Badge>
            <a
              href={`https://www.reddit.com/user/${profile.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              View on Reddit
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <StatBlock label="Total karma" value={formatScore(profile.totalKarma)} />
          <StatBlock label="Post karma" value={formatScore(profile.postKarma)} />
          <StatBlock label="Comment karma" value={formatScore(profile.commentKarma)} />
        </div>
      </div>
    </div>
  );
}
