"use client";

import { useState } from "react";
import { ProfileHeader } from "./profile-header";
import { DashboardTabs, type DashboardTab } from "./dashboard-tabs";
import { OverviewTab } from "./overview-tab";
import { TimelineTab } from "./timeline-tab";
import { ActivityBrowser } from "./activity-browser";
import { CommunitiesTab } from "./communities-tab";
import { StatisticsTab } from "./statistics-tab";
import type {
  ActivityStatistics,
  PaginatedResult,
  RedditActivityItem,
  RedditUserProfile,
  SubredditActivity,
} from "@/lib/reddit";

export function ProfileDashboard({
  username,
  profile,
  dataSource,
  initialActivity,
  communities,
  statistics,
}: {
  username: string;
  profile: RedditUserProfile;
  dataSource: "mock" | "api";
  initialActivity: PaginatedResult<RedditActivityItem>;
  communities: SubredditActivity[];
  statistics: ActivityStatistics;
}) {
  const [tab, setTab] = useState<DashboardTab>("overview");
  const subredditOptions = communities.map((c) => c.subreddit);

  return (
    <div className="pb-20">
      <ProfileHeader profile={profile} dataSource={dataSource} />

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <DashboardTabs active={tab} onChange={setTab} />

        <div className="pt-6">
          {tab === "overview" && (
            <OverviewTab
              recentActivity={initialActivity.items}
              communities={communities}
              statistics={statistics}
              onNavigateTab={setTab}
            />
          )}
          {tab === "timeline" && (
            <TimelineTab username={username} subredditOptions={subredditOptions} />
          )}
          {tab === "posts" && (
            <ActivityBrowser
              username={username}
              kind="post"
              subredditOptions={subredditOptions}
              emptyLabel="No posts match these filters."
            />
          )}
          {tab === "comments" && (
            <ActivityBrowser
              username={username}
              kind="comment"
              subredditOptions={subredditOptions}
              emptyLabel="No comments match these filters."
            />
          )}
          {tab === "communities" && <CommunitiesTab communities={communities} />}
          {tab === "statistics" && <StatisticsTab statistics={statistics} />}
        </div>
      </div>
    </div>
  );
}
