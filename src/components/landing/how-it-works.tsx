import { Search, ScanSearch, FileCheck2 } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Enter a username",
    description: "Type any public Reddit username — no account, login, or API key needed.",
  },
  {
    icon: ScanSearch,
    step: "02",
    title: "We analyze public activity",
    description:
      "Posts, comments, subreddits, and timing patterns are gathered and organized into a clear dashboard.",
  },
  {
    icon: FileCheck2,
    step: "03",
    title: "Review AI insights with evidence",
    description:
      "Every AI observation links back to the specific posts and comments that support it — so you can verify it yourself.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted">Three steps, no setup required.</p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div
            className="absolute top-9 left-[16.5%] right-[16.5%] hidden h-px bg-gradient-to-r from-accent-violet/40 via-white/10 to-accent-cyan/40 sm:block"
            aria-hidden
          />
          {STEPS.map(({ icon: Icon, step, title, description }) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/10 bg-surface shadow-lg shadow-black/40">
                <Icon className="h-7 w-7 text-accent-violet" aria-hidden />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan text-[11px] font-semibold text-white">
                  {step.replace("0", "")}
                </span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
