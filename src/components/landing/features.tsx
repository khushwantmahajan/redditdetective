import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Clock,
  FileSearch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const FEATURES: Feature[] = [
  {
    icon: Sparkles,
    title: "AI profile summary",
    description:
      "A concise overview of an account's public interests and topics — generated only from what's actually posted, never guessed.",
    accent: "from-accent-violet/20 to-accent-violet/5 text-violet-300",
  },
  {
    icon: FileSearch,
    title: "Evidence for every claim",
    description:
      "Click \"Show evidence\" on any AI observation to see the exact posts and comments it's based on, linked back to Reddit.",
    accent: "from-accent-cyan/20 to-accent-cyan/5 text-cyan-300",
  },
  {
    icon: Clock,
    title: "Activity timeline",
    description:
      "A chronological view of posts and comments across every community, so you can see how activity evolves over time.",
    accent: "from-accent-amber/20 to-accent-amber/5 text-amber-300",
  },
  {
    icon: BarChart3,
    title: "Deep statistics",
    description:
      "Karma trends, posting cadence by hour and weekday, top communities, and average engagement — all in one dashboard.",
    accent: "from-accent-emerald/20 to-accent-emerald/5 text-emerald-300",
  },
  {
    icon: MessageSquareText,
    title: "Full post & comment history",
    description:
      "Search, filter, sort, and page through public posts and comments, with direct links back to the original Reddit thread.",
    accent: "from-accent-rose/20 to-accent-rose/5 text-rose-300",
  },
  {
    icon: ShieldCheck,
    title: "Privacy-conscious by design",
    description:
      "Only legitimately public data is used. RedditDetective never infers sensitive attributes or makes psychological judgments.",
    accent: "from-accent-violet/20 to-accent-cyan/10 text-indigo-300",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand an account
          </h2>
          <p className="mt-4 text-lg text-muted">
            Built to be more transparent, more thorough, and more useful than existing Reddit
            lookup tools.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-white/20"
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent}`}
              >
                <feature.icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
