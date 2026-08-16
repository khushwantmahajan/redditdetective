import { ArrowRight, FileText, MessageSquare, TrendingUp, Users } from "lucide-react";
import { ActivityItemCard } from "./activity-item-card";
import type { ActivityStatistics, RedditActivityItem, SubredditActivity } from "@/lib/reddit";
import { formatScore } from "@/lib/utils";

function QuickStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <Icon className="h-4 w-4 text-accent-violet" aria-hidden />
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function OverviewTab({
  recentActivity,
  communities,
  statistics,
  onNavigateTab,
}: {
  recentActivity: RedditActivityItem[];
  communities: SubredditActivity[];
  statistics: ActivityStatistics;
  onNavigateTab: (tab: "posts" | "comments" | "communities" | "statistics") => void;
}) {
  const topCommunities = communities.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickStat icon={FileText} label="Posts" value={String(statistics.totalPosts)} />
        <QuickStat icon={MessageSquare} label="Comments" value={String(statistics.totalComments)} />
        <QuickStat icon={Users} label="Active communities" value={String(communities.length)} />
        <QuickStat
          icon={TrendingUp}
          label="Avg. post score"
          value={formatScore(statistics.averagePostScore)}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          <button
            type="button"
            onClick={() => onNavigateTab("posts")}
            className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden />
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((item) => (
            <ActivityItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Top communities</h2>
          <button
            type="button"
            onClick={() => onNavigateTab("communities")}
            className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
          >
            View all
            <ArrowRight className="h-3 w-3" aria-hidden />
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {topCommunities.map((c) => (
            <div key={c.subreddit} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-foreground">r/{c.subreddit}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(c.activityShare * 100)}% of activity
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
