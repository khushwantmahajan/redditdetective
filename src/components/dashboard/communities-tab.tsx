import { MessageSquare, FileText } from "lucide-react";
import type { SubredditActivity } from "@/lib/reddit";
import { formatRelativeTime, formatScore } from "@/lib/utils";

export function CommunitiesTab({ communities }: { communities: SubredditActivity[] }) {
  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-12 text-center">
        <p className="text-sm text-muted">No community activity found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {communities.map((c) => (
        <a
          key={c.subreddit}
          href={`https://www.reddit.com/r/${c.subreddit}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">r/{c.subreddit}</h3>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(c.lastActiveAt)}
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-violet to-accent-cyan"
              style={{ width: `${Math.round(c.activityShare * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {Math.round(c.activityShare * 100)}% of activity
          </p>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              {c.postCount} posts
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {c.commentCount} comments
            </span>
            <span className="ml-auto font-medium text-foreground">
              {formatScore(c.totalScore)} karma
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
