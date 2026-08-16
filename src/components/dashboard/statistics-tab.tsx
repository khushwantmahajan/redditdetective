import { ArrowBigUp, MessageSquare } from "lucide-react";
import { BarChart } from "./bar-chart";
import { ActivityItemCard } from "./activity-item-card";
import type { ActivityStatistics } from "@/lib/reddit";
import { formatScore } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function StatisticsTab({ statistics }: { statistics: ActivityStatistics }) {
  const hourData = statistics.activityByHour.map((value, hour) => ({
    label: hour % 3 === 0 ? String(hour) : "",
    value,
  }));
  const dayData = statistics.activityByDayOfWeek.map((value, i) => ({
    label: DAY_LABELS[i],
    value,
  }));
  const monthData = statistics.activityByMonth.map((m) => ({
    label: m.month,
    value: m.posts + m.comments,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total posts" value={String(statistics.totalPosts)} />
        <StatCard label="Total comments" value={String(statistics.totalComments)} />
        <StatCard label="Avg. post score" value={formatScore(statistics.averagePostScore)} />
        <StatCard label="Avg. comment score" value={formatScore(statistics.averageCommentScore)} />
      </div>

      <ChartCard title="Activity by month (last 12 months)">
        <BarChart data={monthData} />
      </ChartCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard title="Activity by hour of day">
          <BarChart data={hourData} />
        </ChartCard>
        <ChartCard title="Activity by day of week">
          <BarChart data={dayData} />
        </ChartCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {statistics.mostUpvotedPost && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ArrowBigUp className="h-4 w-4 text-accent-violet" aria-hidden />
              Most upvoted post
            </h3>
            <ActivityItemCard item={statistics.mostUpvotedPost} />
          </div>
        )}
        {statistics.mostUpvotedComment && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4 text-accent-cyan" aria-hidden />
              Most upvoted comment
            </h3>
            <ActivityItemCard item={statistics.mostUpvotedComment} />
          </div>
        )}
      </div>
    </div>
  );
}
