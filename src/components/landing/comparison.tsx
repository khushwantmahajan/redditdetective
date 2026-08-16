import { Check, Minus } from "lucide-react";

interface ComparisonRow {
  capability: string;
  redditDetective: boolean;
  ghostddit: boolean;
}

const ROWS: ComparisonRow[] = [
  { capability: "Public posts & comment history", redditDetective: true, ghostddit: true },
  { capability: "Sort, filter, and search results", redditDetective: true, ghostddit: true },
  { capability: "Karma & activity statistics dashboard", redditDetective: true, ghostddit: false },
  { capability: "Activity timeline & posting patterns", redditDetective: true, ghostddit: false },
  { capability: "AI profile summary", redditDetective: true, ghostddit: false },
  { capability: "Evidence links for every AI observation", redditDetective: true, ghostddit: false },
  { capability: "Community / subreddit breakdown", redditDetective: true, ghostddit: false },
  { capability: "Modern, dashboard-style interface", redditDetective: true, ghostddit: false },
];

function Cell({ included }: { included: boolean }) {
  return included ? (
    <Check className="mx-auto h-4.5 w-4.5 text-accent-emerald" aria-label="Included" />
  ) : (
    <Minus className="mx-auto h-4.5 w-4.5 text-muted-foreground/50" aria-label="Not offered" />
  );
}

export function Comparison() {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How RedditDetective compares
          </h2>
          <p className="mt-4 text-lg text-muted">
            Both tools work from public Reddit data. RedditDetective adds analytics, an
            evidence-backed AI layer, and a dashboard built for exploring an account in depth.
          </p>
        </div>

        <div className="glass-card mt-12 overflow-x-auto rounded-2xl">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[1fr_9rem_8rem] items-center gap-x-4 border-b border-white/10 px-5 py-4 sm:gap-x-8 sm:px-8">
              <span className="text-sm font-medium text-muted-foreground">Capability</span>
              <span className="text-center text-sm font-semibold text-foreground">
                RedditDetective
              </span>
              <span className="text-center text-sm font-medium text-muted-foreground">
                Ghostddit
              </span>
            </div>
            {ROWS.map((row, i) => (
              <div
                key={row.capability}
                className={`grid grid-cols-[1fr_9rem_8rem] items-center gap-x-4 px-5 py-3.5 text-sm sm:gap-x-8 sm:px-8 ${
                  i % 2 === 1 ? "bg-white/[0.015]" : ""
                }`}
              >
                <span className="text-foreground/90">{row.capability}</span>
                <span>
                  <Cell included={row.redditDetective} />
                </span>
                <span>
                  <Cell included={row.ghostddit} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
          Swipe to see the full comparison →
        </p>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Feature comparison based on Ghostddit&apos;s publicly documented capabilities as of{" "}
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Both
          tools only surface data Reddit already makes public.
        </p>
      </div>
    </section>
  );
}
