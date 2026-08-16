"use client";

import { BarChart3, FileText, LayoutGrid, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "posts" | "comments" | "communities" | "statistics";

const TABS: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "communities", label: "Communities", icon: Users },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
];

export function DashboardTabs({
  active,
  onChange,
}: {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      className="scrollbar-none flex gap-1 overflow-x-auto border-b border-white/10"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
            active === id
              ? "border-accent-violet text-foreground"
              : "border-transparent text-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
