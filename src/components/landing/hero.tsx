import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { UsernameSearch } from "./username-search";
import { Badge } from "@/components/ui/badge";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "100% public data only" },
  { icon: Zap, label: "No login or signup required" },
  { icon: Sparkles, label: "Evidence-backed AI insights" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div
        className="pointer-events-none absolute inset-0 bg-grid bg-radial-fade opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-12rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-violet/20 via-accent-cyan/10 to-transparent blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Badge variant="violet" className="animate-pulse-glow mb-6">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI-powered public activity analysis
        </Badge>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Understand any Reddit account,{" "}
          <span className="text-gradient-brand">backed by evidence</span>
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted sm:text-xl">
          Enter a public username to explore posts, comments, communities, and activity
          patterns — with an AI summary that links every observation back to the content
          that supports it.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <UsernameSearch />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted">
              <Icon className="h-4 w-4 text-accent-emerald" aria-hidden />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
