import { Sparkles, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SAMPLE_EVIDENCE = [
  { subreddit: "r/reactjs", excerpt: "What's your go-to pattern for handling async state..." },
  { subreddit: "r/typescript", excerpt: "A clean way to type API responses without..." },
  { subreddit: "r/webdev", excerpt: "Finally shipped my side project built with Next.js..." },
];

export function AiInsightsPreview() {
  return (
    <section id="ai-insights" className="relative py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Badge variant="cyan" className="mb-5">
            <Sparkles className="h-3 w-3" aria-hidden />
            AI Profile Summary
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Insights you can actually verify
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            RedditDetective&apos;s AI never presents a guess as a fact. Every observation is
            written from evidence in the account&apos;s own public posts and comments — and you
            can inspect that evidence with one click.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
              Describes topics and interests, never psychological or personal traits
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
              Links straight back to the original Reddit post or comment
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-emerald" />
              Clearly labeled as potentially incomplete or imperfect
            </li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div className="flex items-start gap-3 border-b border-white/10 pb-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan">
              <Sparkles className="h-4 w-4 text-white" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Programming and web development is one of the primary topics in this account&apos;s
                public activity.
              </p>
              <Badge variant="emerald" className="mt-2">
                High confidence
              </Badge>
            </div>
          </div>

          <div className="pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Show evidence (3)
            </p>
            <div className="space-y-2.5">
              {SAMPLE_EVIDENCE.map((item) => (
                <div
                  key={item.excerpt}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground/90">{item.excerpt}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.subreddit}</p>
                  </div>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
